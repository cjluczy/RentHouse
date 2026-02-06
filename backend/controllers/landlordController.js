const LandlordConfig = require('../models/LandlordConfig');

// 获取房东配置
exports.getLandlordConfig = async (req, res) => {
  try {
    const config = await LandlordConfig.findOne({});
    if (config) {
      res.json(config);
    } else {
      const defaultConfig = new LandlordConfig({
        name: '李先生',
        avatar: '/assets/images/avatar.jpg',
        phone: '13888888888',
        wechatId: 'HousePlatform_Service',
        qrCodeUrl: '',
        password: '123456'
      });
      const savedConfig = await defaultConfig.save();
      res.json(savedConfig);
    }
  } catch (error) {
    res.status(500).json({ message: '获取房东配置失败', error: error.message });
  }
};

// 更新房东配置
exports.updateLandlordConfig = async (req, res) => {
  try {
    let config = await LandlordConfig.findOne({});
    if (config) {
      Object.assign(config, req.body);
      const updatedConfig = await config.save();
      res.json(updatedConfig);
    } else {
      const newConfig = new LandlordConfig(req.body);
      const savedConfig = await newConfig.save();
      res.json(savedConfig);
    }
  } catch (error) {
    res.status(500).json({ message: '更新房东配置失败', error: error.message });
  }
};

// 房东登录
exports.login = async (req, res) => {
  try {
    const config = await LandlordConfig.findOne({});
    if (config) {
      const { password } = req.body;
      if (password === config.password) {
        res.json({ success: true, message: '登录成功', landlord: config });
      } else {
        res.status(401).json({ success: false, message: '密码错误' });
      }
    } else {
      res.status(404).json({ success: false, message: '房东配置不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
};