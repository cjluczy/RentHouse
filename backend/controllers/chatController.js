const ChatMessage = require('../models/ChatMessage');

// 获取所有聊天消息
exports.getChatMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: '获取消息失败', error: error.message });
  }
};

// 添加聊天消息
exports.addChatMessage = async (req, res) => {
  try {
    const newMessage = new ChatMessage({
      id: `M${Date.now()}`,
      ...req.body,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      isRead: false
    });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: '添加消息失败', error: error.message });
  }
};

// 标记消息为已读
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ChatMessage.findOneAndUpdate(
      { id },
      { isRead: true },
      { new: true }
    );
    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ message: '消息不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '标记消息失败', error: error.message });
  }
};