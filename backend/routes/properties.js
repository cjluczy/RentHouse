const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// 获取所有房源
router.get('/', propertyController.getProperties);

// 获取单个房源
router.get('/:id', propertyController.getPropertyById);

// 添加房源
router.post('/', propertyController.addProperty);

// 更新房源
router.put('/:id', propertyController.updateProperty);

// 删除房源
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
