const { LANDLORD_CONFIG } = require('../models/data');

// 获取房东配置
exports.getLandlordConfig = (req, res) => {
  res.json(LANDLORD_CONFIG);
};

// 更新房东配置
exports.updateLandlordConfig = (req, res) => {
  Object.assign(LANDLORD_CONFIG, req.body);
  res.json(LANDLORD_CONFIG);
};

// 房东登录
exports.login = (req, res) => {
  const { password } = req.body;
  if (password === LANDLORD_CONFIG.password) {
    res.json({ success: true, message: '登录成功', landlord: LANDLORD_CONFIG });
  } else {
    res.status(401).json({ success: false, message: '密码错误' });
  }
};
