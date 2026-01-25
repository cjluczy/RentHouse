const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 获取所有用户
router.get('/', userController.getUsers);

// 添加用户
router.post('/', userController.addUser);

// 全局实名认证
router.post('/auth', userController.globalAuth);

module.exports = router;
