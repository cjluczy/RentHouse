
import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  onShare?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, onShare }) => {
  const coverImage = property.imageUrls[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div 
      onClick={() => onSelect?.(property)}
      className="group flex flex-col bg-bg-elevated rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-border-dark cursor-pointer hover:-translate-y-1"
    >
      {/* 媒体展示区 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-110 transition-transform duration-1000" 
          style={{ backgroundImage: `url("${coverImage}")` }}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {property.hasVideo && (
            <div className="flex items-center gap-1 bg-primary/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-tighter">
              <span className="material-symbols-outlined text-[12px] fill-1">play_circle</span>
              视频看房
            </div>
          )}
          {property.isNewProperty && (
            <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-tighter">
              <span className="material-symbols-outlined text-[12px] fill-1">new_releases</span>
              新上架
            </div>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onShare?.(property);
          }}
          className="absolute top-3 right-3 size-8 bg-black/40 backdrop-blur hover:bg-primary rounded-full text-white transition-all flex items-center justify-center border border-white/10"
        >
          <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
        </button>
      </div>
      
      {/* 文本内容区 */}
      <div className="p-5 flex flex-col gap-3">
        {/* 第一层级：标题 */}
        <h3 className="text-lg font-black text-white leading-tight truncate group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        
        {/* 第二层级：价格与关键参数 */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-primary italic">¥{property.price.toLocaleString()}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">/ 月</span>
          
          <div className="ml-auto flex items-center gap-1.5 text-gray-400 text-xs font-bold">
            <span>{property.layout}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <span>{property.area}㎡</span>
          </div>
        </div>
        
        {/* 第三层级：配套标签 (仅展示前4个) */}
        <div className="flex flex-wrap gap-1.5 py-1">
          {property.tags.slice(0, 4).map(tag => (
            <span key={tag} className="bg-white/5 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-white/5 font-medium">
              {tag}
            </span>
          ))}
          {property.tags.length > 4 && (
            <span className="text-[10px] text-gray-600 font-bold">+{property.tags.length - 4}</span>
          )}
        </div>
        
        {/* 第四层级：地理位置 (辅助信息) */}
        <div className="flex items-center gap-1 text-gray-500 mt-1 border-t border-border-dark pt-3">
          <span className="material-symbols-outlined text-[14px] opacity-50">location_on</span>
          <p className="text-[11px] font-medium truncate opacity-80">
            {property.district} · {property.location}
          </p>
        </div>
      </div>
    </div>
  );
};
