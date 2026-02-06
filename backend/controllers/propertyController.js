const Property = require('../models/Property');

// 获取所有房源
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: '获取房源失败', error: error.message });
  }
};

// 获取单个房源
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({ id });
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: '房源不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '获取房源失败', error: error.message });
  }
};

// 添加房源
exports.addProperty = async (req, res) => {
  try {
    console.log('收到添加房源请求:', JSON.stringify(req.body, null, 2));
    const { title, price, area, layout, location, city, district, address, tags, description, status, imageUrls, videoUrl, hasVideo, isNewProperty } = req.body;
    
    const newProperty = new Property({
      id: `YW-${Date.now()}`,
      title,
      price,
      area,
      layout,
      location,
      city,
      district,
      address,
      tags,
      description,
      status: status || '招租中',
      imageUrls: imageUrls || [],
      videoUrl: videoUrl || '',
      hasVideo: hasVideo || false,
      isNewProperty: isNewProperty || false,
      publishDate: new Date().toISOString().split('T')[0],
      appointments: []
    });
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error('添加房源错误:', error);
    res.status(500).json({ message: '添加房源失败', error: error.message });
  }
};

// 更新房源
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: '房源不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '更新房源失败', error: error.message });
  }
};

// 删除房源
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOneAndDelete({ id });
    if (property) {
      res.json({ message: '房源删除成功' });
    } else {
      res.status(404).json({ message: '房源不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '删除房源失败', error: error.message });
  }
};