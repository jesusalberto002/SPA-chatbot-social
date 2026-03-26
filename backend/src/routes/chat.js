const express = require('express');
const chatController = require('../controllers/Users/chat');
const HaivenAIController = require('../controllers/Users/HaivenAI');

const router = express.Router();

router.get('/', chatController.getChatSessions);
router.post('/send', HaivenAIController.handleChatMessage);
router.post('/temporary-chat/send', HaivenAIController.getAITemporaryChat);
router.get('/history/:sessionId', chatController.getChatMessages);
router.delete('/delete/:sessionId', chatController.deleteChatSession);
router.patch('/rename/:sessionId', chatController.updateChatSessionTitle);

router.get('/chat-suggestions', HaivenAIController.getConvStartersSuggestions);

router.post('/get-remaining-audio', HaivenAIController.getRemainingAudio);

module.exports = router;