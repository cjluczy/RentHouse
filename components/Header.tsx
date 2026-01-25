
import React from 'react';
import { NAV_ITEMS } from '../constants';

interface HeaderProps {
  onLoginClick?: () => void;
  onHomeClick?: () => void;
  landlordAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onHomeClick, landlordAvatar }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-bg-deep/90 backdrop-blur-md px-4 md:px-12 lg:px-24 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onHomeClick}
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              <svg className="size-7" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">房源展示平台</h1>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                className={`text-sm font-medium transition-colors ${item.active ? 'text-white' : 'text-gray-400 hover:text-primary'}`}
                href={item.href}
                onClick={(e) => {
                  if (item.label === '首页') {
                    e.preventDefault();
                    onHomeClick?.();
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5">
            <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="text-[11px]">消息</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">person</span>
              <span className="text-[11px]">个人中心</span>
            </button>
          </div>
          <div className="h-6 w-px bg-border-dark hidden md:block"></div>
          <button 
            onClick={onLoginClick}
            className="flex items-center justify-center rounded-lg border border-border-dark bg-bg-elevated text-gray-300 hover:text-white hover:border-primary transition-all h-9 px-4 text-xs font-medium"
          >
            房东后台
          </button>
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 ring-1 ring-white/10 border border-white/5 cursor-pointer hover:ring-primary/50 transition-all" 
            style={{ backgroundImage: `url("${landlordAvatar || 'https://via.placeholder.com/32'}")` }}
          ></div>
        </div>
      </div>
    </header>
  );
};
