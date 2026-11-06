
import React, { useState, useEffect } from 'react';
import { User, TeacherMovement } from '../types';
import { db, auth } from '../firebase';

interface ProfilePageProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [isSaving, setIsSaving] = useState(false);
  const [newQual, setNewQual] = useState('');
  const [salaryScales, setSalaryScales] = useState<string[]>([]);
  const [newMovement, setNewMovement] = useState<TeacherMovement>({
    schoolName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchSalaryScales = async () => {
      try {
        const snapshot = await db.collection('salary_scale').get();
        const scales = snapshot.docs.map(doc => {
          const data = doc.data();
          return data.scale || data.name || doc.id;
        });
        const uniqueScales = Array.from(new Set(scales)).sort();
        setSalaryScales(uniqueScales);
      } catch (error) {
        console.error("Error fetching salary scales:", error);
      }
    };
    fetchSalaryScales();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.collection('users').doc(user.id).update(formData);
      onUpdate(formData);
      alert("Profile updated successfully in the TSM registry.");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error: Could not save changes. Please try logging in again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "FINAL WARNING: This will permanently DELETE your TSM account and all your records. " +
      "This action cannot be undone. Are you absolutely sure you want to proceed?"
    );
    
    if (!confirmed) return;
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("No authenticated user found.");
      
      await db.collection('users').doc(firebaseUser.uid).delete();
      await firebaseUser.delete();
      
      alert("Your account has been permanently removed.");
      window.location.reload();
    } catch (error: any) {
      console.error("Deletion failed:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, you must log out and log back in before you can delete your account.");
      } else if (error.code === 'auth/invalid-credential') {
        alert("Your session has expired. Please log out and log back in to verify your identity.");
      } else {
        alert("An error occurred. Please contact the TSM support helpdesk.");
      }
    }
  };

  const addQualification = () => {
    if (newQual.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQual.trim()]
      }));
      setNewQual('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index)
    }));
  };

  const addMovement = () => {
    if (newMovement.schoolName && newMovement.startDate && newMovement.endDate) {
      setFormData(prev => ({
        ...prev,
        teacherMovement: [...(prev.teacherMovement || []), newMovement]
      }));
      setNewMovement({ schoolName: '', startDate: '', endDate: '' });
    } else {
      alert("Please fill in all movement details: School Name, Date From, and Date To.");
    }
  };

  const removeMovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teacherMovement: prev.teacherMovement?.filter((_, i) => i !== index)
    }));
  };

  const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
    <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="p-2 bg-gov-blue/10 rounded-lg text-gov-blue">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} /></svg>
      </div>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" />
          </div>
          <div>
            <h2 className="text-3xl font-black dark:text-white leading-none">{user.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">{user.designation} • {user.email}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1 md:flex-none px-10 py-4 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save My Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Personal Details */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <SectionHeader title="Legal Identity" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Full Legal Name</label>
              <input name="name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">ID Number (Omang)</label>
              <input name="idNumber" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.idNumber} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Phone Contact</label>
              <input name="contact" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.contact} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <SectionHeader title="Professional Assignment" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Current Station</label>
              <input name="currentSchool" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.currentSchool} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Designation</label>
              <input name="designation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.designation} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Salary Scale</label>
              <select name="salaryScale" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none appearance-none" value={formData.salaryScale} onChange={handleInputChange}>
                <option value="">{salaryScales.length > 0 ? 'Select Scale...' : 'Loading scales...'}</option>
                {salaryScales.map(scale => <option key={scale} value={scale}>{scale}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Region</label>
              <input name="region" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.region} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Botepco Accreditation</label>
              <input name="botepcoAccreditation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.botepcoAccreditation} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 lg:col-span-2">
          <SectionHeader title="Qualifications" icon="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          <div className="space-y-6">
            <div className="flex space-x-2">
              <input 
                placeholder="Add new qualification (e.g. Master of Education)" 
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none"
                value={newQual}
                onChange={(e) => setNewQual(e.target.value)}
              />
              <button 
                type="button"
                onClick={addQualification} 
                className="px-8 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
              >
                Add Record
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.qualifications?.map((q, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <span className="text-sm font-bold truncate pr-4">{q}</span>
                  <button type="button" onClick={() => removeQualification(i)} className="text-red-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History & Movement */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 lg:col-span-2">
          <SectionHeader title="Service History & Movement" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Date Joined Service</label>
              <input type="date" name="dateJoinedService" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.dateJoinedService} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Date into Post</label>
              <input type="date" name="dateIntoPost" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.dateIntoPost} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Date into Station</label>
              <input type="date" name="dateIntoCurrentSchool" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none" value={formData.dateIntoCurrentSchool} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-4">Historical Movement Records</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem]">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase px-2">Station Name</label>
                <input placeholder="e.g. Ledumang Senior" className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-transparent focus:border-gov-blue font-bold text-xs outline-none" value={newMovement.schoolName} onChange={e => setNewMovement({...newMovement, schoolName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase px-2">Date From</label>
                <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-transparent focus:border-gov-blue font-bold text-xs outline-none" value={newMovement.startDate} onChange={e => setNewMovement({...newMovement, startDate: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase px-2">Date To</label>
                <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-transparent focus:border-gov-blue font-bold text-xs outline-none" value={newMovement.endDate} onChange={e => setNewMovement({...newMovement, endDate: e.target.value})} />
              </div>
              <button 
                type="button"
                onClick={addMovement} 
                className="md:col-span-4 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-gov-blue transition-colors mt-2"
              >
                Archive Movement Record
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.teacherMovement?.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                  <div>
                    <p className="font-black text-sm dark:text-white leading-none mb-2">{m.schoolName}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="opacity-60 mr-1">FROM:</span> {m.startDate} 
                      <span className="opacity-60 mx-2">TO:</span> {m.endDate}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeMovement(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Addresses & Emergency */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-slate-800 lg:col-span-2">
          <SectionHeader title="Logistics & Emergency" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase px-4">Physical Address</label>
                <textarea name="physicalAddress" rows={2} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none resize-none" value={formData.physicalAddress} onChange={handleInputChange} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase px-4">Postal Address</label>
                <textarea name="postalAddress" rows={2} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl font-bold text-sm outline-none resize-none" value={formData.postalAddress} onChange={handleInputChange} />
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-800/50 space-y-6">
               <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center">Active Emergency Protocol</h4>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase px-2">Contact Person</label>
                    <input name="emergencyContactName" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-red-400 rounded-xl font-bold text-xs outline-none" value={formData.emergencyContactName} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase px-2">Relation</label>
                      <input name="emergencyContactRelation" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-red-400 rounded-xl font-bold text-xs outline-none" value={formData.emergencyContactRelation} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase px-2">Contact No.</label>
                      <input name="emergencyContactNo" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-red-400 rounded-xl font-bold text-xs outline-none" value={formData.emergencyContactNo} onChange={handleInputChange} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex justify-center">
         <button 
           type="button" 
           onClick={handleDeleteAccount} 
           className="px-10 py-5 bg-white dark:bg-slate-900 text-red-500 border-2 border-red-100 dark:border-red-900/30 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm mb-10"
         >
           Delete My Account
         </button>
      </div>
    </div>
  );
};

export default ProfilePage;
