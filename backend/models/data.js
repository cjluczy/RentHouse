// 模拟数据库存储
const MOCK_PROPERTIES = [
  {
    id: 'YW-2024001',
    title: '义乌北苑 精装一室一卫',
    location: '北苑街道',
    city: '金华市',
    district: '义乌市',
    address: '浙江省金华市义乌市北苑路88号',
    price: 1800,
    area: 35.0,
    layout: '1室1卫',
    tags: ['空调', '衣柜', '热水器', 'WiFi', '冰箱', '油烟机'],
    imageUrls: [
      '/assets/images/p1.jpg',
      '/assets/images/p2.jpg'
    ],
    // 视频URL
    videoUrl: '/assets/videos/sample-5s.mp4',
    hasVideo: true,
    status: '招租中',
    publishDate: '2024-01-20',
    appointments: [{ name: '王女士 (个人)', time: '明天 14:30', staff: '小张', confirmed: true }],
    description: '【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。',
    coords: [29.3242, 120.0673]
  },
  {
    id: 'YW-2024105',
    title: '福田二区 现代简约两室一卫',
    location: '福田街道',
    city: '金华市',
    district: '义乌市',
    address: '浙江省金华市义乌市福田二区25栋',
    price: 3200,
    area: 65,
    layout: '2室1卫',
    tags: ['空调', '衣柜', '热水器', 'WiFi', '冰箱', '油烟机', '洗衣机'],
    imageUrls: [
      '/assets/images/p3.jpg'
    ],
    // 视频URL
    videoUrl: '/assets/videos/sample-9s.mp4',
    hasVideo: true,
    isNew: true,
    status: '招租中',
    publishDate: '2024-02-15',
    appointments: [],
    description: '【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。',
    coords: [29.3361, 120.0912]
  },
  {
    id: 'YW-2024106',
    title: '稠江街道 舒适大三居',
    location: '稠江街道',
    city: '金华市',
    district: '义乌市',
    address: '浙江省金华市义乌市稠江街道万达广场旁',
    price: 4500,
    area: 110,
    layout: '3室2卫',
    tags: ['空调', '衣柜', '热水器', 'WiFi', '冰箱', '洗衣机', '床'],
    imageUrls: [
      '/assets/images/p4.jpg',
      '/assets/images/p5.jpg'
    ],
    hasVideo: false,
    status: '招租中',
    publishDate: '2024-03-01',
    appointments: [],
    description: '【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。',
    coords: [29.2895, 120.0485]
  }
];

const MOCK_USERS = [
  {
    id: 'U001',
    name: '张美玲',
    phone: '138****5566',
    sourceProperty: '义乌北苑 精装一室一卫',
    authStatus: '已实名',
    createTime: '2024-03-20 14:30'
  },
  {
    id: 'U002',
    name: '李伟强',
    phone: '159****8822',
    sourceProperty: '福田二区 现代简约两室一卫',
    authStatus: '已实名',
    createTime: '2024-03-21 09:15'
  },
  {
    id: 'U003',
    name: '陈小芳',
    phone: '133****1144',
    sourceProperty: '义乌北苑 精装一室一卫',
    authStatus: '待认证',
    createTime: '2024-03-22 18:05'
  }
];

const MOCK_CHAT_MESSAGES = [];

const LANDLORD_CONFIG = {
  name: '李先生',
  avatar: '/assets/images/avatar.jpg',
  phone: '13888888888',
  wechatId: 'HousePlatform_Service',
  password: '123456'
};

module.exports = {
  MOCK_PROPERTIES,
  MOCK_USERS,
  MOCK_CHAT_MESSAGES,
  LANDLORD_CONFIG
};
