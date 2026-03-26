const prisma = require('../../middleware/prisma');
const { createClient } = require('@deepgram/sdk');
const { VertexAI } = require('@google-cloud/vertexai');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

const DEFAULT_GCP_PROJECT_ID = 'coral-hydra-471209-b4';

const loadGoogleServiceAccount = () => {
    const fromEnvJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (fromEnvJson) {
        try {
            const parsed = JSON.parse(fromEnvJson);
            // Secrets Manager often stores \n escaped in private_key.
            if (parsed.private_key) {
                parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
            }
            return parsed;
        } catch (error) {
            console.error("FATAL ERROR: GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON.", error);
            process.exit(1);
        }
    }

    const credentialsPathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const candidatePaths = [];
    if (credentialsPathEnv) {
        candidatePaths.push(
            path.isAbsolute(credentialsPathEnv)
                ? credentialsPathEnv
                : path.resolve(process.cwd(), credentialsPathEnv)
        );
    }

    // Local development fallback.
    candidatePaths.push(path.join(__dirname, '../../..', 'coral-hydra-471209-b4-d065fd90bf50.json'));

    for (const filePath of candidatePaths) {
        try {
            if (fs.existsSync(filePath)) {
                const keyFileContent = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(keyFileContent);
            }
        } catch (error) {
            console.error(`FATAL ERROR: Could not read or parse Google service account file at ${filePath}.`, error);
            process.exit(1);
        }
    }

    console.error(
        "FATAL ERROR: No Google credentials found. Set GOOGLE_APPLICATION_CREDENTIALS_JSON (recommended for ECS) or GOOGLE_APPLICATION_CREDENTIALS path."
    );
    process.exit(1);
};

const serviceAccount = loadGoogleServiceAccount();

const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT || serviceAccount.project_id || DEFAULT_GCP_PROJECT_ID,
    location: "us-central1",
    googleAuthOptions: {
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
    },
  });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const HAIVEN_BOT_USER_ID = 100; // The static ID for the Haiven AI user.

// --- UPDATED: Added the detailed system instruction to the text model ---
const systemInstruction = {
    parts: [{
        text: `You are "Haivens," a compassionate and supportive mental health assistant. Your primary goal is to provide a safe, non-judgmental space for users to express their feelings.
- Your tone should always be warm, gentle, and empathetic.
- Gradually build rapport with the user by remembering details from the chat history. Refer back to things they've said.
- Provide gentle support, tips, and advice when appropriate, but always frame it as a suggestion, not a command. Example: "Sometimes when I feel overwhelmed, a short breathing exercise can help. Would you be open to trying one?"
- Never give medical diagnoses or act as a replacement for a therapist.
- If the user expresses thoughts of self-harm or harming others, you MUST immediately provide resources for professional help. Start your response with: "It sounds like you are going through a very difficult time. Your safety is the most important thing, and it's brave of you to talk about this. Please reach out to a crisis hotline or a mental health professional who can provide you with the immediate support you deserve. You can call or text 988 in the US and Canada to connect with the Suicide & Crisis Lifeline."`
    }]
};

/**
 * A single, unified function to handle all bot responses.
 * @param {string} userMessage The user's input. For AUDIO_ONLY, this is the text to be read.
 * @param {Array} chatHistory The previous messages in the conversation.
 * @param {string} responseType Can be 'TEXT_ONLY', 'AUDIO_ONLY', or 'TEXT_AND_AUDIO'.
 * @returns {Promise<{text: string | null, audioData: string | null}>}
 */
// 1. A model specifically for fast text generation
const textModel = vertex_ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: systemInstruction 
});

// 2. Standard TextToSpeechClient for audio generation
const ttsClient = new TextToSpeechClient({
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
    }
});

