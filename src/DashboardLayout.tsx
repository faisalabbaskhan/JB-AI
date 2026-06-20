import React from 'react';
import { Button } from './components/Button';
import { useStore } from './store';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Scissors, Wand2, Zap, Sparkles, RefreshCcw, CreditCard, Settings, LogOut, ShieldAlert, Film, Video, Music2, MessageSquare, Headphones, FileSearch } from 'lucide-react';

export function DashboardLayout() {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const sidebarLinks = [
    { name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'AI Image Gen', icon: <ImageIcon className="w-5 h-5" />, path: '/dashboard/generator' },
    { name: 'AI Video Gen', icon: <Film className="w-5 h-5" />, path: '/dashboard/video-gen' },
    { name: 'Animate to Video', icon: <Video className="w-5 h-5" />, path: '/dashboard/video-animate' },
    { name: 'Music Gen', icon: <Music2 className="w-5 h-5" />, path: '/dashboard/music-gen' },
    { name: 'Gemini Chat', icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/chat' },
    { name: 'Voice Chat', icon: <Headphones className="w-5 h-5" />, path: '/dashboard/voice-chat' },
    { name: 'Media Analysis', icon: <FileSearch className="w-5 h-5" />, path: '/dashboard/analyze-media' },
    { name: 'BG Remover', icon: <Scissors className="w-5 h-5" />, path: '/dashboard/background-remover' },
    { name: 'Enhancer', icon: <Wand2 className="w-5 h-5" />, path: '/dashboard/enhancer' },
    { name: 'Upscaler', icon: <Zap className="w-5 h-5" />, path: '/dashboard/upscaler' },
    { name: 'Object Remover', icon: <Sparkles className="w-5 h-5" />, path: '/dashboard/object-remover' },
    { name: 'Restoration', icon: <RefreshCcw className="w-5 h-5" />, path: '/dashboard/restoration' },
    { name: 'Billing', icon: <CreditCard className="w-5 h-5" />, path: '/dashboard/billing' },
  ];

  if (user.isAdmin) {
    sidebarLinks.push({ name: 'Admin Panel', icon: <ShieldAlert className="w-5 h-5" />, path: '/dashboard/admin' });
  }

  return (
    <div className="flex h-full w-full bg-[#0B1120] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col space-y-2">
        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4 mt-2">Tools</div>
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 p-2 rounded-xl text-[13px] font-medium transition-colors ${isActive ? 'active-tab shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto border-t border-white/5 pt-6 space-y-2">
          <Link to="/dashboard/settings" className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </Link>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-2 cursor-pointer" onClick={() => navigate('/pricing')}>
            <span className="text-xs font-bold uppercase">{user.plan} PLAN</span>
            {user.plan === 'Free' && <span className="text-[10px] underline">UPGRADE</span>}
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-2 border border-transparent" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0F172A] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function OverviewPage() {
  const { user } = useStore();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name.split(' ')[0]}</h1>
      <p className="text-slate-400 mb-8">What would you like to create today?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Generate Video", path: "/dashboard/video-gen", bg: "bg-pink-500/10", border: "border-pink-500/20", color: "text-pink-400" },
          { title: "Voice Chat", path: "/dashboard/voice-chat", bg: "bg-emerald-500/10", border: "border-emerald-500/20", color: "text-emerald-400" },
          { title: "Gemini Chat", path: "/dashboard/chat", bg: "bg-blue-500/10", border: "border-blue-500/20", color: "text-blue-400" },
          { title: "Generate Music", path: "/dashboard/music-gen", bg: "bg-yellow-500/10", border: "border-yellow-500/20", color: "text-yellow-400" },
          { title: "Generate Image", path: "/dashboard/generator", bg: "bg-cyan-500/10", border: "border-cyan-500/20", color: "text-cyan-400" },
          { title: "Analyze Media", path: "/dashboard/analyze-media", bg: "bg-orange-500/10", border: "border-orange-500/20", color: "text-orange-400" },
        ].map(card => (
          <div key={card.title} onClick={() => navigate(card.path)} className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg glass ${card.bg} ${card.border}`}>
            <h3 className={`font-semibold text-lg ${card.color}`}>{card.title}</h3>
            <p className="text-slate-400 text-sm mt-2">Get started instantly with AI.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
