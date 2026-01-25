
import React, { useState, useEffect, useRef } from 'react';
import { Property, LandlordConfig, ChatMessage } from '../types';
import { APPLIANCE_TAGS } from '../constants';

interface PropertyDetailsProps {
  property: Property;
  landlordConfig: LandlordConfig;
  onBack: () => void;
  onShare?: () => void;
  onAddInterestedUser: (user: { name: string, phone: string, propertyTitle: string }) => void;
  onSendMessage: (msg: ChatMessage) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, landlordConfig, onBack, onShare, onAddInterestedUser, onSendMessage }) => {
  const [viewMode, setViewMode] = useState<'video' | 'image' | 'panorama'>('image');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regData, setRegData] = useState({ name: '', phone: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  // 本地状态，用于存储带有视频URL的房源对象
  const [localProperty, setLocalProperty] = useState<Property>(property);

  // 从本地存储加载视频URL
  useEffect(() => {
    const storedVideoUrl = localStorage.getItem(`video_${property.id}`);
    if (storedVideoUrl && property.hasVideo) {
      setLocalProperty({ ...property, videoUrl: storedVideoUrl });
    } else {
      setLocalProperty(property);
    }
  }, [property]);
  
  // Panorama State
  const [isDragging, setIsDragging] = useState(false);
  const [panoramaPos, setPanoramaPos] = useState(0);
  const lastX = useRef(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoPlayInterval = useRef<number | null>(null);

  const CONTACT_PHONE = landlordConfig.phone;
  const WECHAT_ID = landlordConfig.wechatId;
  
  const PANORAMA_URL = "https://pannellum.org/images/alma.jpg"; 

  // Load local chat history for this specific property
  useEffect(() => {
    const savedChat = localStorage.getItem(`chat_${property.id}`);
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      const welcomeMsg: ChatMessage = {
        id: 'welcome-' + Date.now(),
        propertyId: property.id,
        propertyTitle: property.title,
        userName: '置业顾问',
        text: `您好！我是房产管家${landlordConfig.name.charAt(0)}老师，看到您正在关注“${property.title}”。这套房源采光非常好，您可以随时咨询我相关细节。`,
        sender: 'agent',
        timestamp: Date.now(),
      };
      setMessages([welcomeMsg]);
    }
  }, [property.id, property.title, landlordConfig.name]);

  // Save local history & scroll
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${property.id}`, JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, property.id]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      propertyId: property.id,
      propertyTitle: property.title,
      userName: '匿名租客',
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
      isRead: false
    };

    setMessages(prev => [...prev, newUserMsg]);
    onSendMessage(newUserMsg);
    setInputText('');

    // Default auto-reply
    setTimeout(() => {
      const agentReply: ChatMessage = {
        id: 'reply-' + Date.now(),
        propertyId: property.id,
        propertyTitle: property.title,
        userName: landlordConfig.name,
        text: "好的，我已经收到您的消息。正在为您查询具体的看房档期，请稍等片刻...",
        sender: 'agent',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentReply]);
      onSendMessage(agentReply);
    }, 1500);
  };

  const handleOpenMap = () => {
    const query = encodeURIComponent(`${property.city} ${property.district} ${property.address}`);
    window.open(`https://uri.amap.com/marker?position=&name=${query}`, '_blank');
  };

  const handlePhoneCall = () => {
    window.location.href = `tel:${CONTACT_PHONE}`;
  };

  const handleWeChatAppointment = () => {
    navigator.clipboard.writeText(WECHAT_ID);
    alert('客服微信号已复制: ' + WECHAT_ID + '\n即将为您打开微信...');
    window.location.href = "weixin://";
  };

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.phone) return;
    onAddInterestedUser({ ...regData, propertyTitle: property.title });
    setIsRegModalOpen(false);
    alert('实名登记已成功提交！我们的置业顾问会尽快联系您。');
  };

  useEffect(() => {
    if (isAutoPlaying && viewMode === 'image') {
      autoPlayInterval.current = window.setInterval(() => {
        setActiveImageIndex((prev) => {
          const next = (prev + 1) % property.imageUrls.length;
          if (scrollRef.current) {
            const width = scrollRef.current.clientWidth;
            scrollRef.current.scrollTo({ left: next * width, behavior: 'smooth' });
          }
          return next;
        });
      }, 3500);
    }
    return () => {
      if (autoPlayInterval.current) clearInterval(autoPlayInterval.current);
    };
  }, [isAutoPlaying, viewMode, property.imageUrls.length]);

  const handlePanoramaStart = (clientX: number) => {
    if (viewMode !== 'panorama') return;
    setIsDragging(true);
    lastX.current = clientX;
  };

  const handlePanoramaMove = (clientX: number) => {
    if (!isDragging || viewMode !== 'panorama') return;
    const delta = clientX - lastX.current;
    setPanoramaPos(prev => prev + delta * 0.2); 
    lastX.current = clientX;
  };

  const handlePanoramaEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative mx-auto max-w-[480px] min-h-screen bg-[#0A0A0B] shadow-2xl flex flex-col overflow-hidden text-white font-display">
      
      {/* 顶部悬浮导航栏 */}
      <header className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between px-5 py-8 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onBack}
          className="flex items-center justify-center size-11 rounded-full bg-black/30 backdrop-blur-xl text-white border border-white/10 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </button>
        <span className="text-white font-extrabold text-lg tracking-tight drop-shadow-md">房源详情</span>
        <div className="flex gap-3">
          <button 
            onClick={onShare}
            className="flex items-center justify-center size-11 rounded-full bg-black/30 backdrop-blur-xl text-white border border-white/10 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-2xl">share</span>
          </button>
        </div>
      </header>

      {/* 主滚动内容区 */}
      <main className="flex-1 overflow-y-auto pb-36 no-scrollbar">
        
        {/* 媒体英雄区 */}
        <div className="relative w-full aspect-[4/5] bg-[#111] overflow-hidden">
          {viewMode === 'image' && (
            <div 
              ref={scrollRef}
              className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth" 
              onScroll={(e) => {
                const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                const width = (e.target as HTMLDivElement).clientWidth;
                const newIndex = Math.round(scrollLeft / width);
                if (newIndex !== activeImageIndex) setActiveImageIndex(newIndex);
              }}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {property.imageUrls.map((url, idx) => (
                <div key={idx} className="shrink-0 w-full h-full snap-center relative">
                  <div 
                    className="w-full h-full bg-center bg-cover" 
                    style={{ backgroundImage: `url("${url}")` }}
                  ></div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'video' && (
            <div className="absolute inset-0 z-30 bg-black">
              {localProperty.videoUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <video 
                      src={localProperty.videoUrl} 
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      style={{ backgroundColor: 'transparent' }}
                      onError={(e) => {
                        console.error('视频加载失败:', e);
                        // 视频加载失败时，隐藏视频元素，显示错误提示
                        const videoElement = e.target as HTMLVideoElement;
                        if (videoElement) {
                          videoElement.style.display = 'none';
                          const errorContainer = videoElement.parentElement;
                          if (errorContainer) {
                            errorContainer.innerHTML = `
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="size-24 rounded-full bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center animate-pulse">
                                  <span className="material-symbols-outlined text-5xl text-white fill-1">error_outline</span>
                                </div>
                                <p className="mt-6 text-sm font-bold text-white/80 tracking-widest uppercase">视频加载失败</p>
                                <p className="mt-2 text-xs text-white/60 text-center max-w-xs">该视频文件可能已损坏或格式不支持</p>
                              </div>
                            `;
                          }
                        }
                      }}
                      onLoadedData={(e) => {
                        console.log('视频加载成功:', e.target);
                        // 视频加载成功后，确保视频元素可见
                        const videoElement = e.target as HTMLVideoElement;
                        if (videoElement) {
                          videoElement.style.display = 'block';
                        }
                      }}
                      onWaiting={() => {
                        console.log('视频正在缓冲...');
                      }}
                      onPlaying={() => {
                        console.log('视频开始播放');
                      }}
                    />
                    {/* 视频加载中提示 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300" id="video-loading">
                      <div className="size-16 rounded-full border-4 border-white/30 border-t-primary animate-spin"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <div className="size-24 rounded-full bg-primary shadow-[0_0_40px_rgba(255,90,95,0.5)] flex items-center justify-center animate-pulse cursor-pointer">
                    <span className="material-symbols-outlined text-5xl text-white fill-1">play_arrow</span>
                  </div>
                  <p className="mt-6 text-sm font-bold text-white/80 tracking-widest uppercase">正在连接实景视频源...</p>
                </div>
              )}
            </div>
          )}

          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
          `}</style>

          {viewMode === 'panorama' && (
            <div 
              className={`absolute inset-0 z-30 bg-[#222] cursor-grab active:cursor-grabbing transition-opacity duration-700 overflow-hidden ${isDragging ? '' : 'animate-slowPan'}`}
              onMouseDown={(e) => handlePanoramaStart(e.clientX)}
              onMouseMove={(e) => handlePanoramaMove(e.clientX)}
              onMouseUp={handlePanoramaEnd}
              onMouseLeave={handlePanoramaEnd}
              onTouchStart={(e) => handlePanoramaStart(e.touches[0].clientX)}
              onTouchMove={(e) => handlePanoramaMove(e.touches[0].clientX)}
              onTouchEnd={handlePanoramaEnd}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center origin-center transition-transform"
                style={{ 
                  backgroundImage: `url("${PANORAMA_URL}")`,
                  backgroundSize: 'auto 100%',
                  backgroundPosition: `${panoramaPos}% center`,
                  transform: 'scale(1.5)'
                }}
              ></div>
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                 <div className="size-20 border-2 border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <span className="material-symbols-outlined text-white/40 text-4xl animate-pulse">explore</span>
                 </div>
                 <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">拖拽环视 360°</p>
              </div>
            </div>
          )}
          
          {/* 媒体切换开关 */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex bg-black/60 backdrop-blur-3xl rounded-full p-1.5 border border-white/10 z-50 shadow-2xl">
            <button 
              onClick={() => { setViewMode('video'); setIsAutoPlaying(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black transition-all ${viewMode === 'video' ? 'bg-primary text-white shadow-xl' : 'text-white/60 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-sm">videocam</span> 视频
            </button>
            <button 
              onClick={() => { setViewMode('image'); setIsAutoPlaying(true); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black transition-all ${viewMode === 'image' ? 'bg-primary text-white shadow-xl' : 'text-white/60 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-sm">image</span> 实拍
            </button>
            <button 
              onClick={() => { setViewMode('panorama'); setIsAutoPlaying(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black transition-all ${viewMode === 'panorama' ? 'bg-primary text-white shadow-xl' : 'text-white/60 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-sm">360</span> 全景
            </button>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-50">
            {viewMode === 'image' && property.imageUrls.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${activeImageIndex === idx ? 'bg-primary w-6 shadow-[0_0_10px_rgba(255,90,95,0.6)]' : 'bg-white/20 w-1.5'}`}></div>
            ))}
          </div>
        </div>

        {/* 内容卡片区 */}
        <div className="relative -mt-8 bg-[#161618] rounded-t-[3rem] px-6 pt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/5">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full"></div>
          
          <div className="flex justify-between items-end mb-6">
            <p className="text-primary text-4xl font-black italic tracking-tighter">
              ¥{property.price.toLocaleString()}<span className="text-base font-bold text-gray-500 not-italic ml-1">/ 月</span>
            </p>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">verified</span> 已实名认证
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-4 leading-tight">{property.title}</h1>
          
          <div onClick={handleOpenMap} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-8 active:scale-[0.98] transition-all cursor-pointer group">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{property.city} {property.district} {property.location}</span>
              <span className="text-xs text-gray-500 mt-1">{property.address}</span>
            </div>
            <span className="material-symbols-outlined text-gray-600 ml-auto self-center">chevron_right</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10 pb-8 border-b border-white/5">
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">户型</p>
              <p className="text-lg font-bold text-white">{property.layout}</p>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">面积</p>
              <p className="text-lg font-bold text-white">{property.area}㎡</p>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">朝向</p>
              <p className="text-lg font-bold text-white">南</p>
            </div>
          </div>

          <section className="mb-10">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">countertops</span> 房源配套
            </h3>
            <div className="grid grid-cols-5 gap-y-8">
              {APPLIANCE_TAGS.map(appliance => {
                const isIncluded = property.tags.includes(appliance.name);
                return (
                  <div key={appliance.name} className={`flex flex-col items-center gap-2 transition-all duration-700 ${isIncluded ? 'opacity-100 scale-100' : 'opacity-15 grayscale'}`}>
                    <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${isIncluded ? 'bg-white/5 text-primary border border-white/10' : 'text-gray-500'}`}>
                      <span className="material-symbols-outlined text-2xl">{appliance.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{appliance.name}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-10 pt-8 border-t border-white/5">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span> 房源亮点
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap tracking-wide bg-white/5 p-6 rounded-3xl border border-white/5 italic font-light">
              {property.description}
            </p>
          </section>

          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">map</span> 地理位置
              </h3>
              <button onClick={handleOpenMap} className="text-[11px] font-black text-primary flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 active:scale-95 transition-all">
                查看路线 <span className="material-symbols-outlined text-sm">explore</span>
              </button>
            </div>
            <div onClick={handleOpenMap} className="relative w-full h-56 rounded-[2.5rem] overflow-hidden bg-[#1f2937] border border-white/10 group cursor-pointer shadow-2xl">
              <div className="absolute inset-0 bg-cover bg-center grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100" style={{ backgroundImage: 'url("/assets/images/p1.jpg")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#161618]/80 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-8 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="size-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-primary shadow-[0_0_30px_rgba(255,90,95,0.4)] relative z-10">
                    <span className="material-symbols-outlined text-primary text-4xl animate-bounce">location_on</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 底部吸底操作栏 */}
      <footer className="absolute bottom-0 left-0 right-0 p-5 bg-[#0A0A0B]/90 backdrop-blur-3xl border-t border-white/10 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 max-w-[440px] mx-auto">
          <div 
            onClick={() => setIsRegModalOpen(true)}
            className="flex flex-col items-center px-2 text-gray-400 hover:text-primary transition-all cursor-pointer group shrink-0"
          >
            <span className="material-symbols-outlined text-2xl group-hover:fill-1 transition-all">how_to_reg</span>
            <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">我想要</span>
          </div>
          
          <button 
            onClick={() => setIsChatOpen(true)}
            className="size-14 bg-white/5 text-white font-black rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-2xl">headset_mic</span>
          </button>

          <button onClick={handlePhoneCall} className="flex-1 h-14 bg-white/5 text-white font-black rounded-2xl flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-xl">call</span>
            电话咨询
          </button>
          <button onClick={handleWeChatAppointment} className="flex-[1.5] h-14 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,90,95,0.3)] hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-xl">chat</span>
            微信预约
          </button>
        </div>
      </footer>

      {/* 实名认证登记模态框 */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRegModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#161618] rounded-[2.5rem] border border-white/10 shadow-2xl p-8 animate-scaleUp">
            <h3 className="text-xl font-black text-white mb-2">我想要这套房</h3>
            <p className="text-slate-400 text-xs mb-8">请填写您的真实联系方式，以便专属顾问为您安排看房。</p>
            
            <form onSubmit={handleRegSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">您的姓名</label>
                <input 
                  autoFocus
                  required
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-primary transition-all text-white placeholder:text-slate-600"
                  placeholder="请输入姓名"
                  value={regData.name}
                  onChange={e => setRegData({...regData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">手机号码</label>
                <input 
                  required
                  type="tel"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-primary transition-all text-white placeholder:text-slate-600"
                  placeholder="请输入11位手机号"
                  value={regData.phone}
                  onChange={e => setRegData({...regData, phone: e.target.value})}
                />
              </div>
              
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="submit"
                  className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  确定申请
                </button>
                <button 
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  className="w-full h-12 text-slate-500 text-xs font-bold"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 在线聊天窗口 */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center animate-fadeIn">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsChatOpen(false)}></div>
          <div className="relative w-full max-w-[480px] h-[85vh] bg-[#161618] rounded-t-[2.5rem] flex flex-col shadow-2xl border-t border-white/10 animate-slideUp overflow-hidden">
             <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1f2937]/50">
               <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="size-12 rounded-2xl bg-dashboard-blue/20 flex items-center justify-center text-dashboard-blue border border-dashboard-blue/10">
                       <span className="material-symbols-outlined text-2xl">support_agent</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-[#161618]"></div>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-black text-white">房产管家-${landlordConfig.name.charAt(0)}老师</span>
                   <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">当前在线</span>
                 </div>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined">close</span>
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                      <p className={`text-[9px] mt-2 opacity-40 font-bold ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className="p-4 bg-[#1f2937]/30 border-t border-white/5 pb-10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-primary transition-all">
                   <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-white placeholder:text-slate-500" 
                    placeholder="输入您想咨询的问题..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                   />
                   <button 
                    type="submit"
                    className="size-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                    disabled={!inputText.trim()}
                   >
                     <span className="material-symbols-outlined rotate-[-45deg] translate-x-0.5 -translate-y-0.5">send</span>
                   </button>
                </form>
             </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slowPan { 
          0% { background-position: 0% center; }
          100% { background-position: 100% center; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-slowPan { animation: slowPan 60s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};
