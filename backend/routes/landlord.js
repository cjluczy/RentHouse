const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');

// 获取房东配置
router.get('/config', landlordController.getLandlordConfig);

// 更新房东配置
router.put('/config', landlordController.updateLandlordConfig);

// 房东登录
router.post('/login', landlordController.login);

module.exports = router;
