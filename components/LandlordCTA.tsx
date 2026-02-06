
import React from 'react';
import { LandlordConfig } from '../types';

interface LandlordCTAProps {
  onLoginClick?: () => void;
  landlordConfig?: LandlordConfig;
}

export const LandlordCTA: React.FC<LandlordCTAProps> = ({ onLoginClick, landlordConfig }) => {
  return (
    <section className="mt-16 px-1">
      <div className="relative bg-gradient-to-br from-bg-elevated to-bg-deep rounded-2xl p-8 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border border-border-dark shadow-2xl">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            您是房东吗？
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-normal">
            一键发布房源，尊享视频展示功能，通过微信快速分享至精准租客。我们提供官方实名认证服务，让您的租赁交易更高效、更安全、更透明。
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <button 
              onClick={onLoginClick}
              className="bg-primary text-white hover:bg-primary/90 px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
            >
              立即发布房源
            </button>
            <button 
              onClick={onLoginClick}
              className="bg-bg-deep border border-border-dark text-white hover:border-white/40 px-10 py-4 rounded-xl font-bold transition-all hover:bg-white/5"
            >
              进入房东后台
            </button>
          </div>
        </div>
        
        <div className="relative z-10 hidden lg:block perspective-1000">
          <div className="bg-white/5 backdrop-blur-3xl p-5 rounded-2xl border border-white/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="bg-white rounded-xl p-5 size-44 flex flex-col items-center justify-center gap-4">
              {landlordConfig?.qrCodeUrl ? (
                <img src={landlordConfig.qrCodeUrl} alt="房东二维码" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#121212] text-[72px] opacity-80">qr_code_2</span>
                  <span className="text-[10px] font-bold text-[#121212]/40 uppercase tracking-[0.2em] whitespace-nowrap">微信扫码管理</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
