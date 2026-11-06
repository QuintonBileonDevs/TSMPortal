
import React from 'react';

const ReliefDatabase: React.FC = () => {
  const applicants = [
    { id: 'R001', name: 'John Doe', subject: 'Mathematics', region: 'South East', status: 'Pending', omang: '98XXXXXXX' },
    { id: 'R002', name: 'Thabo Mbeki', subject: 'Setswana', region: 'North West', status: 'Shortlisted', omang: '94XXXXXXX' },
    { id: 'R003', name: 'Lindiwe Sisulu', subject: 'Primary Education', region: 'Southern', status: 'Pending', omang: '99XXXXXXX' },
    { id: 'R004', name: 'Kabo Letsholo', subject: 'Science', region: 'Central', status: 'Contracted', omang: '91XXXXXXX' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black dark:text-white">Relief Teacher Registry</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Reviewing external applications for short-term relief teaching contracts.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Applicants', value: '1,248', color: 'bg-gov-blue' },
          { label: 'Qualified', value: '840', color: 'bg-emerald-500' },
          { label: 'Currently On Contract', value: '156', color: 'bg-slate-900 dark:bg-slate-800' },
          { label: 'Urgent Needs', value: '12', color: 'bg-orange-500' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-3xl text-white shadow-xl`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
            <p className="text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h4 className="font-black dark:text-white text-lg">Applicant Database</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Showing 4 of 1,248 records</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <input type="text" placeholder="Search by name or Omang..." className="flex-1 md:w-64 px-5 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-gov-blue/10 outline-none" />
              <select className="px-5 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-xl outline-none">
                <option>All Regions</option>
                <option>South East</option>
                <option>North West</option>
              </select>
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region Pref.</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {applicants.map((app) => (
                   <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-6">
                         <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 mr-4">{app.name.charAt(0)}</div>
                            <div>
                               <p className="font-black text-sm dark:text-white">{app.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold">{app.omang}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold dark:text-slate-300">{app.subject}</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold dark:text-slate-300">{app.region}</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                           app.status === 'Contracted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                           app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                           'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                         }`}>
                           {app.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="text-xs font-black text-gov-blue hover:underline mr-4">View CV</button>
                         <button className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">Shortlist</button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default ReliefDatabase;
