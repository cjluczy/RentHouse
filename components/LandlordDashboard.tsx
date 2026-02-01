
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Property, PropertyStatus, InterestedUser, LandlordConfig, ChatMessage } from '../types';
import { APPLIANCE_TAGS, DEFAULT_DESCRIPTION } from '../constants';
import { propertyApi, userApi, landlordApi } from '../src/services/api';

interface LandlordDashboardProps {
  onLogout: () => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  interestedUsers: InterestedUser[];
  setInterestedUsers: React.Dispatch<React.SetStateAction<InterestedUser[]>>;
  chatMessages: ChatMessage[];
  onMarkMessageRead: (msgId: string) => void;
  landlordConfig: LandlordConfig;
  setLandlordConfig: React.Dispatch<React.SetStateAction<LandlordConfig>>;
}

interface ValidationErrors {
  title?: string;
  price?: string;
  area?: string;
  address?: string;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({ 
  onLogout, 
  properties, 
  setProperties,
  interestedUsers,
  setInterestedUsers,
  chatMessages,
  onMarkMessageRead,
  landlordConfig,
  setLandlordConfig
}) => {
  const [activeView, setActiveView] = useState<'properties' | 'users' | 'settings' | 'messages'>('properties');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'全部' | '招租中' | '已预定' | '已下架'>('全部');
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [originalProperty, setOriginalProperty] = useState<Property | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // 浙江省城市、区县、街道数据
  const zhejiangData = {
    "金华市": {
      "义乌市": ["稠城街道", "北苑街道", "稠江街道", "江东街道", "后宅街道", "城西街道", "廿三里街道", "福田街道", "苏溪镇", "上溪镇", "义亭镇", "佛堂镇", "赤岸镇"],
      "婺城区": ["城东街道", "城中街道", "城西街道", "城北街道", "江南街道", "西关街道", "秋滨街道", "新狮街道", "罗店镇", "蒋堂镇", "汤溪镇", "罗埠镇", "雅畈镇", "琅琊镇", "洋埠镇", "安地镇", "白龙桥镇"],
      "东阳市": ["吴宁街道", "南市街道", "白云街道", "江北街道", "城东街道", "六石街道", "巍山镇", "虎鹿镇", "歌山镇", "佐村镇", "东阳江镇", "湖溪镇", "马宅镇", "千祥镇", "南马镇", "画水镇", "横店镇", "三单乡"]
    },
    "杭州市": {
      "上城区": ["清波街道", "湖滨街道", "小营街道", "望江街道", "南星街道", "紫阳街道", "闸弄口街道", "凯旋街道", "采荷街道", "四季青街道", "彭埠街道", "笕桥街道", "丁兰街道", "九堡街道"],
      "下城区": ["武林街道", "长庆街道", "潮鸣街道", "朝晖街道", "文晖街道", "东新街道", "石桥街道"],
      "江干区": ["闸弄口街道", "凯旋街道", "采荷街道", "四季青街道", "彭埠街道", "笕桥街道", "丁兰街道", "九堡街道"]
    },
    "宁波市": {
      "海曙区": ["月湖街道", "南门街道", "江厦街道", "鼓楼街道", "西门街道", "白云街道", "望春街道", "段塘街道", "江夏街道", "石碶街道", "集士港镇", "古林镇", "高桥镇", "横街镇", "鄞江镇", "洞桥镇", "章水镇", "龙观乡", "杖锡乡"],
      "江北区": ["中马街道", "白沙街道", "孔浦街道", "文教街道", "甬江街道", "庄桥街道", "洪塘街道", "慈城镇"],
      "北仑区": ["大榭街道", "新碶街道", "小港街道", "大碶街道", "霞浦街道", "柴桥街道", "戚家山街道", "春晓街道", "梅山街道", "白峰街道", "郭巨街道", "保税区", "开发区", "梅山保税港区"]
    }
  };

  // Settings local state
  const [tempConfig, setTempConfig] = useState<LandlordConfig>({ ...landlordConfig });
  
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (properties.length > 0 && !selectedId) {
      setSelectedId(properties[0].id);
    }
  }, [properties, selectedId]);

  const unreadMessagesCount = useMemo(() => chatMessages.filter(m => !m.isRead && m.sender === 'user').length, [chatMessages]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = filterTab === '全部' || p.status === filterTab;
      return matchesSearch && matchesTab;
    });
  }, [properties, searchTerm, filterTab]);

  const filteredUsers = useMemo(() => {
    return interestedUsers.filter(u => 
      u.name.includes(searchTerm) || u.phone.includes(searchTerm)
    );
  }, [interestedUsers, searchTerm]);

  const activeProperty = useMemo(() => {
    return properties.find(p => p.id === selectedId) || null;
  }, [properties, selectedId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const validate = (): boolean => {
    if (!editingProperty) return false;
    const newErrors: ValidationErrors = {};
    
    if (!editingProperty.title.trim()) {
      newErrors.title = '房源标题不能为空';
    } else if (editingProperty.title.trim().length < 5) {
      newErrors.title = '标题长度至少需要5个字符';
    }

    if (editingProperty.price <= 0) {
      newErrors.price = '租金必须大于0';
    }

    if (editingProperty.area <= 0) {
      newErrors.area = '面积必须大于0';
    }

    if (!editingProperty.address.trim()) {
      newErrors.address = '详细地址不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBatchStatusChange = async (newStatus: PropertyStatus) => {
    try {
      // 批量更新房源状态
      const updatePromises = Array.from(selectedRows).map(async (id: string) => {
        const property = properties.find(p => p.id === id);
        if (property) {
          const isReactivating = newStatus === '招租中' && (property.status === '已成交' || property.status === '已下架');
          await propertyApi.updateProperty(id, {
            status: newStatus,
            isNew: isReactivating ? true : property.isNew
          });
        }
      });

      await Promise.all(updatePromises);

      // 更新本地状态
      setProperties(prev => prev.map(p => {
        if (selectedRows.has(p.id)) {
          const isReactivating = newStatus === '招租中' && (p.status === '已成交' || p.status === '已下架');
          return { 
            ...p, 
            status: newStatus,
            isNew: isReactivating ? true : p.isNew
          };
        }
        return p;
      }));

      showToast(`已成功批量更新 ${selectedRows.size} 套房源状态为：${newStatus}`);
      setSelectedRows(new Set());
      setShowBatchMenu(false);
    } catch (error) {
      console.error('批量更新状态失败:', error);
      showToast('批量更新状态失败，请稍后重试', 'error');
    }
  };

  const performDeletion = async (idsToDelete: Set<string>) => {
    try {
      // 批量删除房源
      const deletePromises = Array.from(idsToDelete).map(async (id) => {
        await propertyApi.deleteProperty(id);
      });

      await Promise.all(deletePromises);

      // 更新本地状态
      setProperties(prev => {
        const remaining = prev.filter(p => !idsToDelete.has(p.id));
        if (idsToDelete.has(selectedId)) {
          setSelectedId(remaining.length > 0 ? remaining[0].id : '');
        }
        return remaining;
      });
      setSelectedRows(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
      });
      showToast(`成功删除 ${idsToDelete.size} 套房源`);
    } catch (error) {
      console.error('删除房源失败:', error);
      showToast('删除房源失败，请稍后重试', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('确定要移除该意向用户吗？')) {
      try {
        // 这里暂时没有删除用户的API，所以只更新本地状态
        // 实际项目中应该调用API删除用户
        setInterestedUsers(prev => prev.filter(u => u.id !== id));
        showToast('用户记录已移除');
      } catch (error) {
        console.error('删除用户失败:', error);
        showToast('删除用户失败，请稍后重试', 'error');
      }
    }
  };

  const handleBatchDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRows.size === 0) return;
    if (window.confirm(`警告：确定要删除选中的 ${selectedRows.size} 个房源吗？此操作无法撤销。`)) {
      performDeletion(new Set(selectedRows));
      setShowBatchMenu(false);
    }
  };

  const handleSingleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`确定要彻底删除房源 "${name}" 吗？`)) {
      performDeletion(new Set([id]));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEditing = (property: Property) => {
    const cloned = JSON.parse(JSON.stringify(property));
    setEditingProperty(cloned);
    setOriginalProperty(cloned);
    setErrors({});
    setNewImageUrl('');
  };

  const handleCloseEdit = () => {
    if (!editingProperty || !originalProperty) {
      setEditingProperty(null);
      setOriginalProperty(null);
      setErrors({});
      return;
    }
    const isDirty = JSON.stringify(editingProperty) !== JSON.stringify(originalProperty);
    if (isDirty) {
      if (window.confirm('您有未保存的更改，确定要放弃吗？')) {
        setEditingProperty(null);
        setOriginalProperty(null);
        setErrors({});
      }
    } else {
      setEditingProperty(null);
      setOriginalProperty(null);
      setErrors({});
    }
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty || !originalProperty) return;

    if (!validate()) {
      showToast('表单内容有误，请检查红色标记字段', 'error');
      return;
    }

    let finalProperty = { ...editingProperty };
    if (finalProperty.status === '招租中' && (originalProperty.status === '已成交' || originalProperty.status === '已下架')) {
      finalProperty.isNew = true;
    }

    try {
      // 准备API请求数据，避免发送Data URL以减少请求体大小
      const apiProperty = { ...finalProperty };
      // 替换Data URL为本地路径占位符
      if (apiProperty.imageUrls && apiProperty.imageUrls.length > 0) {
        apiProperty.imageUrls = apiProperty.imageUrls.map((url, index) => {
          // 检查是否为Data URL
          if (url.startsWith('data:')) {
            // 替换为本地路径占位符
            return `/assets/images/${Date.now()}_${index}.jpg`;
          }
          return url;
        });
      }
      // 避免发送videoUrl，因为Data URL格式的视频文件太大
      if (apiProperty.videoUrl && apiProperty.videoUrl.startsWith('data:')) {
        delete apiProperty.videoUrl;
        apiProperty.hasVideo = true;
      }

      // 调用API更新房源
      await propertyApi.updateProperty(apiProperty.id, apiProperty);

      // 更新本地状态
      setProperties(prev => prev.map(p => p.id === finalProperty.id ? finalProperty : p));
      showToast('房源信息已保存');
      setEditingProperty(null);
      setOriginalProperty(null);
      setErrors({});
    } catch (error) {
      console.error('更新房源失败:', error);
      showToast('更新房源失败，请稍后重试', 'error');
    }
  };

  const handleAddProperty = async () => {
    try {
      const newPropData = {
        title: '',
        price: 0,
        status: '招租中' as PropertyStatus,
        area: 0,
        layout: '1室1卫',
        publishDate: new Date().toISOString().split('T')[0],
        imageUrls: ['/assets/images/realestate.jpg'],
        location: '稠城街道',
        city: '金华市',
        district: '义乌市',
        address: '',
        tags: ['空调', '衣柜', '热水器', 'WiFi', '冰箱', '油烟机'],
        appointments: [],
        hasVideo: false,
        isNew: true,
        description: DEFAULT_DESCRIPTION
      };

      // 准备API请求数据，确保不包含Data URL
      const apiProperty = { ...newPropData };
      if (apiProperty.imageUrls && apiProperty.imageUrls.length > 0) {
        apiProperty.imageUrls = apiProperty.imageUrls.map(url => {
          if (url.startsWith('data:')) {
            return `/assets/images/${Date.now()}.jpg`;
          }
          return url;
        });
      }

      // 调用API添加房源
      const newProp = await propertyApi.addProperty(apiProperty);

      // 更新本地状态
      setProperties(prev => [newProp, ...prev]);
      setSelectedId(newProp.id);
      startEditing(newProp);
    } catch (error) {
      console.error('添加房源失败:', error);
      showToast('添加房源失败，请稍后重试', 'error');
    }
  };

  const toggleTag = (tagName: string) => {
    if (!editingProperty) return;
    const currentTags = [...editingProperty.tags];
    const index = currentTags.indexOf(tagName);
    if (index > -1) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tagName);
    }
    setEditingProperty({ ...editingProperty, tags: currentTags });
  };

  const triggerUpload = (id: string) => {
    setUploadingId(id);
    fileInputRef.current?.click();
  };

  // 从本地存储加载视频URL
  useEffect(() => {
    if (properties.length > 0) {
      const updatedProperties = properties.map(property => {
        const storedVideoUrl = localStorage.getItem(`video_${property.id}`);
        if (storedVideoUrl && property.hasVideo) {
          return { ...property, videoUrl: storedVideoUrl };
        }
        return property;
      });
      setProperties(updatedProperties);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    
    // 检查文件大小，限制视频文件大小为5MB（localStorage存储限制）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('视频文件过大，请上传5MB以内的视频', 'error');
      setUploadingId(null);
      return;
    }
    
    // 检查文件类型，只允许常见视频格式
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('视频格式不支持，请上传MP4、WebM或OGG格式的视频', 'error');
      setUploadingId(null);
      return;
    }
    
    setUploadProgress(0);
    
    // 使用FileReader读取本地视频文件，用于预览
    const reader = new FileReader();
    
    // 显示上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);
    
    reader.onload = (event) => {
      clearInterval(progressInterval);
      const videoUrl = event.target?.result as string;
      
      try {
        // 尝试存储到本地存储
        localStorage.setItem(`video_${uploadingId}`, videoUrl);
        
        // 更新本地状态
        setProperties(current => current.map(p => p.id === uploadingId ? { ...p, hasVideo: true, videoUrl } : p));
        
        // 只更新hasVideo状态，不发送videoUrl，因为Data URL格式的视频文件太大
        propertyApi.updateProperty(uploadingId, { hasVideo: true })
          .then(() => {
            showToast('视频上传成功，展示平台已更新');
          })
          .catch(error => {
            console.error('更新视频状态失败:', error);
            showToast('视频上传成功，但更新展示平台失败', 'error');
          })
          .finally(() => {
            setUploadProgress(100);
            setTimeout(() => {
              setUploadingId(null);
              setUploadProgress(0);
            }, 500);
          });
      } catch (error) {
        console.error('视频存储失败:', error);
        showToast('视频上传失败，本地存储不足', 'error');
        setUploadProgress(0);
        setUploadingId(null);
      }
    };
    
    reader.onerror = () => {
      clearInterval(progressInterval);
      console.error('视频文件读取失败');
      showToast('视频上传失败，请重试', 'error');
      setUploadingId(null);
      setUploadProgress(0);
    };
    
    reader.onabort = () => {
      clearInterval(progressInterval);
      console.error('视频上传被中止');
      showToast('视频上传被中止', 'error');
      setUploadingId(null);
      setUploadProgress(0);
    };
    
    // 将视频文件转换为Data URL
    reader.readAsDataURL(file);
  };

  const addImageToEditing = () => {
    if (!editingProperty || !newImageUrl.trim()) return;
    setEditingProperty({
      ...editingProperty,
      imageUrls: [...editingProperty.imageUrls, newImageUrl.trim()]
    });
    setNewImageUrl('');
  };

  const handleImageDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProperty) return;
    
    // 使用FileReader读取本地图片文件，以便在前端预览
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditingProperty({
        ...editingProperty,
        imageUrls: [...editingProperty.imageUrls, base64String]
      });
      showToast('设备图片已添加');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImageFromEditing = (index: number) => {
    if (!editingProperty) return;
    const nextImages = [...editingProperty.imageUrls];
    nextImages.splice(index, 1);
    setEditingProperty({
      ...editingProperty,
      imageUrls: nextImages
    });
  };

  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case '招租中': return 'accent-green';
      case '已预定': return 'accent-amber';
      case '已成交': return 'slate-400';
      case '已下架': return 'accent-red';
      default: return 'slate-400';
    }
  };

  const parseLayout = (layout: string) => {
    const rooms = parseInt(layout.split('室')[0]) || 0;
    const baths = parseInt(layout.split('室')[1]?.replace('卫', '')) || 0;
    return { rooms, baths };
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 调用API更新房东配置
      await landlordApi.updateLandlordConfig(tempConfig);

      // 更新本地状态
      setLandlordConfig({ ...tempConfig });
      showToast('个人资料已更新');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      showToast('更新个人资料失败，请稍后重试', 'error');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempConfig({ ...tempConfig, avatar: reader.result as string });
      showToast('头像已载入');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen bg-background-dark font-display text-slate-200 antialiased overflow-hidden">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-fadeIn">
          <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl border-white/20 border">
            <span className={`material-symbols-outlined ${toast.type === 'success' ? 'text-accent-green' : 'text-accent-red'}`}>
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-sm font-bold text-white">{toast.message}</span>
          </div>
        </div>
      )}

      <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      <input type="file" accept="image/*" ref={imageUploadRef} className="hidden" onChange={handleImageDeviceUpload} />
      <input type="file" accept="image/*" ref={avatarUploadRef} className="hidden" onChange={handleAvatarUpload} />

      <aside className={`flex flex-col bg-sidebar-dark border-r border-white/10 shrink-0 z-20 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
        {sidebarOpen && (
          <>
            <div className="p-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 bg-dashboard-blue rounded flex items-center justify-center text-white">
                  <span className="material-symbols-outlined font-bold">real_estate_agent</span>
                </div>
                <div>
                  <h1 className="text-base font-bold leading-tight text-white tracking-tight">房东管理后台</h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dashboard</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-primary transition-colors"
                title="关闭侧边栏"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
        
            <nav className="flex-1 px-4 space-y-1 mt-2">
              <button 
                onClick={() => { setActiveView('properties'); setSearchTerm(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeView === 'properties' ? 'bg-dashboard-blue/10 text-dashboard-blue font-semibold border border-dashboard-blue/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined">format_list_bulleted</span>
                <span className="text-sm">房源列表</span>
              </button>
              <button 
                onClick={() => { setActiveView('users'); setSearchTerm(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeView === 'users' ? 'bg-dashboard-blue/10 text-dashboard-blue font-semibold border border-dashboard-blue/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined">group</span>
                <span className="text-sm">用户管理</span>
                {interestedUsers.length > 0 && <span className="ml-auto bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">{interestedUsers.length}</span>}
              </button>
              <button 
                onClick={() => { setActiveView('messages'); setSearchTerm(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeView === 'messages' ? 'bg-dashboard-blue/10 text-dashboard-blue font-semibold border border-dashboard-blue/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="text-sm font-medium">消息通知</span>
                {unreadMessagesCount > 0 && <span className="ml-auto bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadMessagesCount}</span>}
              </button>
              <button 
                onClick={() => setActiveView('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeView === 'settings' ? 'bg-dashboard-blue/10 text-dashboard-blue font-semibold border border-dashboard-blue/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined">manage_accounts</span>
                <span className="text-sm">账号设置</span>
              </button>
            </nav>

            <div className="p-4 mt-auto border-t border-white/5">
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setActiveView('settings')}>
                <div className="size-10 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: `url("${landlordConfig.avatar}")` }}></div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{landlordConfig.name}</span>
                  <span className="text-[10px] text-slate-500">查看个人资料</span>
                </div>
              </div>
              <button onClick={onLogout} className="w-full flex items-center gap-2 mt-4 px-3 py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">logout</span> 退出登录
              </button>
            </div>
          </>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-card-dark border-b border-white/5 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-primary transition-colors"
              title="打开侧边栏"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex-1 max-w-xl">
              {activeView !== 'settings' && (
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                  <input 
                    className="w-full bg-background-dark border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-dashboard-blue outline-none transition-all" 
                    placeholder={activeView === 'properties' ? "搜索房源 ID 或名称..." : activeView === 'messages' ? "搜索消息内容..." : "搜索用户姓名或手机号..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              {activeView === 'settings' && <h2 className="text-lg font-bold text-white">个人账号设置</h2>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeView === 'properties' && (
              <button onClick={handleAddProperty} className="bg-dashboard-blue text-white text-sm font-bold px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10">
                <span className="material-symbols-outlined">add</span>
                <span>发布房源</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'settings' ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left side: Avatar and Basic Info */}
                <div className="bg-card-dark rounded-2xl border border-white/5 p-8 flex flex-col items-center gap-6 shadow-xl">
                  <div className="relative group">
                    <div className="size-32 rounded-3xl bg-cover bg-center border-2 border-white/10 shadow-2xl overflow-hidden" style={{ backgroundImage: `url("${tempConfig.avatar}")` }}></div>
                    <button 
                      onClick={() => avatarUploadRef.current?.click()}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                    >
                      <span className="material-symbols-outlined mb-1">photo_camera</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">更换头像</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white">{tempConfig.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">房东等级: 资深业主</p>
                  </div>
                  <div className="w-full pt-6 border-t border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">房源总数</span>
                      <span className="text-white font-bold">{properties.length} 套</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">注册日期</span>
                      <span className="text-white font-bold">2023-11-24</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Edit Forms */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-card-dark rounded-2xl border border-white/5 p-8 shadow-xl">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <span className="material-symbols-outlined text-dashboard-blue">badge</span> 基本信息与密码
                    </h4>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">用户名 / 昵称</label>
                          <input 
                            className="bg-background-dark border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all" 
                            value={tempConfig.name}
                            onChange={e => setTempConfig({...tempConfig, name: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">登录密码</label>
                          <input 
                            type="password"
                            className="bg-background-dark border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all" 
                            value={tempConfig.password}
                            onChange={e => setTempConfig({...tempConfig, password: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <span className="material-symbols-outlined text-dashboard-blue">contact_support</span> 详情页联系方式 (租客端可见)
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">电话咨询号码</label>
                            <input 
                              type="tel"
                              className="bg-background-dark border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all" 
                              value={tempConfig.phone}
                              onChange={e => setTempConfig({...tempConfig, phone: e.target.value})}
                            />
                            <span className="text-[9px] text-slate-600">点击详情页“电话咨询”将直接拨打此号</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">微信预约 ID / 二维码链接</label>
                            <input 
                              className="bg-background-dark border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all" 
                              value={tempConfig.wechatId}
                              onChange={e => setTempConfig({...tempConfig, wechatId: e.target.value})}
                            />
                            <span className="text-[9px] text-slate-600">点击“微信预约”将复制此 ID</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 flex justify-end gap-4">
                        <button 
                          type="button" 
                          onClick={() => setTempConfig({...landlordConfig})}
                          className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
                        >
                          撤销更改
                        </button>
                        <button 
                          type="submit"
                          className="bg-dashboard-blue text-white text-sm font-black px-12 py-3 rounded-xl shadow-xl shadow-dashboard-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          保存所有设置
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === 'messages' ? (
            <div className="bg-card-dark rounded-xl border border-white/5 shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">forum</span>
                  租客咨询消息
                </h3>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                {chatMessages.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {chatMessages.filter(m => searchTerm === '' || m.text.includes(searchTerm)).map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-6 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors relative group ${!msg.isRead && msg.sender === 'user' ? 'bg-dashboard-blue/5' : ''}`}
                        onClick={() => msg.sender === 'user' && onMarkMessageRead(msg.id)}
                      >
                        {!msg.isRead && msg.sender === 'user' && (
                          <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                        )}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm ${msg.sender === 'user' ? 'bg-primary/10 text-primary' : 'bg-dashboard-blue/10 text-dashboard-blue'}`}>
                              {msg.userName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white flex items-center gap-2">
                                {msg.userName} 
                                {msg.sender === 'agent' && <span className="bg-dashboard-blue/20 text-dashboard-blue text-[9px] px-1 rounded uppercase">自动回复</span>}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                咨询房源: <span className="text-slate-300 italic">{msg.propertyTitle}</span>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-slate-600">
                            {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`ml-13 p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-white/5 border border-white/10 text-slate-200 italic' : 'bg-dashboard-blue/5 border border-dashboard-blue/10 text-slate-400'}`}>
                          {msg.text}
                        </div>
                        <div className="ml-13 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-[10px] font-bold text-dashboard-blue hover:underline">立即回复</button>
                           <button className="text-[10px] font-bold text-slate-500 hover:text-white">查看房源</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4">chat_bubble_outline</span>
                    <p className="text-sm font-bold">暂无咨询消息</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeView === 'properties' ? (
            <div className="bg-card-dark rounded-xl border border-white/5 shadow-xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-white flex items-center gap-2">房源列表</h3>
                  <div className="flex items-center gap-1 bg-background-dark p-1 rounded-lg">
                    {(['全部', '招租中', '已预定', '已下架'] as const).map(tab => (
                      <button key={tab} onClick={() => setFilterTab(tab)} className={`px-3 py-1 text-xs rounded transition-colors ${filterTab === tab ? 'bg-dashboard-blue text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative">
                  <button 
                    disabled={selectedRows.size === 0}
                    onClick={() => setShowBatchMenu(!showBatchMenu)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-xs font-bold text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-black/20"
                  >
                    批量操作 ({selectedRows.size})
                    <span className={`material-symbols-outlined transition-transform duration-300 ${showBatchMenu ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {showBatchMenu && (
                    <div className="absolute top-full mt-2 right-0 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                      <button onClick={() => handleBatchStatusChange('招租中')} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-slate-300 hover:bg-white/5 border-b border-white/5 transition-colors">
                        <span className="material-symbols-outlined text-accent-green text-sm">check_circle</span> 统一招租中
                      </button>
                      <button onClick={() => handleBatchStatusChange('已预定')} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-slate-300 hover:bg-white/5 border-b border-white/5 transition-colors">
                        <span className="material-symbols-outlined text-accent-amber text-sm">event_available</span> 统一已预定
                      </button>
                      <button onClick={() => handleBatchStatusChange('已下架')} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-slate-300 hover:bg-white/5 border-b border-white/5 transition-colors">
                        <span className="material-symbols-outlined text-slate-400 text-sm">visibility_off</span> 统一已下架
                      </button>
                      <button onClick={handleBatchDelete} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-accent-red hover:bg-accent-red/10 font-bold transition-colors">
                        <span className="material-symbols-outlined text-sm">delete_forever</span> 批量彻底删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-4 w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedRows.size === filteredProperties.length && filteredProperties.length > 0}
                          onChange={() => {
                            if (selectedRows.size === filteredProperties.length) setSelectedRows(new Set());
                            else setSelectedRows(new Set(filteredProperties.map(p => p.id)));
                          }}
                          className="rounded border-white/10 bg-white/5 text-dashboard-blue"
                        />
                      </th>
                      <th className="px-6 py-4">房源信息</th>
                      <th className="px-6 py-4">租金</th>
                      <th className="px-6 py-4">状态</th>
                      <th className="px-6 py-4 text-right">管理操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProperties.length > 0 ? filteredProperties.map((row) => (
                      <tr 
                        key={row.id} 
                        onClick={() => setSelectedId(row.id)}
                        className={`hover:bg-white/[0.03] cursor-pointer group ${selectedId === row.id ? 'bg-white/[0.04]' : ''}`}
                      >
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedRows.has(row.id)}
                            onChange={() => toggleSelectRow(row.id)}
                            className="rounded border-white/10 bg-white/5 text-dashboard-blue"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-12 rounded bg-cover bg-center border border-white/5" style={{ backgroundImage: `url("${row.imageUrls[0]}")` }}></div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm group-hover:text-dashboard-blue transition-colors">{row.title}</span>
                              <span className="text-[10px] text-slate-500">ID: {row.id} · {row.area}㎡</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white font-bold text-sm">¥{row.price}</td>
                        <td className="px-6 py-4">
                          {uploadingId === row.id ? (
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-dashboard-blue" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          ) : (
                            <span className={`status-badge bg-${getStatusColor(row.status)}/10 text-${getStatusColor(row.status)} border-${getStatusColor(row.status)}/20`}>
                              {row.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => triggerUpload(row.id)} className="text-xs text-slate-400 hover:text-dashboard-blue flex items-center gap-1">视频</button>
                            <button onClick={() => startEditing(row)} className="text-xs text-slate-400 hover:text-white">编辑</button>
                            <button onClick={(e) => handleSingleDelete(e, row.id, row.title)} className="text-xs text-slate-400 hover:text-accent-red">删除</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-600">暂无匹配房源</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card-dark rounded-xl border border-white/5 shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-5 border-b border-white/5 bg-white/[0.01]">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group</span>
                  意向用户管理
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-4">姓名</th>
                      <th className="px-6 py-4">手机号</th>
                      <th className="px-6 py-4">感兴趣房源</th>
                      <th className="px-6 py-4">实名状态</th>
                      <th className="px-6 py-4">登记时间</th>
                      <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-dashboard-blue/20 flex items-center justify-center text-dashboard-blue font-bold text-xs uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white text-sm">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`tel:${user.phone}`} className="text-sm text-slate-300 hover:text-dashboard-blue transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">call</span>
                            {user.phone}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400 italic truncate max-w-[200px] block">
                            {user.sourceProperty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`status-badge ${user.authStatus === '已实名' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-slate-700/50 text-slate-500 border-white/5'}`}>
                            {user.authStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {user.createTime}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100">
                             <button onClick={() => handleDeleteUser(user.id)} className="text-xs text-slate-400 hover:text-accent-red">移除</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-600">暂无登记用户</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {editingProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1f2937] w-full max-w-5xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-dashboard-blue">edit_note</span>
                编辑房源详细信息
              </h3>
              <button onClick={handleCloseEdit} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleUpdateProperty} className="p-6 overflow-y-auto no-scrollbar grid grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">房源标题 <span className="text-accent-red">*</span></label>
                  <input 
                    className={`bg-background-dark border ${errors.title ? 'border-accent-red animate-shake' : 'border-white/10'} rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all`} 
                    placeholder="输入吸引人的房源名称" 
                    value={editingProperty.title} 
                    onChange={e => {
                      setEditingProperty({...editingProperty, title: e.target.value});
                      if (errors.title) setErrors({...errors, title: undefined});
                    }} 
                  />
                  {errors.title && <span className="text-[10px] text-accent-red font-bold">{errors.title}</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">月租金 (元) <span className="text-accent-red">*</span></label>
                    <input 
                      type="number" 
                      className={`bg-background-dark border ${errors.price ? 'border-accent-red animate-shake' : 'border-white/10'} rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all`} 
                      value={editingProperty.price} 
                      onChange={e => {
                        setEditingProperty({...editingProperty, price: Number(e.target.value)});
                        if (errors.price) setErrors({...errors, price: undefined});
                      }} 
                    />
                    {errors.price && <span className="text-[10px] text-accent-red font-bold">{errors.price}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">状态</label>
                    <select className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all" value={editingProperty.status} onChange={e => setEditingProperty({...editingProperty, status: e.target.value as any})}>
                      <option value="招租中">招租中</option>
                      <option value="已预定">已预定</option>
                      <option value="已成交">已成交</option>
                      <option value="已下架">已下架</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">户型选择 (室)</label>
                    <select 
                      className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all"
                      value={parseLayout(editingProperty.layout).rooms}
                      onChange={e => {
                        const { baths } = parseLayout(editingProperty.layout);
                        setEditingProperty({ ...editingProperty, layout: `${e.target.value}室${baths}卫` });
                      }}
                    >
                      <option value="0">0室 (开间)</option>
                      <option value="1">1室</option>
                      <option value="2">2室</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">户型选择 (卫)</label>
                    <select 
                      className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all"
                      value={parseLayout(editingProperty.layout).baths}
                      onChange={e => {
                        const { rooms } = parseLayout(editingProperty.layout);
                        setEditingProperty({ ...editingProperty, layout: `${rooms}室${e.target.value}卫` });
                      }}
                    >
                      <option value="0">0卫</option>
                      <option value="1">1卫</option>
                      <option value="2">2卫</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">房源相册 (设备上传或 URL)</label>
                  <div className="grid grid-cols-4 gap-3 bg-background-dark/50 p-4 rounded-xl border border-white/5">
                    {editingProperty.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group/img">
                        <img src={url} alt={`p-${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImageFromEditing(idx)}
                          className="absolute top-1 right-1 size-6 bg-accent-red text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-dashboard-blue text-white text-[8px] font-bold text-center py-0.5">封面图</span>}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => imageUploadRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-600 hover:border-dashboard-blue hover:text-dashboard-blue hover:bg-dashboard-blue/5 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-2xl mb-1">upload_file</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider">本地上传</span>
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input 
                      className="flex-1 bg-background-dark border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all" 
                      placeholder="或者在此粘贴图片 URL 地址..." 
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageToEditing())}
                    />
                    <button 
                      type="button" 
                      onClick={addImageToEditing}
                      className="bg-dashboard-blue/10 border border-dashboard-blue/20 text-dashboard-blue text-xs font-bold px-4 py-2 rounded-lg hover:bg-dashboard-blue hover:text-white transition-all active:scale-95"
                    >
                      添加 URL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">房源描述</label>
                  <textarea rows={6} className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue resize-none transition-all leading-relaxed" placeholder="输入房源详细介绍..." value={editingProperty.description} onChange={e => setEditingProperty({...editingProperty, description: e.target.value})} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">配套家电 (点击图标选中)</label>
                  <div className="grid grid-cols-5 gap-2 bg-background-dark/50 p-3 rounded-xl border border-white/5">
                    {APPLIANCE_TAGS.map(tag => {
                      const isSelected = editingProperty.tags.includes(tag.name);
                      return (
                        <button 
                          key={tag.name}
                          type="button"
                          onClick={() => toggleTag(tag.name)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                            isSelected 
                              ? 'bg-dashboard-blue/20 border-dashboard-blue text-dashboard-blue shadow-[0_0_10px_rgba(59,130,246,0.1)] scale-105' 
                              : 'bg-white/5 border-white/5 text-slate-500 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl mb-1">{tag.icon}</span>
                          <span className="text-[9px] font-bold">{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">面积 (㎡) <span className="text-accent-red">*</span></label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className={`bg-background-dark border ${errors.area ? 'border-accent-red animate-shake' : 'border-white/10'} rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all`} 
                    value={editingProperty.area} 
                    onChange={e => {
                      setEditingProperty({...editingProperty, area: Number(e.target.value)});
                      if (errors.area) setErrors({...errors, area: undefined});
                    }} 
                  />
                  {errors.area && <span className="text-[10px] text-accent-red font-bold">{errors.area}</span>}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">城市</label>
                    <select 
                      className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all"
                      value={editingProperty.city}
                      onChange={e => {
                        const newCity = e.target.value;
                        // 重置区县和街道
                        const districts = Object.keys(zhejiangData[newCity] || {});
                        const newDistrict = districts.length > 0 ? districts[0] : editingProperty.district;
                        const streets = (zhejiangData[newCity]?.[newDistrict] || []);
                        const newLocation = streets.length > 0 ? streets[0] : editingProperty.location;
                        setEditingProperty({...editingProperty, city: newCity, district: newDistrict, location: newLocation});
                      }}
                    >
                      {Object.keys(zhejiangData).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">区/县</label>
                    <select 
                      className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all"
                      value={editingProperty.district}
                      onChange={e => {
                        const newDistrict = e.target.value;
                        // 重置街道
                        const streets = (zhejiangData[editingProperty.city]?.[newDistrict] || []);
                        const newLocation = streets.length > 0 ? streets[0] : editingProperty.location;
                        setEditingProperty({...editingProperty, district: newDistrict, location: newLocation});
                      }}
                    >
                      {Object.keys(zhejiangData[editingProperty.city] || {}).map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">镇/街道</label>
                    <select 
                      className="bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all"
                      value={editingProperty.location}
                      onChange={e => setEditingProperty({...editingProperty, location: e.target.value})}
                    >
                      {(zhejiangData[editingProperty.city]?.[editingProperty.district] || []).map(street => (
                        <option key={street} value={street}>{street}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">详细地址 <span className="text-accent-red">*</span></label>
                  <input 
                    className={`bg-background-dark border ${errors.address ? 'border-accent-red animate-shake' : 'border-white/10'} rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-dashboard-blue transition-all`} 
                    placeholder="如: 北苑路88号北苑大厦2单元801" 
                    value={editingProperty.address} 
                    onChange={e => {
                      setEditingProperty({...editingProperty, address: e.target.value});
                      if (errors.address) setErrors({...errors, address: undefined});
                    }} 
                  />
                  {errors.address && <span className="text-[10px] text-accent-red font-bold">{errors.address}</span>}
                </div>
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-4 pt-8 border-t border-white/5 shrink-0">
                <button type="button" onClick={handleCloseEdit} className="text-sm font-bold text-slate-400 px-8 py-3 hover:text-white transition-colors">取消修改</button>
                <button type="submit" className="bg-dashboard-blue text-white text-sm font-black px-12 py-3 rounded-xl shadow-xl shadow-dashboard-blue/30 hover:scale-[1.02] active:scale-95 transition-all">确认并发布更新</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <aside className={`w-80 bg-sidebar-dark border-l border-white/10 hidden xl:flex flex-col shrink-0 ${activeView !== 'properties' ? 'opacity-0 pointer-events-none' : ''}`}>
        {activeProperty ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className={`status-badge bg-${getStatusColor(activeProperty.status)}/10 text-${getStatusColor(activeProperty.status)}`}>{activeProperty.status}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(activeProperty)} className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 border border-white/10 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                  <button onClick={(e) => handleSingleDelete(e, activeProperty.id, activeProperty.title)} className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 border border-white/10 hover:text-accent-red transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                </div>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{activeProperty.title}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {activeProperty.district} · {activeProperty.location}
              </p>
            </div>
            <div className="p-6 flex-1 space-y-6 overflow-y-auto no-scrollbar">
              <div className="relative aspect-video rounded-xl bg-center bg-cover border border-white/10 shadow-2xl overflow-hidden" style={{ backgroundImage: `url("${activeProperty.imageUrls[0]}")` }}>
                {activeProperty.imageUrls.length > 1 && (
                   <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-white border border-white/10">
                     +{activeProperty.imageUrls.length - 1} 张图片
                   </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">房源描述</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-4 italic">{activeProperty.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">配套设施</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeProperty.tags.map(t => (
                    <span key={t} className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-400 border border-white/5">{t}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">价格</p>
                  <p className="text-sm font-bold text-dashboard-blue">¥{activeProperty.price}/月</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">详细地址</p>
                  <p className="text-[10px] font-medium text-slate-300 truncate">{activeProperty.address || '未填写'}</p>
                </div>
              </div>

              <button className="w-full bg-dashboard-blue text-white font-bold py-3 rounded-xl shadow-lg shadow-dashboard-blue/10 active:scale-95 transition-transform">推送至租客端</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-slate-500">
            <span className="material-symbols-outlined text-6xl mb-4">apartment</span>
            <p className="text-sm font-bold">请选择房源查看预览</p>
          </div>
        )}
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        .ml-13 { margin-left: 3.25rem; }
      `}} />
    </div>
  );
};
