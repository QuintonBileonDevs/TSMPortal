
import React, { useState, useMemo } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis
} from 'recharts';
import { MOCK_PERFORMANCE } from '../constants';
import { User, AvailabilityStatus, TeacherMovement } from '../types';
import { db, auth } from '../firebase';

interface TeacherDashboardProps {
  externalUser: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ externalUser }) => {
  const [user, setUser] = useState<User>(externalUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [editForm, setEditForm] = useState<User>({ ...user });
  const [newQual, setNewQual] = useState('');
  const [newMovement, setNewMovement] = useState<TeacherMovement>({
    schoolName: '',
    startDate: '',
    endDate: ''
  });

  const profileCompleteness = useMemo(() => {
    const fields = [
      'botepcoAccreditation', 'contact', 'currentSchool', 'dateIntoCurrentSchool',
      'dateIntoPost', 'dateJoinedService', 'designation', 'idNumber',
      'physicalAddress', 'postalAddress', 'region', 'salaryScale',
      'emergencyContactName', 'emergencyContactNo', 'emergencyContactRelation'
    ];
    const filled = fields.filter(f => !!(user as any)[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const addQualification = () => {
    if (newQual.trim()) {
      setEditForm(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQual.trim()]
      }));
      setNewQual('');
    }
  };

  const removeQualification = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index)
    }));
  };

  const addMovement = () => {
    if (newMovement.schoolName && newMovement.startDate && newMovement.endDate) {
      setEditForm(prev => ({
        ...prev,
        teacherMovement: [...(prev.teacherMovement || []), newMovement]
      }));
      setNewMovement({ schoolName: '', startDate: '', endDate: '' });
    }
  };

  const removeMovement = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      teacherMovement: prev.teacherMovement?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await db.collection('users').doc(user.id).update(editForm);
      setUser({ ...editForm });
      setIsEditModalOpen(false);
      alert("National Registry Updated Successfully.");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Critical: Failed to sync records with TSM Central.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently DELETE your account and all your data from Botswana TSM. " +
      "This action cannot be reversed. Do you want to continue?"
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("Authentication context missing.");

      await db.collection('users').doc(firebaseUser.uid).delete();
      await firebaseUser.delete();
      
      alert("Your account has been permanently deleted.");
      window.location.reload();
    } catch (error: any) {
      console.error("Delete failed:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security, please log out and log back in before deleting your account.");
      } else if (error.code === 'auth/invalid-credential') {
        alert("Session invalid. Please log out and back in to confirm your identity.");
      } else {
        alert("An error occurred during deletion. Please contact support.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const InfoRow = ({ label, value, icon }: { label: string, value?: string, icon: string }) => (
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-gov-blue/20 transition-all">
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-gov-blue mr-4 shadow-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} /></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold dark:text-slate-200 truncate">{value || 'Pending Registry'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      {/* High-End Hub Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gov-blue/30 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <span className={`w-2.5 h-2.5 rounded-full ${profileCompleteness === 100 ? 'bg-emerald-400' : 'bg-gov-blue animate-pulse'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Registry Integrity: {profileCompleteness}%</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter leading-none">Dumela, {user.name}!</h2>
              <p className="text-slate-400 font-bold tracking-wide flex items-center">
                <svg className="w-5 h-5 mr-2 text-gov-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {user.currentSchool} • {user.region}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center shadow-xl">
                <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-2">Scale</p>
                <p className="text-4xl font-black">{user.salaryScale || 'N/A'}</p>
             </div>
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 text-center shadow-xl">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Status</p>
                <p className="text-4xl font-black">{(user.status as string)?.split(' ')[0]}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-1 space-y-10">
          {/* Identity Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
             <div className="flex flex-col items-center text-center mb-10">
                <div className="w-32 h-32 rounded-[3rem] overflow-hidden shadow-2xl p-1.5 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-100 mb-6">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-full h-full object-cover rounded-[2.5rem]" alt="Profile" />
                </div>
                <h4 className="font-black text-2xl dark:text-white leading-tight">{user.name}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{user.designation}</p>
             </div>

             <div className="space-y-4">
                <InfoRow label="TS-Registry ID" value={user.idNumber} icon="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                <InfoRow label="Botepco" value={user.botepcoAccreditation} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                <InfoRow label="Affiliation" value={user.unionAffiliation} icon="M17 20h5v-2a3 3 0 00-5.356-1.857" />
             </div>

             <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Safety Protocol</p>
                <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/50">
                   <p className="text-xs font-black text-red-600 dark:text-red-400">{user.emergencyContactName || 'Records Incomplete'}</p>
                   <p className="text-[10px] font-bold text-slate-500 mt-1">{user.emergencyContactNo} • {user.emergencyContactRelation}</p>
                </div>
             </div>

             <button 
               type="button"
               onClick={() => { setEditForm({...user}); setIsEditModalOpen(true); }} 
               className="w-full mt-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gov-blue transition-all shadow-xl active:scale-95"
             >
               Modify Records
             </button>
             <button 
               type="button"
               onClick={handleDeleteAccount} 
               disabled={isDeleting} 
               className="w-full mt-4 py-4 text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
             >
               Delete My Account
             </button>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-10">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-center mb-12">
                <h4 className="font-black text-3xl dark:text-white tracking-tight">Career Performance</h4>
                <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-gov-blue rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100">TSM Cycle 2024</div>
             </div>
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={MOCK_PERFORMANCE}>
                   <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="year" stroke="#cbd5e1" axisLine={false} tickLine={false} fontSize={12} tickMargin={15} />
                   <YAxis hide domain={[0, 100]} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '1.5rem', border: 'none', padding: '1rem' }}
                     itemStyle={{ color: '#00AEEF', fontWeight: '900' }}
                   />
                   <Line type="monotone" dataKey="score" stroke="#00AEEF" strokeWidth={6} dot={{ r: 8, fill: '#00AEEF', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 12, strokeWidth: 0 }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <h4 className="font-black text-xl mb-8 dark:text-white uppercase tracking-tight">Academic Portfolio</h4>
                <div className="space-y-4">
                   {user.qualifications && user.qualifications.length > 0 ? user.qualifications.map((q, i) => (
                     <div key={i} className="flex items-center space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group border border-transparent transition-all">
                       <div className="w-10 h-10 rounded-xl bg-gov-blue text-white flex items-center justify-center font-black shadow-lg">Q</div>
                       <p className="text-sm font-black dark:text-slate-200">{q}</p>
                     </div>
                   )) : (
                     <div className="py-10 text-center text-slate-300">
                        <p className="text-xs font-bold uppercase">No records found</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="bg-gov-blue rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                <h4 className="font-black text-2xl mb-8 relative z-10 uppercase tracking-tight text-center lg:text-left">Administrative Suite</h4>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                   {[
                     { l: 'Leave Mgt', i: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5' },
                     { l: 'Swap Hub', i: 'M8 7h12m0 0l-4-4m4 4l-4 4' },
                     { l: 'Audit Logs', i: 'M9 5H7a2 2 0 00-2 2v12' },
                     { l: 'Help Desk', i: 'M18.364 5.636l-3.536 3.536' }
                   ].map((item, i) => (
                     <button key={i} type="button" className="flex flex-col items-start p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white hover:text-gov-blue transition-all active:scale-95 text-left group">
                        <svg className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.i} /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{item.l}</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in" onClick={() => !loading && setIsEditModalOpen(false)}></div>
           <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500 h-[90vh] flex flex-col">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
                 <h4 className="text-2xl font-black tracking-tight uppercase">Edit National Registry Record</h4>
                 <button type="button" onClick={() => !loading && setIsEditModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Section 1: Identity */}
                    <div className="col-span-full border-b border-slate-50 dark:border-slate-800 pb-4">
                       <h5 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Legal Identity & Contact</h5>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Full Legal Name</label>
                       <input name="name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Omang ID No.</label>
                       <input name="idNumber" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.idNumber} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Phone</label>
                       <input name="contact" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.contact} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Botepco Accreditation</label>
                       <input name="botepcoAccreditation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.botepcoAccreditation} onChange={handleInputChange} />
                    </div>

                    {/* Qualifications Section */}
                    <div className="col-span-full border-b border-slate-50 dark:border-slate-800 pb-4 mt-8">
                       <h5 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Academic Portfolio</h5>
                    </div>
                    <div className="col-span-full space-y-4">
                      <div className="flex space-x-2">
                        <input 
                          placeholder="Add new qualification..." 
                          className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm"
                          value={newQual}
                          onChange={(e) => setNewQual(e.target.value)}
                        />
                        <button type="button" onClick={addQualification} className="px-6 bg-gov-blue text-white font-black text-xs uppercase tracking-widest rounded-xl">Add</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editForm.qualifications?.map((q, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100">
                            <span className="text-xs font-bold truncate pr-4">{q}</span>
                            <button type="button" onClick={() => removeQualification(i)} className="text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Professional */}
                    <div className="col-span-full border-b border-slate-50 dark:border-slate-800 pb-4 mt-8">
                       <h5 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Current Posting</h5>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Current Station</label>
                       <input name="currentSchool" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.currentSchool} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Designation</label>
                       <input name="designation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.designation} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Salary Scale</label>
                       <input name="salaryScale" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.salaryScale} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Region</label>
                       <input name="region" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.region} onChange={handleInputChange} />
                    </div>

                    {/* Teacher Movement History */}
                    <div className="col-span-full border-b border-slate-50 dark:border-slate-800 pb-4 mt-8">
                       <h5 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Movement History</h5>
                    </div>
                    <div className="col-span-full space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl">
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase px-2">Station Name</label>
                          <input placeholder="School Name" className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-gov-blue" value={newMovement.schoolName} onChange={e => setNewMovement({...newMovement, schoolName: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase px-2">Date From</label>
                          <input type="date" className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-gov-blue" value={newMovement.startDate} onChange={e => setNewMovement({...newMovement, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase px-2">Date To</label>
                          <input type="date" className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-gov-blue" value={newMovement.endDate} onChange={e => setNewMovement({...newMovement, endDate: e.target.value})} />
                        </div>
                        <div className="flex items-end">
                           <button type="button" onClick={addMovement} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Add Record</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {editForm.teacherMovement?.map((m, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 rounded-xl">
                            <div className="space-y-1">
                              <p className="text-xs font-black leading-none">{m.schoolName}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">
                                <span className="opacity-60">FROM:</span> {m.startDate} <span className="mx-1">/</span> <span className="opacity-60">TO:</span> {m.endDate}
                              </p>
                            </div>
                            <button type="button" onClick={() => removeMovement(i)} className="text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Temporal */}
                    <div className="col-span-full border-b border-slate-50 dark:border-slate-800 pb-4 mt-8">
                       <h5 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Registry Timeline</h5>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date Joined Service</label>
                       <input type="date" name="dateJoinedService" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.dateJoinedService} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date into Post</label>
                       <input type="date" name="dateIntoPost" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.dateIntoPost} onChange={handleInputChange} />
                    </div>

                    {/* Section 4: Emergency */}
                    <div className="col-span-full border-b border-slate-50 dark:border-slate-800 pb-4 mt-8">
                       <h5 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Emergency Protocol</h5>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Name</label>
                       <input name="emergencyContactName" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.emergencyContactName} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Relation</label>
                       <input name="emergencyContactRelation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.emergencyContactRelation} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Emergency Phone</label>
                       <input name="emergencyContactNo" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={editForm.emergencyContactNo} onChange={handleInputChange} />
                    </div>
                 </div>
                 <button type="button" onClick={handleSave} disabled={loading} className="w-full mt-12 py-6 bg-gov-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 mb-10">
                    {loading ? 'Transmitting Changes...' : 'Commit Registry Updates'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
