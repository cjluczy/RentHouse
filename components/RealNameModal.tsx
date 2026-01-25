
import React, { useState } from 'react';

interface RealNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string }) => void;
  title?: string;
  subtitle?: string;
}

export const RealNameModal: React.FC<RealNameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "实名认证登记",
  subtitle = "请填写您的真实联系方式，完成实名认证后可尊享优先看房服务。"
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit({ name, phone });
    setName('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#161618] rounded-[2.5rem] border border-white/10 shadow-2xl p-8 animate-scaleUp">
        <div className="flex justify-center mb-6">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
        </div>
        
        <h3 className="text-xl font-black text-white mb-2 text-center">{title}</h3>
        <p className="text-slate-400 text-xs mb-8 text-center">{subtitle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">您的姓名</label>
            <input 
              autoFocus
              required
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-primary transition-all text-white placeholder:text-slate-600"
              placeholder="请输入姓名"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">手机号码</label>
            <input 
              required
              type="tel"
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-primary transition-all text-white placeholder:text-slate-600"
              placeholder="请输入11位手机号"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              完成认证
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full h-12 text-slate-500 text-xs font-bold"
            >
              暂不认证
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
};
