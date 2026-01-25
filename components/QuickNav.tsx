
import React from 'react';

const FEATURES = [
  { icon: 'location_city', label: '热门商圈', id: 'districts', isWIP: true },
  { icon: 'subway', label: '地铁找房', id: 'subway', isWIP: true },
  { icon: 'videocam', label: '视频看房', id: 'video' },
  { icon: 'verified_user', label: '实名认证', id: 'verify' },
  { icon: 'share', label: '微信分享', id: 'share' },
  { icon: 'maps_home_work', label: '地图寻房', id: 'map' },
];

interface QuickNavProps {
  onFeatureClick?: (id: string) => void;
}

export const QuickNav: React.FC<QuickNavProps> = ({ onFeatureClick }) => {
  const handleClick = (feat: typeof FEATURES[0]) => {
    if (feat.isWIP) {
      alert(`${feat.label} 功能正在开发中，即将上线！`);
      return;
    }
    onFeatureClick?.(feat.id);
  };

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
      {FEATURES.map((feat) => (
        <button 
          key={feat.label}
          onClick={() => handleClick(feat)}
          className="flex flex-col items-center justify-center p-5 bg-bg-elevated border border-border-dark rounded-xl hover:bg-white/[0.03] transition-all group active:scale-[0.98] relative overflow-hidden" 
        >
          {feat.isWIP && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded uppercase tracking-tighter border border-primary/10">
              WIP
            </div>
          )}
          <span className="material-symbols-outlined text-primary text-3xl mb-3 transition-transform group-hover:scale-110 group-hover:-translate-y-1">
            {feat.icon}
          </span>
          <span className="text-sm font-semibold tracking-wide text-gray-200">{feat.label}</span>
        </button>
      ))}
    </section>
  );
};
