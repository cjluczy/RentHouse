
import { Property, NavItem, InterestedUser } from './types';

export const DEVELOPER_EMAIL = 'cjluczy@qq.com';

export const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '#', active: true },
  { label: '二手房', href: '#' },
  { label: '租房', href: '#' },
  { label: '新房', href: '#' },
  { label: '定制化开发', href: `mailto:${DEVELOPER_EMAIL}` },
];

export const DEFAULT_DESCRIPTION = '【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。';

export const APPLIANCE_TAGS = [
  { name: '空调', icon: 'ac_unit' },
  { name: '衣柜', icon: 'checkroom' },
  { name: '热水器', icon: 'shower' },
  { name: 'WiFi', icon: 'wifi' },
  { name: '冰箱', icon: 'kitchen' },
  { name: '油烟机', icon: 'restaurant' },
  { name: '洗衣机', icon: 'local_laundry_service' },
  { name: '床', icon: 'bed' },
  { name: '微波炉', icon: 'microwave' },
  { name: '电视', icon: 'tv' },
];

export const MOCK_USERS: InterestedUser[] = [
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

export const MOCK_PROPERTIES: Property[] = [
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
      '/assets/images/google/property-1.jpg',
      'https://picsum.photos/seed/p1/800/600',
      'https://picsum.photos/seed/p2/800/600'
    ],
    hasVideo: true,
    status: '招租中',
    publishDate: '2024-01-20',
    appointments: [{ name: '王女士 (个人)', time: '明天 14:30', staff: '小张', confirmed: true }],
    description: DEFAULT_DESCRIPTION,
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
      '/assets/images/google/property-2.jpg',
      'https://picsum.photos/seed/p3/800/600'
    ],
    hasVideo: true,
    isNewProperty: true,
    status: '招租中',
    publishDate: '2024-02-15',
    appointments: [],
    description: DEFAULT_DESCRIPTION,
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
      'https://picsum.photos/seed/p4/800/600',
      'https://picsum.photos/seed/p5/800/600'
    ],
    hasVideo: false,
    status: '招租中',
    publishDate: '2024-03-01',
    appointments: [],
    description: DEFAULT_DESCRIPTION,
    coords: [29.2895, 120.0485]
  }
];
