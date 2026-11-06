
import React, { useState, useMemo, useEffect } from 'react';
import { User, AvailabilityStatus, TeacherMovement } from '../types';
import { db } from '../firebase';

interface ProfileWizardProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onLogout: () => void;
}

const ProfileWizard: React.FC<ProfileWizardProps> = ({ user, onComplete, onLogout }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newQual, setNewQual] = useState('');
  const [salaryScales, setSalaryScales] = useState<string[]>([]);
  const [omangError, setOmangError] = useState<string | null>(null);
  const [newMovement, setNewMovement] = useState<TeacherMovement>({
    schoolName: '',
    startDate: '',
    endDate: ''
  });
  
  const [formData, setFormData] = useState<User>({
    ...user,
    gender: user.gender || 'Male',
    botepcoAccreditation: user.botepcoAccreditation || '',
    contact: user.contact || '',
    currentSchool: user.currentSchool || '',
    dateIntoCurrentSchool: user.dateIntoCurrentSchool || '',
    dateIntoPost: user.dateIntoPost || '',
    dateJoinedService: user.dateJoinedService || '',
    designation: user.designation || '',
    emergencyContactName: user.emergencyContactName || '',
    emergencyContactNo: user.emergencyContactNo || '',
    emergencyContactRelation: user.emergencyContactRelation || '',
    idNumber: user.idNumber || '',
    physicalAddress: user.physicalAddress || '',
    postalAddress: user.postalAddress || '',
    qualifications: user.qualifications || [],
    region: user.region || '',
    salaryScale: user.salaryScale || '',
    status: user.status || AvailabilityStatus.ACTIVE,
    unionAffiliation: user.unionAffiliation || 'None',
    teacherMovement: user.teacherMovement || []
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
        // If fetch fails, keep array empty so the UI shows 'Loading...' or no options
      }
    };
    fetchSalaryScales();
  }, []);

  const validateOmang = (id: string, gender: string) => {
    if (!id) return null;
    if (id.length !== 9) return "ID must be exactly 9 digits";
    if (!/^\d+$/.test(id)) return "ID must contain only numbers";
    
    const fifthDigit = id.charAt(4);
    if (gender === 'Male' && fifthDigit !== '1') {
      return "Invalid Omang: 5th digit must be 1 for Male";
    }
    if (gender === 'Female' && fifthDigit !== '0') {
      return "Invalid Omang: 5th digit must be 0 for Female";
    }
    if (fifthDigit !== '1' && fifthDigit !== '0') {
      return "Invalid Omang: 5th digit must be 1 or 0";
    }
    return null;
  };

  const steps = [
    { id: 1, title: 'Identity', fields: ['name', 'gender', 'idNumber', 'contact', 'email'] },
    { id: 2, title: 'Professional', fields: ['currentSchool', 'designation', 'salaryScale', 'region', 'botepcoAccreditation'] },
    { id: 3, title: 'Qualifications', fields: ['qualifications'] },
    { id: 4, title: 'History & Service', fields: ['dateJoinedService', 'dateIntoPost', 'dateIntoCurrentSchool', 'unionAffiliation', 'teacherMovement'] },
    { id: 5, title: 'Address & Emergency', fields: ['physicalAddress', 'postalAddress', 'emergencyContactName', 'emergencyContactNo', 'emergencyContactRelation'] }
  ];

  const progress = useMemo(() => {
    const totalFields = 23; 
    const filledFields = Object.values(formData).filter(v => 
      v !== '' && 
      v !== null && 
      v !== undefined &&
      (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    return Math.min(100, Math.round((filledFields / totalFields) * 100));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'idNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      setOmangError(validateOmang(numericValue, formData.gender || 'Male'));
    } else if (name === 'gender') {
      setFormData(prev => ({ ...prev, [name]: value as any }));
      setOmangError(validateOmang(formData.idNumber || '', value));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    }
  };

  const removeMovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teacherMovement: prev.teacherMovement?.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (step === 1 && (omangError || !formData.idNumber || formData.idNumber.length !== 9)) {
      setOmangError(omangError || "Valid 9-digit Omang ID is required");
      return;
    }
    if (step < steps.length) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (omangError) return;
    setLoading(true);
    try {
      const finalData = { ...formData, profileComplete: true };
      await db.collection('users').doc(user.id).set(finalData);
      onComplete(finalData);
    } catch (error) {
      console.error("Profile save failed:", error);
      alert("Failed to save profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-6 grid-pattern flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-4 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gov-blue/20 rounded-full blur-3xl -ml-16 -mt-16"></div>
            <div className="relative z-10 space-y-8">
              <div>
                <div className="w-12 h-12 bg-gov-blue rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-xl rotate-3">BW</div>
                <h2 className="text-3xl font-black tracking-tight leading-tight">Onboarding <span className="opacity-50">Portal</span></h2>
                <p className="text-slate-400 font-medium text-sm mt-4 leading-relaxed">Fill your official TSM registry file to initialize your workspace access.</p>
              </div>

              <div className="space-y-4">
                {steps.map(s => (
                  <div key={s.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${step === s.id ? 'bg-gov-blue border-gov-blue text-white shadow-lg shadow-blue-500/30' : step > s.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 text-slate-500'}`}>
                      {step > s.id ? '✓' : s.id}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-white' : 'text-slate-500'}`}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-10 border-t border-white/5 space-y-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Form Completion</span>
                <span className="text-xl font-black text-gov-blue">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gov-blue transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <button type="button" onClick={onLogout} className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center">
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Abort & Sign Out
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8 p-12 lg:p-20 overflow-y-auto max-h-[85vh] custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-10">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black dark:text-white">Identity Records</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Verify legal identity markers</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Full Name</label>
                      <input required name="name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Gender</label>
                      <select required name="gender" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.gender} onChange={handleInputChange}>
                        <option value="Male">Male (ID 5th: 1)</option>
                        <option value="Female">Female (ID 5th: 0)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Omang ID Number</label>
                      <input required name="idNumber" placeholder="9 digits" className={`w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent ${omangError ? 'border-red-500' : 'focus:border-gov-blue'} rounded-xl outline-none font-bold text-sm`} value={formData.idNumber} onChange={handleInputChange} />
                      {omangError && <p className="text-[10px] text-red-500 font-bold px-4">{omangError}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Phone</label>
                      <input required name="contact" placeholder="+267" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.contact} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Official Email</label>
                      <input readOnly name="email" className="w-full p-4 bg-slate-100 dark:bg-slate-900 dark:text-slate-500 border border-transparent rounded-xl outline-none font-bold text-sm" value={formData.email} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black dark:text-white">Professional Assignment</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Current station & registry credentials</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Current Station (School)</label>
                      <input required name="currentSchool" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.currentSchool} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Designation</label>
                      <input required name="designation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.designation} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Salary Scale</label>
                      <select required name="salaryScale" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm appearance-none" value={formData.salaryScale} onChange={handleInputChange}>
                        <option value="">{salaryScales.length > 0 ? 'Select Scale...' : 'Loading scales...'}</option>
                        {salaryScales.map(scale => <option key={scale} value={scale}>{scale}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Region</label>
                      <select required name="region" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.region} onChange={handleInputChange}>
                        <option value="">Select Region...</option>
                        <option>South East</option>
                        <option>North East</option>
                        <option>Southern</option>
                        <option>Central</option>
                        <option>Kgalagadi</option>
                        <option>Ghanzi</option>
                        <option>North West</option>
                        <option>Chobe</option>
                        <option>Kgatleng</option>
                        <option>Kweneng</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Botepco Accreditation Number</label>
                      <input required name="botepcoAccreditation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.botepcoAccreditation} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black dark:text-white">Academic Qualifications</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">List all verified degrees and diplomas</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input 
                        placeholder="e.g. Bachelor of Education (Science)" 
                        className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm"
                        value={newQual}
                        onChange={(e) => setNewQual(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                      />
                      <button 
                        type="button" 
                        onClick={addQualification}
                        className="px-6 bg-gov-blue text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-gov-dark transition-all"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.qualifications?.map((q, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50 group animate-in slide-in-from-left-4 duration-300">
                          <span className="text-sm font-bold dark:text-slate-200">{q}</span>
                          <button type="button" onClick={() => removeQualification(i)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black dark:text-white">Service & Movement History</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Temporal markers & career journey</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date Joined Service</label>
                      <input required type="date" name="dateJoinedService" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.dateJoinedService} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date into Post</label>
                      <input required type="date" name="dateIntoPost" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.dateIntoPost} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date into Current School</label>
                      <input required type="date" name="dateIntoCurrentSchool" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.dateIntoCurrentSchool} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Union Affiliation</label>
                      <select required name="unionAffiliation" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.unionAffiliation} onChange={handleInputChange}>
                        <option>None</option>
                        <option>BTU</option>
                        <option>BOSETU</option>
                        <option>BOFEPUSU</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Teacher Movement History</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase px-2">Previous Station Name</label>
                         <input className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-gov-blue rounded-xl text-xs font-bold" value={newMovement.schoolName} onChange={e => setNewMovement({...newMovement, schoolName: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase px-2">Date From</label>
                         <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-gov-blue rounded-xl text-xs font-bold" value={newMovement.startDate} onChange={e => setNewMovement({...newMovement, startDate: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase px-2">Date To</label>
                         <input type="date" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-gov-blue rounded-xl text-xs font-bold" value={newMovement.endDate} onChange={e => setNewMovement({...newMovement, endDate: e.target.value})} />
                      </div>
                      <div className="md:col-span-4 mt-2">
                        <button type="button" onClick={addMovement} className="w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gov-blue transition-all">Record Station History</button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {formData.teacherMovement?.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group animate-in slide-in-from-bottom-4 duration-300">
                          <div className="space-y-1">
                             <p className="text-sm font-black dark:text-white leading-none">{m.schoolName}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">
                               <span className="opacity-60 mr-1">FROM:</span> {m.startDate} <span className="mx-1">/</span> <span className="opacity-60">TO:</span> {m.endDate}
                             </p>
                          </div>
                          <button type="button" onClick={() => removeMovement(i)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black dark:text-white">Logistics & Safety</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Addresses & emergency protocols</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Physical Address</label>
                        <input required name="physicalAddress" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.physicalAddress} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Postal Address</label>
                        <input required name="postalAddress" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={formData.postalAddress} onChange={handleInputChange} />
                      </div>
                    </div>
                    
                    <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800 space-y-6">
                      <p className="text-[10px] font-black text-gov-blue uppercase tracking-[0.2em]">Emergency Contact Protocol</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase px-2">Contact Name</label>
                          <input required name="emergencyContactName" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-gov-blue rounded-xl text-xs font-bold" value={formData.emergencyContactName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase px-2">Relation</label>
                          <input required name="emergencyContactRelation" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-gov-blue rounded-xl text-xs font-bold" value={formData.emergencyContactRelation} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase px-2">Phone No.</label>
                          <input required name="emergencyContactNo" className="w-full p-3 bg-white dark:bg-slate-900 border border-transparent focus:border-gov-blue rounded-xl text-xs font-bold" value={formData.emergencyContactNo} onChange={handleInputChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-10 border-t border-slate-50 dark:border-slate-800">
                {step > 1 && (
                  <button type="button" onClick={handlePrev} className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                    Previous
                  </button>
                )}
                {step < steps.length ? (
                  <button type="button" onClick={handleNext} className="flex-1 py-5 bg-gov-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-gov-dark active:scale-95 transition-all">
                    Next Section
                  </button>
                ) : (
                  <button type="submit" disabled={loading || !!omangError} className="flex-1 py-5 bg-slate-900 dark:bg-gov-blue text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50">
                    {loading ? 'Transmitting Registry...' : 'Finalize TSM Onboarding'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWizard;
