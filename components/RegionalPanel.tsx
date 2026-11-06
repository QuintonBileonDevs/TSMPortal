
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RegionalPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'relief_requests'>('overview');
  
  const data = [
    { name: 'Gaborone', teachers: 450, vacancies: 12 },
    { name: 'Molepolole', teachers: 320, vacancies: 8 },
    { name: 'Lobatse', teachers: 280, vacancies: 15 },
    { name: 'Mochudi', teachers: 210, vacancies: 5 },
  ];

  const reliefRequests = [
    { id: 'RR-101', school: 'Gaborone Secondary', subject: 'Mathematics', duration: '6 Months', urgency: 'High', date: '2024-05-20' },
    { id: 'RR-102', school: 'Molepolole Secondary', subject: 'Chemistry', duration: '3 Months', urgency: 'Medium', date: '2024-05-18' },
  ];

  const handleAssignRelief = (requestId: string) => {
    const teacherName = prompt("Enter Name of Relief Teacher from Database:");
    const duration = prompt("Enter Contract Duration (e.g. 3 Months, 6 Months):");
    if (teacherName && duration) {
      alert(`Teacher ${teacherName} successfully assigned to station ${requestId} for ${duration}. Contract generated.`);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight">Regional Hub</h2>
          <p className="text-slate-400 mt-1 font-bold">South East Region • Directorate of TSM</p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 relative z-10">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('relief_requests')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'relief_requests' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
          >
            Relief Requests ({reliefRequests.length})
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gov-blue/20 rounded-full blur-3xl -mb-32 -mr-32"></div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50">
            <h3 className="font-black text-xl mb-8 dark:text-white uppercase tracking-widest text-slate-400">Regional Staff Density</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={10} tickMargin={10} fontWeight="900" />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '16px', border: 'none' }}
                  />
                  <Bar dataKey="teachers" fill="#00AEEF" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-xl mb-8 dark:text-white uppercase tracking-widest text-slate-400">Regional Priorities</h3>
            <div className="space-y-4">
              {[
                { title: '8 Pending Transfers', sub: 'Directorate level oversight required', priority: 'High' },
                { title: 'Budget Reconcile', sub: 'Q2 Staffing financial audit due', priority: 'High' },
              ].map((item, i) => (
                <div key={i} className="flex items-center p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-l-4 border-gov-blue group hover:shadow-lg transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-black text-slate-900 dark:text-white leading-none">{item.title}</p>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-red-100 text-red-600">{item.priority}</span>
                    </div>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                  <button className="text-xs font-black text-gov-blue group-hover:underline">Manage</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl animate-in slide-in-from-right duration-500">
           {reliefRequests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-between group hover:border-gov-blue transition-all">
                 <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-gov-blue">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       </div>
                       <div>
                          <h4 className="text-xl font-black dark:text-white">{req.school}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Requested on {req.date}</p>
                       </div>
                    </div>
                    <div className="flex gap-10">
                       <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Subject Need</p>
                          <p className="text-sm font-bold dark:text-slate-200">{req.subject}</p>
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contract Duration</p>
                          <p className="text-sm font-bold dark:text-slate-200">{req.duration}</p>
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Priority</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${req.urgency === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{req.urgency}</span>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => handleAssignRelief(req.school)}
                   className="px-8 py-4 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                 >
                    Assign Teacher
                 </button>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default RegionalPanel;
