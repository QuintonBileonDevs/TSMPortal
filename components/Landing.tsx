
import React from 'react';

interface LandingProps {
  onStart: () => void;
  onApplyRelief: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onApplyRelief }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors selection:bg-gov-blue selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gov-blue rounded-xl flex items-center justify-center text-white font-black shadow-lg rotate-3 group-hover:rotate-0 transition-transform">BW</div>
            <span className="text-xl font-black tracking-tight dark:text-white uppercase leading-none">TSM <span className="text-gov-blue">Portal</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-gov-blue transition-colors">Features</a>
            <a href="#stats" className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-gov-blue transition-colors">Stats</a>
            <button 
              onClick={onApplyRelief}
              className="text-xs font-black uppercase tracking-widest text-gov-blue hover:text-gov-dark transition-colors"
            >
              Relief Application
            </button>
            <button 
              onClick={onStart}
              className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              Staff Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gov-blue/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 px-5 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 animate-in slide-in-from-left duration-700">
              <span className="w-2.5 h-2.5 rounded-full bg-gov-blue animate-ping"></span>
              <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Digital Education 2025</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter animate-in slide-in-from-left duration-1000">
              Power to <br/>Botswana's <br/>
              <span className="text-gov-blue">Educators.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium animate-in slide-in-from-left duration-1000 delay-200">
              The Botswana Teacher Service Management (TSM) Portal is the centralized platform for teachers to manage their careers, transfers, and records.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 animate-in slide-in-from-left duration-1000 delay-300">
              <button onClick={onStart} className="px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-[2rem] font-black text-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all">
                Access Workspace
              </button>
              <button onClick={onApplyRelief} className="px-10 py-5 bg-white dark:bg-slate-800 dark:text-white text-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                Relief Teaching
              </button>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right duration-1000">
             <div className="relative z-10 bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-50 dark:border-slate-800 animate-float">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="h-40 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] p-8 flex flex-col justify-end">
                      <p className="text-3xl font-black text-gov-blue">28k+</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Personnel</p>
                    </div>
                    <div className="h-56 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center text-white">
                       <div className="w-12 h-12 bg-gov-blue rounded-2xl mb-6 shadow-xl shadow-blue-500/30 flex items-center justify-center font-black">BW</div>
                       <p className="text-lg font-black leading-tight">National Service Infrastructure</p>
                    </div>
                  </div>
                  <div className="space-y-6 pt-12">
                    <div className="h-56 bg-gov-blue rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
                      <p className="text-xs font-black opacity-80 uppercase tracking-widest">Active Market</p>
                      <p className="text-5xl font-black tracking-tighter">412 <span className="text-sm font-bold block opacity-60 mt-1 uppercase tracking-widest leading-none">Vacancies</span></p>
                    </div>
                    <div className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 flex items-center">
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-200"></div>)}
                      </div>
                    </div>
                  </div>
                </div>
             </div>
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-gov-blue rounded-full opacity-5 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-32 px-6 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
          {[
            { v: '100%', l: 'Digital Records' },
            { v: '840', l: 'Live Stations' },
            { v: '24/7', l: 'Availability' },
            { v: '<3d', l: 'Response Time' }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-5xl md:text-7xl font-black text-gov-blue mb-4 tracking-tighter">{stat.v}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center space-x-4 mb-8 justify-center md:justify-start">
              <div className="w-10 h-10 bg-gov-blue rounded-xl flex items-center justify-center text-white font-black shadow-lg">BW</div>
              <span className="text-2xl font-black tracking-tight">TSM <span className="opacity-50">Portal</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">The Ministry of Education is digitizing the teaching service to provide transparency and career efficiency for all Botswana educators.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors">Twitter</a>
            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors">Facebook</a>
            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors">Privacy</a>
            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-gov-blue transition-colors">Contact</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center md:text-left">
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">© 2025 Ministry of Education & Skills Development. Developed by Gaborone Tech Hub.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