// TTS Request formats for different providers
const TTS_PROVIDERS = {
    DEEPGRAM: async (text, voiceConfig) => {
        // voiceConfig would be something like 'aura-2-hyperion-en'
        const url = `https://api.deepgram.com/v1/speak?model=${voiceConfig || 'aura-2-hyperion-en'}&encoding=linear16&container=wav`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error(`Deepgram error: ${response.statusText}`);
        return response.body; // Return the stream
    },

    OPENAI: async (text, voiceConfig) => {
        // voiceConfig would be something like 'alloy' or 'shimmer'
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: voiceConfig || 'alloy'
            })
        });
        if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
        return response.body; // Return the stream
    }
};

// Function to get TEXT ONLY using the appropriate model
const getBotTextResponse = async (userMessage, chatHistory = [], therapistId = null) => {
    try {
        const chat = textModel.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const textPart = response?.candidates?.[0]?.content?.parts?.find(part => part.text);
        if (textPart) {
            return textPart.text;
        }
        return "I'm having trouble forming a response. Please try again.";
    } catch (error) {
        console.error("Error in getBotTextResponse:", error);
        return "I'm having a little trouble connecting right now.";
    }
};

const splitIntoSentences = (text) => {
    if (!text) return [];
    // Splits on . ! or ? followed by a space, avoiding common abbreviations
    const sentenceRegex = /([.?!])\s+(?=[A-Z0-9])/g;
    return text.replace(sentenceRegex, "$1|").split("|").map(s => s.trim()).filter(s => s.length > 0);
};

