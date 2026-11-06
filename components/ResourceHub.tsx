
import React from 'react';

const ResourceHub: React.FC = () => {
  const resources = [
    { title: 'Leave Application Form', code: 'FORM L1', category: 'Human Resources', size: '245 KB' },
    { title: 'Study Leave Application', code: 'FORM S1', category: 'Training', size: '512 KB' },
    { title: 'Travel Claim Form', code: 'FORM C10', category: 'Finance', size: '180 KB' },
    { title: 'Performance Review Template', code: 'PDP-1', category: 'Performance', size: '1.2 MB' },
    { title: 'Transfer Request Form (Manual)', code: 'FORM T1', category: 'Transfers', size: '340 KB' },
    { title: 'Health & Safety Guidelines', code: 'HSE-01', category: 'Policies', size: '2.4 MB' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-black dark:text-white">Resource Repository</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Official MoESD documents and standardized forms for teachers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:translate-y-[-4px] transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-gov-blue group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{res.code}</span>
            </div>
            <h4 className="font-bold text-lg dark:text-white mb-1">{res.title}</h4>
            <p className="text-xs text-slate-500 font-medium mb-6">{res.category}</p>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
               <span className="text-[10px] font-bold text-slate-400">{res.size} • PDF</span>
               <button className="text-gov-blue font-black text-sm flex items-center hover:underline">
                 Download
                 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceHub;
