
import React, { useState, useRef, useEffect } from 'react';
import { User, Notification, UserRole } from '../types';

interface LayoutProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  darkMode: boolean;
  toggleTheme: () => void;
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, activeTab, setActiveTab, onLogout, children, 
  darkMode, toggleTheme, notifications, setNotifications 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'transfers', label: 'Transfers', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'resources', label: 'Resource Hub', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  if (user.role === UserRole.TEACHER) {
    navItems.push({ id: 'temporary', label: 'Relief Teaching', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' });
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleTheme = () => {
    switch(user.role) {
      case UserRole.SUPER_ADMIN: return 'bg-slate-900';
      case UserRole.REGIONAL_OFFICER: return 'bg-gov-navy';
      case UserRole.SUB_REGIONAL_OFFICER: return 'bg-gov-blue';
      default: return 'bg-gov-blue';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors selection:bg-gov-blue selection:text-white">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-shrink-0 flex flex-col hidden lg:flex transition-all">
        <div className="p-10 flex items-center space-x-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative">
            <div className="w-12 h-12 bg-gov-blue rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl rotate-3 group-hover:rotate-0 transition-transform">BW</div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full border-4 border-gov-blue"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter dark:text-white leading-none">TSM</h1>
            <p className="text-[10px] font-bold text-gov-blue tracking-[0.2em] mt-1.5 uppercase">Teaching Service</p>
          </div>
        </div>
        
        <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-5 mt-4">Navigation</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                activeTab === item.id 
                  ? `${getRoleTheme()} text-white shadow-xl active:scale-95` 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${activeTab === item.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-gov-blue/10'} transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                </svg>
              </div>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
          
          {user.role !== UserRole.TEACHER && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-5 mt-10">Administrative</p>
              <button
                onClick={() => setActiveTab('management')}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[1.5rem] transition-all group ${
                  activeTab === 'management' 
                    ? `${getRoleTheme()} text-white shadow-xl active:scale-95` 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeTab === 'management' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-gov-blue/10'} transition-colors`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-bold text-sm tracking-tight">Management</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800">
           <button onClick={onLogout} className="w-full flex items-center space-x-4 p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="text-sm">Log Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-12 top-0 z-30 transition-all">
          <div className="flex items-center space-x-6">
            <div className={`h-10 w-1.5 ${getRoleTheme()} rounded-full hidden sm:block`}></div>
            <h2 className="text-2xl font-black tracking-tighter dark:text-white capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-5">
            <button 
              onClick={toggleTheme}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-gov-blue hover:bg-blue-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-gov-blue hover:bg-blue-50 dark:hover:bg-slate-800 rounded-2xl transition-all relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
                )}
              </button>
            </div>

            <div className="relative pl-5 border-l border-slate-100 dark:border-slate-800 ml-2" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-4 p-1.5 pl-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group"
              >
                <div className={`w-11 h-11 rounded-2xl ${getRoleTheme()} flex items-center justify-center text-white text-sm font-black shadow-xl group-hover:scale-105 transition-transform`}>
                  {user.name.charAt(0)}
                </div>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 py-4 animate-in zoom-in-95 duration-300 origin-top-right">
                  <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800">
                    <p className="text-sm font-black dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-colors flex items-center space-x-3 ${activeTab === 'profile' ? 'text-gov-blue bg-blue-50 dark:bg-blue-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       <span>My Profile</span>
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold text-red-500 transition-colors flex items-center space-x-3">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                       <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 lg:p-16 relative">
          <div className="max-w-[1400px] mx-auto h-full relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
