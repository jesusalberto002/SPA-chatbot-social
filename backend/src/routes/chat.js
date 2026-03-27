const express = require('express');
const chatController = require('../controllers/Users/chat');
const assistantAIController = require('../controllers/Users/assistantAI');

const router = express.Router();

router.get('/', chatController.getChatSessions);
router.post('/send', assistantAIController.handleChatMessage);
router.post('/temporary-chat/send', assistantAIController.getAITemporaryChat);
router.get('/history/:sessionId', chatController.getChatMessages);
router.delete('/delete/:sessionId', chatController.deleteChatSession);
router.patch('/rename/:sessionId', chatController.updateChatSessionTitle);

router.get('/chat-suggestions', assistantAIController.getConvStartersSuggestions);

router.post('/get-remaining-audio', assistantAIController.getRemainingAudio);

module.exports = router;