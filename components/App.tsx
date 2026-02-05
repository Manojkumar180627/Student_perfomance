
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, SystemNotification } from '../types';
import LoginPage from '../pages/LoginPage';
import StudentDashboard from '../pages/StudentDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import { storageService } from '../services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) setUser(JSON.parse(saved));

    const fetchNotifications = () => {
      const all = storageService.getNotifications();
      setNotifications(all);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifPanel(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('current_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setIsMobileMenuOpen(false);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasHighRiskAlert = notifications.some(n => !n.read && n.type === 'RISK_ALERT');

  // Side navbar now only contains Overview
  const navItems = [
    { label: 'Overview', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside 
        ref={mobileMenuRef}
        className={`fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white z-[70] transition-transform duration-300 ease-out lg:translate-x-0 lg:static flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-xl font-black tracking-tighter">EduPredict<span className="text-indigo-400">.AI</span></span>
        </div>

        <nav className="p-6 space-y-1">
          {navItems.map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all bg-indigo-600/10 text-indigo-400`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{item.icon}</svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm">{user.name.charAt(0)}</div>
              <div className="overflow-hidden">
                <p className="text-sm font-black truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
              Security Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-grow flex flex-col w-full min-w-0">
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 flex-shrink-0 z-[50]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex flex-col justify-center">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">Intelligence Terminal</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Node Active</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {user.role === UserRole.ADMIN && (
               <div className="relative" ref={notifRef}>
                 <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl relative transition-all group">
                   <svg className={`w-6 h-6 transition-transform ${unreadCount > 0 ? (hasHighRiskAlert ? 'animate-bounce text-rose-600' : 'animate-bounce text-indigo-600') : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                   {unreadCount > 0 && <span className={`absolute top-1.5 right-1.5 w-4 h-4 ${hasHighRiskAlert ? 'bg-rose-600' : 'bg-indigo-600'} border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold`}>{unreadCount}</span>}
                 </button>
                 {showNotifPanel && (
                   <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-up z-[60]">
                     <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Notifications</h4>
                       <button onClick={() => { storageService.markAllAsRead(); setNotifications(storageService.getNotifications()); }} className="text-[10px] font-bold text-indigo-600 uppercase">Clear All</button>
                     </div>
                     <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                       {notifications.length > 0 ? notifications.map((n) => (
                         <div key={n.id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.read ? (n.type === 'RISK_ALERT' ? 'bg-rose-50' : 'bg-indigo-50/20') : ''}`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`text-[11px] font-black leading-none ${n.type === 'RISK_ALERT' ? 'text-rose-600' : 'text-slate-900'}`}>{n.title}</p>
                              {n.type === 'RISK_ALERT' && <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[7px] font-black uppercase rounded tracking-tighter">Urgent Risk</span>}
                            </div>
                            <p className={`text-[10px] mt-1 leading-snug ${n.type === 'RISK_ALERT' ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>{n.message}</p>
                            <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                         </div>
                       )) : <div className="p-8 text-center text-slate-300 font-bold uppercase text-[10px]">No Alerts Pending</div>}
                     </div>
                   </div>
                 )}
               </div>
             )}
             <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1" />
             <div className="flex items-center gap-3">
               <div className="text-right hidden xs:block">
                 <p className="text-xs font-black text-slate-900">{user.name}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {user.registerNo || 'FAC-001'}</p>
               </div>
               <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                 {user.name.charAt(0)}
               </div>
             </div>
          </div>
        </header>

        <main className="flex-grow w-full overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 bg-[#F8FAFC]">
          <div className="flex flex-col min-h-full">
            {user.role === UserRole.STUDENT ? <StudentDashboard user={user} /> : <AdminDashboard user={user} />}
          </div>
        </main>

        <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex-shrink-0 z-20">
           <span>&copy; 2024 EDUPREDICT SYSTEMS</span>
           <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> NETWORK SECURE</span>
        </footer>
      </div>
    </div>
  );
};

export default App;
