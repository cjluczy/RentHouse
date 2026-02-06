const User = require('../models/User');

// 获取所有用户
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户失败', error: error.message });
  }
};

// 添加用户
exports.addUser = async (req, res) => {
  try {
    const newUser = new User({
      id: `U${Date.now().toString().slice(-3)}`,
      ...req.body,
      authStatus: '已实名',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: '添加用户失败', error: error.message });
  }
};

// 全局实名认证
exports.globalAuth = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const newUser = new User({
      id: `U${Date.now().toString().slice(-3)}`,
      name,
      phone,
      sourceProperty: '全局平台实名认证',
      authStatus: '已实名',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: '实名认证失败', error: error.message });
  }
};