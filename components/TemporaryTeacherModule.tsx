
import React, { useState } from 'react';

const TemporaryTeacherModule: React.FC = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    primarySubject: '',
    regionPreference: 'South East',
    experience: '0-2 Years'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <h3 className="text-3xl font-black dark:text-white">Application Received!</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">Your relief teacher application has been submitted to the regional database. You will be contacted via SMS if a temporary vacancy arises.</p>
        </div>
        <button onClick={() => {setSubmitted(false); setStep(1);}} className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl">Return to Portal</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h2 className="text-4xl font-black dark:text-white mb-4">Relief Teacher Application</h2>
        <p className="text-slate-500 dark:text-slate-400">Apply for short-term relief contracts within the Teaching Service.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-50 dark:border-slate-800">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 py-6 text-center text-xs font-black uppercase tracking-widest transition-all ${step === s ? 'text-gov-blue bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-300'}`}>
              Step {s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-10 lg:p-16 space-y-10">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl outline-none" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ID Number (Omang)</label>
                  <input required value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl outline-none" placeholder="98XXXXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Teaching Specialization</label>
                <input required value={formData.primarySubject} onChange={e => setFormData({...formData, primarySubject: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl outline-none" placeholder="e.g. Mathematics & Physics" />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl shadow-blue-500/20">Next Section &rarr;</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Document Submission</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Curriculum Vitae', 'Certified Omang Copy', 'Academic Transcript', 'Teaching Qualification'].map(doc => (
                    <div key={doc} className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-between hover:border-gov-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                      <div>
                        <p className="text-sm font-bold dark:text-white">{doc}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">PDF Only • Max 5MB</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 text-slate-500 font-black rounded-2xl">Previous</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl shadow-blue-500/20">Final Review</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-lg font-black dark:text-white">Summary of Application</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Name</p>
                      <p className="font-bold dark:text-white">{formData.name || 'Not Entered'}</p>
                   </div>
                   <div>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Specialization</p>
                      <p className="font-bold dark:text-white">{formData.primarySubject || 'Not Entered'}</p>
                   </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2">
                 <input required type="checkbox" className="mt-1 w-5 h-5 rounded-lg text-gov-blue" />
                 <p className="text-xs text-slate-500 leading-relaxed">I certify that all documents submitted are authentic and I understand that temporary relief teaching is a contract-based position determined by regional demand.</p>
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 text-slate-500 font-black rounded-2xl">Edit Details</button>
                <button type="submit" className="flex-1 py-5 bg-slate-900 dark:bg-gov-blue text-white font-black rounded-2xl shadow-2xl">Submit Application</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TemporaryTeacherModule;
