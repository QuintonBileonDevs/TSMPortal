
import React, { useState } from 'react';

interface TransferCase {
  id: string;
  teacher: string;
  from: string;
  to: string;
  reason: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'transfers'>('transfers');
  const [pendingTransfers, setPendingTransfers] = useState<TransferCase[]>([
    { id: 'TR-101', teacher: 'Thabo Kekesi', from: 'Maun Secondary', to: 'Gaborone Secondary', reason: 'Family reunification and medical support for elderly parent.', date: '2024-05-10', priority: 'High' },
    { id: 'TR-102', teacher: 'Mpho Dintwa', from: 'Kanye Senior', to: 'Lobatse High', reason: 'Medical accessibility - requires specialist treatment in Lobatse.', date: '2024-05-12', priority: 'Medium' },
    { id: 'TR-103', teacher: 'Kesa Moloi', from: 'Francistown High', to: 'Molepolole Secondary', reason: 'Seeking professional growth in a different regional district.', date: '2024-05-14', priority: 'Low' },
  ]);

  const stats = [
    { label: 'National Teachers', value: '28,452', trend: '+2.1%', color: 'text-gov-blue', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Vacancies', value: '412', trend: '-5.4%', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'National Transfers', value: '1,204', trend: '+12%', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Schools Logged', value: '840', trend: '0%', color: 'text-slate-900 dark:text-white', bg: 'bg-slate-50 dark:bg-slate-800' },
  ];

  const handleApprove = (id: string) => {
    setPendingTransfers(prev => prev.filter(t => t.id !== id));
    alert(`Transfer Case ${id} has been formally APPROVED and moved to the Processing queue.`);
  };

  const handleReject = (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason !== null) {
      setPendingTransfers(prev => prev.filter(t => t.id !== id));
      alert(`Transfer Case ${id} has been REJECTED. Notification sent to the regional officer.`);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-black dark:text-white tracking-tight">Directorate Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">National-level teacher service insights and system controls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} p-8 rounded-[2.5rem] border border-white/10 shadow-sm relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 relative z-10">{s.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                s.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="flex bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800">
              <button 
                onClick={() => setActiveTab('transfers')}
                className={`flex-1 py-8 font-black text-xs uppercase tracking-[0.2em] transition-all relative ${activeTab === 'transfers' ? 'text-gov-blue' : 'text-slate-400'}`}
              >
                Transfer Cases ({pendingTransfers.length})
                {activeTab === 'transfers' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gov-blue rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`flex-1 py-8 font-black text-xs uppercase tracking-[0.2em] transition-all relative ${activeTab === 'audit' ? 'text-gov-blue' : 'text-slate-400'}`}
              >
                System Audit Trail
                {activeTab === 'audit' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gov-blue rounded-t-full"></div>}
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'transfers' ? (
                <div className="space-y-6">
                  {pendingTransfers.length === 0 ? (
                    <div className="py-20 text-center text-slate-300">
                       <svg className="w-20 h-20 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                       <p className="font-black uppercase tracking-widest text-sm">No Pending Transfer Cases</p>
                    </div>
                  ) : (
                    pendingTransfers.map((caseItem) => (
                      <div key={caseItem.id} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-gov-blue/20 transition-all group">
                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-xl dark:text-white flex items-center">
                                {caseItem.teacher}
                                <span className={`ml-4 px-3 py-1 text-[9px] uppercase tracking-widest font-black rounded-lg ${
                                  caseItem.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                  caseItem.priority === 'Medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>{caseItem.priority} Priority</span>
                              </h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{caseItem.date}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current</p>
                                <p className="text-sm font-bold dark:text-white truncate">{caseItem.from}</p>
                              </div>
                              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                                <p className="text-sm font-bold dark:text-white truncate">{caseItem.to}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">"{caseItem.reason}"</p>
                          </div>
                          <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[160px]">
                            <button 
                              onClick={() => handleApprove(caseItem.id)}
                              className="flex-1 py-4 bg-gov-blue text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                              Endorse Case
                            </button>
                            <button 
                              onClick={() => handleReject(caseItem.id)}
                              className="flex-1 py-4 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
                            >
                              Deny Request
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { user: 'Director Molefi', action: 'Authorized national posting batch 2024-Q1', time: '10 mins ago', icon: '⚡' },
                    { user: 'System Bot', action: 'Auto-synchronized payroll records with Ministry', time: '1 hour ago', icon: '🤖' },
                    { user: 'Officer - Lobatse', action: 'Mass updated staff status (140 records)', time: '2 hours ago', icon: '📝' },
                    { user: 'Admin One', action: 'Modified Salary Scale C3 parameters', time: '5 hours ago', icon: '⚙️' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-6 text-lg group-hover:scale-110 transition-transform shadow-sm">
                        {log.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{log.user}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{log.action}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
            <h3 className="font-black text-2xl mb-10 relative z-10 tracking-tight">System Controls</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Manage Salary Scales', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'School Registry', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { label: 'User Permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { label: 'Notification Engine', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
              ].map((item, i) => (
                <button key={i} className="w-full text-left p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 flex items-center justify-between group/btn shadow-sm">
                  <div className="flex items-center space-x-4">
                    <svg className="w-5 h-5 text-gov-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                    <span className="text-sm font-bold opacity-80">{item.label}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-gov-blue/20 rounded-full blur-3xl -ml-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
          
          <div className="bg-gov-blue rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/30">
            <h4 className="font-black uppercase tracking-[0.2em] text-[10px] opacity-70 mb-4">Network Health</h4>
            <div className="flex items-center space-x-4">
               <div className="w-4 h-4 rounded-full bg-white animate-pulse shadow-[0_0_15px_#fff]"></div>
               <span className="text-sm font-black uppercase tracking-widest">All Nodes Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
