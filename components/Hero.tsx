
import React, { useState } from 'react';

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = () => {
    onSearch(searchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <section className="mb-10">
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="flex min-h-[400px] md:min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-6 transition-all duration-700 hover:scale-[1.01]" 
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 15, 0.3), rgba(15, 15, 15, 0.85)), url('/assets/images/google/hero-background.jpg')` 
          }}
        >
          <div className="flex flex-col gap-2 text-center max-w-2xl mb-4 animate-fadeIn">
            <h2 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight">发现理想居所，从这里开始</h2>
            <p className="text-gray-300 text-sm md:text-base font-normal opacity-90">海量真实房源，实名认证保障，视频看房更真实</p>
          </div>
          
          <div className="w-full max-w-[800px] px-4">
            <div className="flex flex-col md:flex-row w-full items-stretch bg-white rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 focus-within:shadow-primary/20">
              <div className="flex flex-1 items-center px-5 bg-white transition-all">
                <span className="material-symbols-outlined text-gray-400 mr-3">search</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 text-base py-4" 
                  placeholder="请输入小区、地段或房源"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button 
                onClick={handleSearchSubmit}
                className="bg-primary hover:bg-primary/90 text-white px-12 py-4 font-bold transition-all flex items-center justify-center gap-2 group"
              >
                <span>开始找房</span>
                <span className="material-symbols-outlined text-white transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-5 justify-center md:justify-start">
              <span className="text-xs text-gray-400 font-medium">热门搜索：</span>
              {['北苑', '一室一卫', '义乌', '现代简约'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => {
                    setSearchValue(tag);
                    onSearch(tag);
                  }}
                  className="text-xs text-gray-300 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
