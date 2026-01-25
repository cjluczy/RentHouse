
import React, { useState } from 'react';
import { landlordApi } from '../src/services/api';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await landlordApi.login(password);
      if (response.success) {
        onLoginSuccess();
      } else {
        setError(response.message || '登录失败');
      }
    } catch (err) {
      console.error('登录失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center overflow-hidden" 
      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAI8MqgmD_wbdv2TzDq1kX2Rbc-tkBIJ4jmS--fXS9TwdDtXBtmeO5VEp2eIohVsLPNH8ArpsoMuEf3-YP0OxCdOLOcWpIZ2nHXlKE2XeJEZ6KPznE3IUW9iipH0de2Pwbn6vicU6psF-bf6ZAWvPKZRUgl5Jlv9Zkanj6jWd_wE1SmO5JOFF2SvgtcpkjkM04JZA-0mMFLwhBUodUBmmC9Q82LQue_WA5Ix2XIQ002nfUsfHyGAzeLJbvGu2NgwciiPpctnWbO3g8')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background-dark/95 via-[#0f172a]/80 to-background-dark/90"></div>
      <div className="relative z-10 w-full max-w-[460px] px-6">
        <div className="glass-card shadow-2xl rounded-2xl overflow-hidden">
          <div className="pt-12 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-electric-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-electric-blue/20">
                <span className="material-symbols-outlined text-3xl">location_city</span>
              </div>
            </div>
            <h4 className="text-vibrant-blue text-xs font-bold leading-normal tracking-[0.2em] uppercase">Landlord Portal</h4>
            <h2 className="text-white tracking-tight text-3xl font-bold leading-tight pt-3">房东管理后台登录</h2>
            <p className="text-gray-400 text-sm font-medium leading-normal px-12 pt-2">安全登录您的房源管理控制台</p>
          </div>
          <form className="px-10 pb-12 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold tracking-wide">账号</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">person</span>
                <input 
                  className="form-input input-glow flex w-full rounded-xl border-vibrant-blue/50 bg-white/5 focus:bg-white/10 focus:border-vibrant-blue text-white h-14 pl-12 pr-4 text-base font-normal outline-none transition-all placeholder:text-gray-500" 
                  placeholder="账号 (admin)" 
                  type="text" 
                  defaultValue="admin"
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-white text-sm font-semibold tracking-wide">密码</label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">lock</span>
                <input 
                  className="form-input input-glow flex w-full rounded-xl border-vibrant-blue/50 bg-white/5 focus:bg-white/10 focus:border-vibrant-blue text-white h-14 pl-12 pr-16 text-base font-normal outline-none transition-all placeholder:text-gray-500" 
                  placeholder="请输入密码" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input className="form-checkbox w-4 h-4 rounded bg-white/5 border-white/20 text-electric-blue focus:ring-0 focus:ring-offset-0 transition-colors" type="checkbox"/>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">记住我</span>
              </label>
              <button 
                className="text-gray-400 font-medium hover:text-white transition-colors"
                onClick={() => alert('请通过邮件联系开发者获得密码更新，开发者邮箱：cjluczy@qq.com')}
              >
                忘记密码？
              </button>
            </div>
            <button 
              className="mt-4 w-full bg-electric-blue hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-electric-blue/30 flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                  <span className="text-base tracking-wide">登录中...</span>
                </>
              ) : (
                <>
                  <span className="text-base tracking-wide">立即登录</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
              <button 
                type="button"
                onClick={onBack}
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>返回首页</span>
              </button>
            </div>
          </form>
        </div>
        <p className="mt-10 text-center text-gray-400 text-sm">
          还没有账号？ <a className="text-white hover:text-vibrant-blue font-bold transition-colors underline decoration-vibrant-blue/30 underline-offset-4" href="#">申请访问权限</a>
        </p>
      </div>
    </div>
  );
};
