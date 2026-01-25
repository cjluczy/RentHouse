const { MOCK_PROPERTIES } = require('../models/data');

// 获取所有房源
exports.getProperties = (req, res) => {
  res.json(MOCK_PROPERTIES);
};

// 获取单个房源
exports.getPropertyById = (req, res) => {
  const { id } = req.params;
  const property = MOCK_PROPERTIES.find(p => p.id === id);
  if (property) {
    res.json(property);
  } else {
    res.status(404).json({ message: '房源不存在' });
  }
};

// 添加房源
exports.addProperty = (req, res) => {
  const newProperty = {
    id: `YW-${Date.now()}`,
    ...req.body,
    publishDate: new Date().toISOString().split('T')[0],
    appointments: []
  };
  MOCK_PROPERTIES.unshift(newProperty);
  res.status(201).json(newProperty);
};

// 更新房源
exports.updateProperty = (req, res) => {
  const { id } = req.params;
  const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
  if (index !== -1) {
    MOCK_PROPERTIES[index] = { ...MOCK_PROPERTIES[index], ...req.body };
    res.json(MOCK_PROPERTIES[index]);
  } else {
    res.status(404).json({ message: '房源不存在' });
  }
};

// 删除房源
exports.deleteProperty = (req, res) => {
  const { id } = req.params;
  const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
  if (index !== -1) {
    MOCK_PROPERTIES.splice(index, 1);
    res.json({ message: '房源删除成功' });
  } else {
    res.status(404).json({ message: '房源不存在' });
  }
};
