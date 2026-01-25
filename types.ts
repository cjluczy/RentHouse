
export interface Appointment {
  name: string;
  time: string;
  staff: string;
  confirmed: boolean;
}

export type PropertyStatus = '招租中' | '已预定' | '已成交' | '已下架';

export interface InterestedUser {
  id: string;
  name: string;
  phone: string;
  sourceProperty: string;
  authStatus: '已实名' | '待认证';
  createTime: string;
}

export interface ChatMessage {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userName: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
  isRead?: boolean;
}

export interface LandlordConfig {
  name: string;
  avatar: string;
  phone: string;
  wechatId: string;
  password?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  district: string;
  address: string;
  price: number;
  area: number;
  layout: string;
  tags: string[];
  imageUrls: string[]; 
  videoUrl?: string; // 视频URL
  hasVideo: boolean;
  isNew?: boolean;
  status: PropertyStatus;
  publishDate: string;
  appointments: Appointment[];
  description: string;
  coords?: [number, number]; // [latitude, longitude]
}

export enum FilterTab {
  RECOMMENDED = '精选',
  NEW = '新上架',
  PRICE_DROP = '降价急租'
}

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}
