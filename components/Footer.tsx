
import React from 'react';
import { DEVELOPER_EMAIL } from '../constants';

const FOOTER_LINKS = [
  {
    title: '业务导航',
    links: ['二手房', '精选租房', '写字楼', '品牌公寓'],
  },
  {
    title: '关于我们',
    links: ['企业介绍', '加入我们', '新闻动态', '联系客服'],
  },
  {
    title: '特色功能',
    links: ['视频带看', '实名认证', '房东后台', '个人中心'],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-deep border-t border-border-dark mt-24 py-16 px-4 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="text-primary">
                <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">房源展示平台</h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              专为房东与租客打造的现代定制化房产服务平台，通过数字化手段让找房、管房变得简单、透明、真实可信。
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h4 className="text-primary text-[10px] font-black uppercase tracking-widest mb-2">软件定制开发</h4>
              <p className="text-gray-400 text-xs mb-3">需要类似的房产管理系统或其他行业定制方案？</p>
              <a 
                href={`mailto:${DEVELOPER_EMAIL}`} 
                className="text-white text-xs font-bold flex items-center gap-2 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">mail</span>
                {DEVELOPER_EMAIL}
              </a>
            </div>
          </div>
          
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-white mb-6 text-xs tracking-[0.1em] uppercase border-l-2 border-primary pl-3">
                {section.title}
              </h3>
              <ul className="space-y-4 text-sm text-gray-500">
                {section.links.map(link => (
                  <li key={link}>
                    <button 
                      onClick={() => alert('该模块正在全力开发中，敬请期待！')}
                      className="hover:text-primary transition-colors inline-block text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-border-dark flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="text-[11px] text-gray-600">© 2026 房源展示平台。保留所有权利。</p>
            <p className="text-[11px] text-gray-700">软件技术支持：{DEVELOPER_EMAIL}</p>
          </div>
          <div className="flex gap-8">
            <button onClick={() => alert('微信客服待接入')} className="text-gray-600 hover:text-primary transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-2xl">google_chat</span>
            </button>
            <button onClick={() => alert('在线客服待接入')} className="text-gray-600 hover:text-primary transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-2xl">chat</span>
            </button>
            <button onClick={() => window.location.href=`mailto:${DEVELOPER_EMAIL}`} className="text-gray-600 hover:text-primary transition-all hover:-translate-y-1">
              <span className="material-symbols-outlined text-2xl">headset_mic</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
