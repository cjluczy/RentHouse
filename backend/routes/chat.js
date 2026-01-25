const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 获取所有聊天消息
router.get('/', chatController.getChatMessages);

// 添加聊天消息
router.post('/', chatController.addChatMessage);

// 标记消息为已读
router.put('/:id/read', chatController.markAsRead);

module.exports = router;
