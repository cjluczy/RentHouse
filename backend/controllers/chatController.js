const { MOCK_CHAT_MESSAGES } = require('../models/data');

// 获取所有聊天消息
exports.getChatMessages = (req, res) => {
  res.json(MOCK_CHAT_MESSAGES);
};

// 添加聊天消息
exports.addChatMessage = (req, res) => {
  const newMessage = {
    id: `M${Date.now()}`,
    ...req.body,
    timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
    isRead: false
  };
  MOCK_CHAT_MESSAGES.unshift(newMessage);
  res.status(201).json(newMessage);
};

// 标记消息为已读
exports.markAsRead = (req, res) => {
  const { id } = req.params;
  const message = MOCK_CHAT_MESSAGES.find(m => m.id === id);
  if (message) {
    message.isRead = true;
    res.json(message);
  } else {
    res.status(404).json({ message: '消息不存在' });
  }
};