const sanitizeTextForTTS = (text) => {
    if (!text || typeof text !== 'string') return '';

    return text
        // Remove fenced code blocks.
        .replace(/```[\s\S]*?```/g, ' ')
        // Remove inline code markers.
        .replace(/`([^`]*)`/g, '$1')
        // Remove markdown headings/quotes/list bullets at line starts.
        .replace(/^\s{0,3}(#{1,6}\s+|>\s+|[-*+]\s+|\d+\.\s+)/gm, '')
        // Remove markdown emphasis markers and common bullet symbols.
        .replace(/[*_~•]/g, '')
        // Collapse repeated whitespace/newlines.
        .replace(/\s+/g, ' ')
        .trim();
};

const getTherapistTTSConfig = async (therapistId) => {
    try {
        const therapist = await prisma.therapist.findUnique({
            where: { id: therapistId },
            // Example fields: provider ('DEEPGRAM'), voiceModel ('aura-2-hyperion-en')
            select: { provider: true, voiceId: true } 
        });
        return therapist || { provider: 'DEEPGRAM', voiceId: 'aura-2-hyperion-en' };
    } catch (error) {
        return { provider: 'DEEPGRAM', voiceId: 'aura-2-hyperion-en' };
    }
};

const getTextToSpeechAudio = async (textToSpeak, therapistId = 1) => {
    const safeTextToSpeak = sanitizeTextForTTS(textToSpeak);
    console.log(`Generating TTS for therapist ID ${therapistId} with text:`, safeTextToSpeak);
    try {
        if (!safeTextToSpeak) return null;

        // 1. Get the specific config for this therapist
        const { provider, voiceId } = await getTherapistTTSConfig(therapistId);

        console.log(`Using TTS provider ${provider} with voice ID ${voiceId}`);
        // 2. Call the strategy based on the provider
        const ttsStream = await TTS_PROVIDERS[provider](safeTextToSpeak, voiceId);

        // 3. Process the stream into Base64 (Standard across all providers)
        const reader = ttsStream.getReader();
        let chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);
        return buffer.toString('base64');

    } catch (error) {
        console.error('TTS General Error:', error);
        return null;
    }
};

// const getAudioBuffer = async (response) => {
//     const reader = response.getReader();
//     const chunks = [];
//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         chunks.push(value);
//     }
//     return Buffer.concat(chunks);
// };

exports.getRemainingAudio = async (req, res) => {
    const { text, therapistId } = req.body;
    const sanitizedText = sanitizeTextForTTS(text);
    const allSentences = splitIntoSentences(sanitizedText);
    
    // We only process the NEXT 3 sentences, not the whole rest
    const nextBatch = allSentences.slice(0, 3);
    const leftoverText = allSentences.slice(3).join(" ");

    try {
        const audioChunks = await Promise.all(
            nextBatch.map(s => getTextToSpeechAudio(s, therapistId))
        );

        res.status(200).json({ 
            audioChunks: audioChunks.filter(c => c !== null),
            remainingText: leftoverText, // Send the "rest of the rest" back
            hasMore: leftoverText.length > 0 
        });
    } catch (error) {
        res.status(500).json({ error: "Chunking error" });
    }
};

exports.handleChatMessage = async (req, res) => {
    let { sessionId, message, responseType, therapistId } = req.body;
    tId = therapistId ? parseInt(therapistId) : null;
    const user = req.user;

    if (!message || !responseType) {
        return res.status(400).json({ error: 'Message and responseType are required' });
    }

    try {
        let chatSession;
        if (responseType !== 'AUDIO_ONLY' && !sessionId) {
            chatSession = await prisma.chatSession.create({ 
                data: { 
                    userId: user.id, 
                    title: message.substring(0, 30) || 'New Chat' 
                } 
            });
            sessionId = chatSession.id;
        } else if (sessionId) {
            chatSession = await prisma.chatSession.findFirst({ 
                where: { id: parseInt(sessionId), userId: user.id } 
            });
        }
        if (responseType !== 'AUDIO_ONLY' && !chatSession) return res.status(404).json({ error: 'Chat session not found' });
        
        if (responseType !== 'AUDIO_ONLY') {
            await prisma.chatMessage.create({ 
                data: { 
                    content: message, 
                    sender: 'USER', 
                    sessionId: chatSession.id, 
                } 
            });
        }

        const historyFromDB = chatSession ? await prisma.chatMessage.findMany({ 
            where: { 
                sessionId: chatSession.id }, 
                orderBy: { createdAt: 'asc' }, 
                take: 20 
            }) : [];

        const formattedHistory = historyFromDB.map(msg => ({ role: msg.sender === 'USER' ? 'user' : 'model', parts: [{ text: msg.content }] }));

        let botResponseText = null;
        let audioContent = null;

        // The controller now calls the correct specialized function for each case
        switch (responseType) {
            case 'TEXT_ONLY':
                botResponseText = await getBotTextResponse(message, formattedHistory, therapistId);
                break;
            case 'AUDIO_ONLY': {
                const sanitizedMessage = sanitizeTextForTTS(message);
                const sentences = splitIntoSentences(sanitizedMessage);
                const firstBatch = sentences.slice(0, 2); // Get the first 2 sentences
                const remainingText = sentences.slice(2).join(" "); // Keep the rest

                // Parallel synthesize the first two sentences for speed
                const audioChunks = await Promise.all(
                    firstBatch.map(s => getTextToSpeechAudio(s, therapistId))
                );

                // Return the initial audio and the text for the background fetch
                return res.status(200).json({
                    audioChunks: audioChunks.filter(c => c !== null),
                    remainingText: remainingText,
                    hasMore: remainingText.length > 0
                });
                break;
            }
            case 'TEXT_AND_AUDIO': {
                const botResponseText = await getBotTextResponse(message, formattedHistory);
                
                // 2. NOW split the AI's response into sentences for audio
                const sanitizedBotResponseText = sanitizeTextForTTS(botResponseText);
                const sentences = splitIntoSentences(sanitizedBotResponseText);
                const firstBatch = sentences.slice(0, 2);
                const remainingText = sentences.slice(2).join(" ");

                // 3. Synthesize only the first batch of the AI's response
                const audioChunks = await Promise.all(
                    firstBatch.map(s => getTextToSpeechAudio(s, therapistId))
                );

                let botMessage = null;
                if (botResponseText) {
                    botMessage = await prisma.chatMessage.create({
                        data: { content: botResponseText, 
                            sender: 'BOT', 
                            sessionId: chatSession.id,
                            therapistId: tId
                        },
                        include: { 
                            therapist: {
                                select: { imageUrl: true, name: true }
                            } // Include therapist info in the response for frontend use
                        }
                    });
                }

                console.log("Print the bot message with therapist info:", botMessage);

                return res.status(200).json({
                    sessionId: chatSession.id,
                    reply: botMessage,
                    audioData: audioChunks.filter(c => c !== null), // Note: This is an array of chunks
                    remainingText: remainingText,
                    hasMore: remainingText.length > 0
                });
            }
            default:
                return res.status(400).json({ error: 'Invalid responseType' });
        }

        let botMessage = null;
        if (botResponseText) {
            botMessage = await prisma.chatMessage.create({
                data: { content: botResponseText, 
                    sender: 'BOT', 
                    sessionId: chatSession.id, 
                    therapistId: therapistId ? parseInt(therapistId) : null 
                },
                include: { 
                    therapist: {
                        select: { imageUrl: true, name: true }
                    }
                }
            });
        }
        
        res.status(200).json({
            sessionId: chatSession?.id,
            reply: botMessage,
            audioData: audioContent,
        });

    } catch (error) {
        console.error('Error handling chat message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add this helper function somewhere accessible in HaivenAI.js, 
// for consistency, you could place it near the existing history logic:

const formatMessagesForGemini = (messages) => {
    return messages.map(msg => {
        // Assuming messages come in as { sender: 'user' | 'bot', text: '...' }
        const role = msg.sender === 'user' ? 'user' : 'model';
        return { 
            role: role, 
            parts: [{ text: msg.text }] 
        };
    });
};

exports.getAITemporaryChat = async (req, res) => {
    const { message, context, responseType } = req.body;

    if (!message || !responseType) {
        return res.status(400).json({ error: 'Message and responseType are required' });
    }
    try {
        // *** FIX 1: Format the incoming context array ***
        const formattedHistory = formatMessagesForGemini(context || []); 
        
        console.log("Temporary chat formatted history:", formattedHistory);
        let botResponseText = null;

        // The user's new message must also be added to history before sending the prompt
        // but since we are using getBotTextResponse which takes a new message 
        // and history separately, we keep the call as is and just ensure history is formatted.

        switch (responseType) { 
            case 'TEXT_ONLY':
                // *** FIX 2: Pass the correctly formatted history ***
                botResponseText = await getBotTextResponse(message, formattedHistory); 
                break;
        }

        let botMessage = null;
        if (botResponseText) {
            // *** FIX 3: Ensure the returned botMessage is also structured with 'content' and 'sender'
            // to match what the frontend expects, as that's how it sends history back. ***
            botMessage = { content: botResponseText, sender: 'BOT', id: Date.now() };
        }

        res.status(200).json({
            reply: botMessage,
        });
    } catch (error) {
        // ... (rest of the error handling)
    }
};


/**
 * Generates an AI response based on a post's content and a user's question.
 */
exports.askHaivenInCommunity = async (req, res) => {
    const { postId } = req.params;
    // CORRECTED: Expect a simple string for the comment text.
    const { userCommentText } = req.body; 
    const userId = req.user.id;

    if (!userCommentText || !postId) {
        return res.status(400).json({ error: 'Post ID and user comment text are required.' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { title: true, content: true }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        // 1. Save the user's comment that tagged s.
        const createdUserComment = await prisma.comment.create({
            data: {
                text: userCommentText,
                postId: postId,
                authorId: userId,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true, } }
            }
        });

        // 2. Prepare the prompt for the AI.
        const question = userCommentText.replace(/@Haivens/gi, "").trim();
        const prompt = `${systemInstruction}, 
            Based on the following post, please answer the user's question concisely, since it is a comment reply,
            your role is to reply the user, do not try to follow up with a question at the end of your reply.
            Post Title: "${post.title}"
            Post Content: "${post.content}"
            User's Question: "${question}"
        `;

        const aiResponseText = await getBotTextResponse(prompt);

        // 3. Save the AI's response as a reply to the user's comment.
        const haivenResponseComment = await prisma.comment.create({
            data: {
                text: aiResponseText,
                postId: postId,
                authorId: HAIVEN_BOT_USER_ID,
                replyToId: createdUserComment.id 
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, } }
            }
        });

        // 4. Format both comments to match the structure your frontend expects.
        const formattedUserComment = {
            ...createdUserComment,
            authorName: `${createdUserComment.author.firstName || ''} ${createdUserComment.author.lastName || ''}`.trim(),
            profileImageUrl: createdUserComment.author.profileImageUrl || null,
            replies: [], // Initially empty
        };

        console.log("User comment saved:", formattedUserComment);

        const formattedHaivenComment = {
            ...haivenResponseComment,
            authorName: 'Haiven AI',
            replies: [],
        };
        
        // 5. Nest the AI reply inside the user's comment for the frontend response.
        formattedUserComment.replies.push(formattedHaivenComment);

        // 6. Return the user's comment, which now contains the AI's reply.
        res.status(201).json({ userComment: formattedUserComment });

    } catch (error) {
        console.error("Error asking Haiven in community:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getConvStartersSuggestions = async (req, res) => {
    try {
        let history = [];
        const userId = req.user.id;
        const tagProfile = await prisma.userTagProfile.findUnique({
            where: { userId },
        });

        let userTags = [];
        if (tagProfile && tagProfile.tags) {
            // Parse the JSON and get the top 5 tag names
            userTags = tagProfile.tags.map(t => t.tag);
        }

        const recentSessions = await prisma.chatSession.findMany({
            where: { userId: userId },
            orderBy: { updatedAt: 'desc' },
            take: 5, // Get the 3 most recent sessions
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 2, // Get the last 2 messages from each session
                },
            },
        });

        const latestMessages = recentSessions
            .flatMap(session => session.messages.map(msg => msg.content))
            .slice(0, 10); // Limit to 10 messages total

        const prompt = `
            You are a creative assistant that generates conversation starters.
            Your task is to generate 4 simple, first-person questions that a USER can click to send to their AI assistant (named Haiven).

            The questions must be phrased from the USER'S perspective, as if they are asking Haiven for help or information.

            CONTEXT:
            User's Top Interests: ${userTags.join(', ') || 'none'}
            User's Recent Messages: ${latestMessages.join('; ') || 'none'}

            EXAMPLES of the correct format:
            - "I'd like to talk more about mindfulness."
            - "Can you give me some tips for dealing with stress?"
            - "I'm feeling anxious today, can we talk?"
            - "What are some healthy recipes for when I'm feeling low?"
            - "Can we talk about feeling lonely?"

            RULES:
            1.  The questions must be from the USER (e.g., "I feel...", "Can you help me...", "I want to know...").
            2.  Keep questions concise and gentle.
            3.  Base some suggestions on the context provided.
            4.  Respond ONLY with a valid JSON object in the exact format:
            {
              "suggestions": [
                "Suggestion 1",
                "Suggestion 2",
                "Suggestion 3",
                "Suggestion 4"
              ]
            }
        `;
        
        // 4. Call the AI model directly (bypassing the Haiven system instruction)
        const chat = textModel.startChat({}); // Start a chat with no system prompt
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("AI suggestions response text:", responseText);

        if (!responseText) {
            throw new Error('No response from AI');
        }

        // 5. Parse the JSON response
        let suggestions = [];
        try {
            // Clean up the string in case the AI wraps it in markdown
            const jsonString = responseText
                .replace(/```json\n/g, '')
                .replace(/\n```/g, '')
                .trim();
            
            const parsedResponse = JSON.parse(jsonString);
            
            if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
                suggestions = parsedResponse.suggestions;
            }
        } catch (parseError) {
            console.error("Failed to parse AI JSON response:", parseError, "--- Response was:", responseText);
            // Fallback: If JSON parsing fails, just return a generic starter
            suggestions = ["How are you feeling today?"];
        }

        console.log("Final suggestions generated:", suggestions);

        // 6. Send the suggestions to the frontend
        res.status(200).json({ suggestions });

    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};