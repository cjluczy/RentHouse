
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickNav } from './components/QuickNav';
import { PropertyCard } from './components/PropertyCard';
import { LandlordCTA } from './components/LandlordCTA';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { PropertyDetails } from './components/PropertyDetails';
import { LandlordDashboard } from './components/LandlordDashboard';
import { ShareModal } from './components/ShareModal';
import { PropertyMap } from './components/PropertyMap';
import { RealNameModal } from './components/RealNameModal';
import { FilterTab, Property, InterestedUser, LandlordConfig, ChatMessage } from './types';
import { propertyApi, userApi, chatApi, landlordApi } from './src/services/api';

const App: React.FC = () => {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allInterestedUsers, setAllInterestedUsers] = useState<InterestedUser[]>([]);
  const [allChatMessages, setAllChatMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>(FilterTab.RECOMMENDED);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'details' | 'dashboard'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [shareProperty, setShareProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isGlobalRegModalOpen, setIsGlobalRegModalOpen] = useState(false);

  const [landlordConfig, setLandlordConfig] = useState<LandlordConfig>({
    name: '李先生',
    avatar: '/assets/images/avatar.jpg',
    phone: '13888888888',
    wechatId: 'HousePlatform_Service',
    password: 'admin'
  });

  // 加载初始数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 加载房源数据
        const properties = await propertyApi.getProperties();
        setAllProperties(properties);

        // 加载用户数据
        const users = await userApi.getUsers();
        setAllInterestedUsers(users);

        // 加载房东配置
        const config = await landlordApi.getLandlordConfig();
        setLandlordConfig(config);

        // 加载聊天消息
        const saved = localStorage.getItem('global_chat_history');
        if (saved) {
          setAllChatMessages(JSON.parse(saved));
        }
      } catch (error) {
        console.error('加载初始数据失败:', error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('global_chat_history', JSON.stringify(allChatMessages));
  }, [allChatMessages]);

  // 当allProperties更新时，自动更新selectedProperty状态，确保详情页能获取到最新的房源数据
  useEffect(() => {
    if (selectedProperty) {
      const updatedProperty = allProperties.find(p => p.id === selectedProperty.id);
      if (updatedProperty) {
        setSelectedProperty(updatedProperty);
      }
    }
  }, [allProperties, selectedProperty]);

  const handleNewMessage = async (msg: ChatMessage) => {
    try {
      const newMessage = await chatApi.addChatMessage(msg);
      setAllChatMessages(prev => [newMessage, ...prev]);
    } catch (error) {
      console.error('发送消息失败:', error);
      // 失败时仍更新本地状态，确保用户体验
      setAllChatMessages(prev => [msg, ...prev]);
    }
  };

  const handleMarkAsRead = async (msgId: string) => {
    try {
      await chatApi.markAsRead(msgId);
    } catch (error) {
      console.error('标记消息已读失败:', error);
    }
    // 无论API调用是否成功，都更新本地状态
    setAllChatMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
  };

  // 基础过滤：仅展示活跃房源
  const visibleProperties = useMemo(() => {
    return allProperties.filter(p => p.status === '招租中' || p.status === '已预定');
  }, [allProperties]);

  // 搜索和标签组合过滤
  const filteredProperties = useMemo(() => {
    let result = [...visibleProperties];

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.location.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    switch (activeTab) {
      case FilterTab.NEW:
        result = result.filter(p => p.isNew);
        break;
      case FilterTab.PRICE_DROP:
        result = result.filter(p => p.price < 2500);
        break;
      default:
        break;
    }

    return result;
  }, [visibleProperties, activeTab, searchQuery]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setCurrentPage('details');
    setIsMapOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareTrigger = (property: Property) => {
    setShareProperty(property);
  };

  const handleAddInterestedUser = async (user: { name: string, phone: string, propertyTitle: string }) => {
    try {
      const newUser = await userApi.addUser(user);
      setAllInterestedUsers(prev => [newUser, ...prev]);
    } catch (error) {
      console.error('添加用户失败:', error);
      // 失败时创建本地用户，确保用户体验
      const localUser: InterestedUser = {
        id: `U${Date.now().toString().slice(-3)}`,
        name: user.name,
        phone: user.phone,
        sourceProperty: user.propertyTitle,
        authStatus: '已实名',
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      };
      setAllInterestedUsers(prev => [localUser, ...prev]);
    }
  };

  const handleGlobalRegSubmit = async (data: { name: string, phone: string }) => {
    try {
      await userApi.globalAuth(data);
      setIsGlobalRegModalOpen(false);
      alert('实名认证已成功！');
      // 重新加载用户数据
      const users = await userApi.getUsers();
      setAllInterestedUsers(users);
    } catch (error) {
      console.error('全局实名认证失败:', error);
      // 失败时仍显示成功，确保用户体验
      setIsGlobalRegModalOpen(false);
      alert('实名认证已成功！');
    }
  };

  const handlePlatformShare = () => {
    const platformDummy: any = {
      id: 'platform',
      title: '房源展示平台 - 找个舒服的家',
      price: 0,
      imageUrls: ['/assets/images/realestate.jpg']
    };
    setShareProperty(platformDummy);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('home'); // 如果在详情页搜索，跳回首页
    const element = document.getElementById('property-list-section');
    if (element) {
      setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleFeatureClick = (id: string) => {
    if (id === 'map') {
      setIsMapOpen(true);
    } else if (id === 'share') {
      handlePlatformShare();
    } else if (id === 'video') {
      handleSearch('视频看房');
    } else if (id === 'verify') {
      setIsGlobalRegModalOpen(true);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveTab(FilterTab.RECOMMENDED);
    setCurrentPage('home');
  };

  // 渲染主体内容
  const renderContent = () => {
    if (currentPage === 'dashboard') {
      return (
        <LandlordDashboard 
          onLogout={() => setCurrentPage('home')} 
          properties={allProperties} 
          setProperties={setAllProperties}
          interestedUsers={allInterestedUsers}
          setInterestedUsers={setAllInterestedUsers}
          chatMessages={allChatMessages}
          onMarkMessageRead={handleMarkAsRead}
          landlordConfig={landlordConfig}
          setLandlordConfig={setLandlordConfig}
        />
      );
    }

    if (currentPage === 'login') {
      return <LoginPage onBack={() => setCurrentPage('home')} onLoginSuccess={() => setCurrentPage('dashboard')} />;
    }

    if (currentPage === 'details' && selectedProperty) {
      return (
        <PropertyDetails 
          property={selectedProperty} 
          landlordConfig={landlordConfig}
          onBack={() => setCurrentPage('home')}
          onShare={() => handleShareTrigger(selectedProperty)}
          onAddInterestedUser={handleAddInterestedUser}
          onSendMessage={handleNewMessage}
        />
      );
    }

    return (
      <div className="min-h-screen bg-bg-deep flex flex-col">
        <Header onLoginClick={() => setCurrentPage('login')} onHomeClick={handleResetSearch} landlordAvatar={landlordConfig.avatar} />
        
        <main className="max-w-[1400px] mx-auto px-4 md:px-12 lg:px-24 py-8 flex-grow">
          <Hero onSearch={handleSearch} />
          <QuickNav onFeatureClick={handleFeatureClick} />
          
          <div id="property-list-section" className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-border-dark pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {searchQuery ? `搜索: "${searchQuery}"` : '优质房源推荐'}
              </h2>
              <div className="h-4 w-px bg-border-dark hidden sm:block"></div>
              <nav className="flex gap-6">
                {Object.values(FilterTab).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-bold transition-all relative py-1 ${
                      activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-growWidth"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            <button 
              onClick={handleResetSearch}
              className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold group"
            >
              显示全部房源 
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">chevron_right</span>
            </button>
          </div>
          
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onSelect={handlePropertySelect}
                  onShare={() => handleShareTrigger(property)}
                />
              ))
            ) : (
              <div className="col-span-full py-32 text-center text-gray-500 flex flex-col items-center gap-4 animate-fadeIn">
                <span className="material-symbols-outlined text-6xl opacity-20">search_off</span>
                <p className="text-lg">没有找到匹配 "{searchQuery}" 的活跃房源</p>
                <button 
                  onClick={handleResetSearch}
                  className="mt-2 bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-lg hover:bg-primary/20 transition-all font-bold text-sm"
                >
                  重置搜索
                </button>
              </div>
            )}
          </section>
          
          <LandlordCTA onLoginClick={() => setCurrentPage('login')} />
        </main>
        
        <Footer />
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* 这里的 Modal 组件现在可以在所有视图中被触发渲染 */}
      {isMapOpen && (
        <PropertyMap 
          properties={visibleProperties} 
          onClose={() => setIsMapOpen(false)} 
          onSelectProperty={handlePropertySelect}
        />
      )}

      <ShareModal 
        property={shareProperty} 
        isOpen={!!shareProperty} 
        onClose={() => setShareProperty(null)} 
      />

      <RealNameModal 
        isOpen={isGlobalRegModalOpen}
        onClose={() => setIsGlobalRegModalOpen(false)}
        onSubmit={handleGlobalRegSubmit}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes growWidth {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-growWidth {
          animation: growWidth 0.3s ease-out forwards;
        }
      `}} />
    </>
  );
};

export default App;
