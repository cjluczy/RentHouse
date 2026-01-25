import { Property, InterestedUser, ChatMessage, LandlordConfig } from '../../types';

const API_BASE_URL = 'http://localhost:3001/api';

// 通用请求函数
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // 尝试解析响应体，获取后端返回的错误信息
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API请求失败: ${response.statusText}`);
    } catch (e) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }
  }

  return response.json();
}

// 房源相关API
export const propertyApi = {
  // 获取所有房源
  getProperties: () => request<Property[]>('/properties'),
  
  // 获取单个房源
  getPropertyById: (id: string) => request<Property>(`/properties/${id}`),
  
  // 添加房源
  addProperty: (property: Partial<Property>) => request<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(property),
  }),
  
  // 更新房源
  updateProperty: (id: string, property: Partial<Property>) => request<Property>(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(property),
  }),
  
  // 删除房源
  deleteProperty: (id: string) => request<{ message: string }>(`/properties/${id}`, {
    method: 'DELETE',
  }),
};

// 用户相关API
export const userApi = {
  // 获取所有用户
  getUsers: () => request<InterestedUser[]>('/users'),
  
  // 添加用户
  addUser: (user: { name: string; phone: string; propertyTitle: string }) => request<InterestedUser>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  
  // 全局实名认证
  globalAuth: (data: { name: string; phone: string }) => request<InterestedUser>('/users/auth', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// 聊天相关API
export const chatApi = {
  // 获取所有聊天消息
  getChatMessages: () => request<ChatMessage[]>('/chat'),
  
  // 添加聊天消息
  addChatMessage: (message: Partial<ChatMessage>) => request<ChatMessage>('/chat', {
    method: 'POST',
    body: JSON.stringify(message),
  }),
  
  // 标记消息为已读
  markAsRead: (id: string) => request<ChatMessage>(`/chat/${id}/read`, {
    method: 'PUT',
  }),
};

// 房东相关API
export const landlordApi = {
  // 获取房东配置
  getLandlordConfig: () => request<LandlordConfig>('/landlord/config'),
  
  // 更新房东配置
  updateLandlordConfig: (config: Partial<LandlordConfig>) => request<LandlordConfig>('/landlord/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  
  // 房东登录
  login: (password: string) => request<{ success: boolean; message: string; landlord?: LandlordConfig }>('/landlord/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
};

// 健康检查
export const healthApi = {
  check: () => request<{ status: string }>('/health'),
};
