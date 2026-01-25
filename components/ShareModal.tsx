
import React, { useState, useEffect } from 'react';
import { Property } from '../types';

interface ShareModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ property, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'poster' | 'link'>('poster');

  if (!isOpen || !property) return null;

  const shareUrl = `https://www.mihayo.me/?id=${property.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=1e293b&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `看看这套房源：${property.title}，价格仅需 ¥${property.price}/月`,
        url: shareUrl,
      }).catch(console.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-sm bg-[#161618] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-scaleUp">
        {/* Tab Switcher */}
        <div className="flex p-2 bg-white/5 mx-6 mt-6 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('poster')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'poster' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">photo_library</span>
            朋友圈卡片
          </button>
          <button 
            onClick={() => setActiveTab('link')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'link' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">link</span>
            分享链接
          </button>
        </div>

        {activeTab === 'poster' ? (
          /* Poster Mode: Designed to be screenshot-ready for WeChat Moments */
          <div className="p-6">
            <div id="poster-area" className="bg-[#f8f9fa] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
              <div className="relative aspect-[4/3]">
                <img 
                  src={property.imageUrls[0]} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                  推荐房源
                </div>
              </div>
              
              <div className="p-6 pb-4">
                <h3 className="text-xl font-black text-[#1e293b] leading-tight mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center gap-3 text-gray-500 text-xs font-bold mb-6">
                  <span>{property.layout}</span>
                  <span className="size-1 rounded-full bg-gray-300"></span>
                  <span>{property.area}㎡</span>
                  <span className="size-1 rounded-full bg-gray-300"></span>
                  <span>{property.district}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                  <div className="flex flex-col">
                    <p className="text-primary text-2xl font-black italic">
                      ¥{property.price.toLocaleString()}<span className="text-[10px] font-bold text-gray-400 not-italic ml-1">/ 月</span>
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-[0.1em]">诚意出租 · 欢迎咨询</p>
                  </div>
                  
                  <div className="size-20 bg-white p-1 rounded-xl shadow-md relative">
                    {!qrLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl">
                        <div className="size-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img 
                      src={qrCodeUrl} 
                      alt="Share QR" 
                      className={`w-full h-full transition-opacity ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setQrLoaded(true)}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 py-3 text-center">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">长按保存图片或扫码查看详情</p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={() => alert('提示：长按上方卡片或截图即可分享到朋友圈')}
                className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">image</span>
                保存朋友圈海报
              </button>
              <button 
                onClick={onClose}
                className="w-full text-slate-500 hover:text-white text-xs font-bold transition-colors py-2"
              >
                取消分享
              </button>
            </div>
          </div>
        ) : (
          /* Link Mode */
          <div className="p-8">
             <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center size-14 rounded-3xl bg-dashboard-blue/10 text-dashboard-blue mb-4 border border-dashboard-blue/20">
                 <span className="material-symbols-outlined text-4xl">link</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">分享链接</h3>
               <p className="text-gray-500 text-xs">通过复制链接或系统分享将房源发给好友</p>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 mb-8">
                <div className="size-16 rounded-xl bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: `url("${property.imageUrls[0]}")` }}></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate mb-1">{property.title}</h4>
                  <p className="text-primary text-sm font-black">¥{property.price.toLocaleString()}/月</p>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleCopy}
                  className={`w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
                    copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{copied ? 'check_circle' : 'content_copy'}</span>
                  {copied ? '链接已成功复制' : '复制房源链接'}
                </button>
                
                {navigator.share && (
                  <button 
                    onClick={handleNativeShare}
                    className="w-full h-14 bg-dashboard-blue text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-dashboard-blue/20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">ios_share</span>
                    发送给微信好友
                  </button>
                )}
                
                <button 
                  onClick={onClose}
                  className="w-full text-slate-500 hover:text-white text-xs font-bold transition-colors pt-4"
                >
                  关闭
                </button>
             </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scaleUp {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};
