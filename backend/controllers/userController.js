const { MOCK_USERS } = require('../models/data');

// 获取所有用户
exports.getUsers = (req, res) => {
  res.json(MOCK_USERS);
};

// 添加用户
exports.addUser = (req, res) => {
  const newUser = {
    id: `U${Date.now().toString().slice(-3)}`,
    ...req.body,
    authStatus: '已实名',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  };
  MOCK_USERS.unshift(newUser);
  res.status(201).json(newUser);
};

// 全局实名认证
exports.globalAuth = (req, res) => {
  const { name, phone } = req.body;
  const newUser = {
    id: `U${Date.now().toString().slice(-3)}`,
    name,
    phone,
    sourceProperty: '全局平台实名认证',
    authStatus: '已实名',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  };
  MOCK_USERS.unshift(newUser);
  res.status(201).json(newUser);
};
