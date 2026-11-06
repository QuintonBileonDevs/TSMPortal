
import React, { useState, useMemo } from 'react';
import { MOCK_TEACHER, MOCK_TRANSFER_REQUESTS, MOCK_SCHOOL, MOCK_PERFORMANCE } from '../constants';
import { TransferStatus, School, Teacher, AvailabilityStatus, UserRole } from '../types';
import { generateAdministrativeLetter } from '../services/geminiService';

interface StaffMember extends Teacher {
  subject: string;
  isRelief?: boolean;
  contractEnd?: string;
  yearsExperience?: number;
  lastPerformanceScore?: number;
}

interface ReliefRequest {
  id: string;
  subject: string;
  reason: string;
  dateRequested: string;
  status: 'PENDING' | 'APPROVED' | 'FILLED';
}

const SchoolHeadPanel: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const [activeView, setActiveView] = useState<'staff' | 'relief' | 'endorsements' | 'writing' | 'school'>((initialTab as any) || 'staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [endorsements, setEndorsements] = useState(MOCK_TRANSFER_REQUESTS);
  
  const [schoolDetails, setSchoolDetails] = useState<School & { schoolHeadName?: string }>(() => ({
    ...MOCK_SCHOOL,
    schoolHeadName: 'Mr. Segwagwa'
  }));
  const [schoolEditForm, setSchoolEditForm] = useState(schoolDetails);
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isReplacingHead, setIsReplacingHead] = useState(false);
  const [headReplacementReason, setHeadReplacementReason] = useState('');
  
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isReliefModalOpen, setIsReliefModalOpen] = useState(false);
  
  // Administrative Action States
  const [showActions, setShowActions] = useState(false);
  const [actionType, setActionType] = useState<'PROMOTE' | 'DEMOTE' | 'APPOINT' | null>(null);
  const [actionJustification, setActionJustification] = useState('');
  const [newScale, setNewScale] = useState('');
  const [newDesignation, setNewDesignation] = useState('');

  const [reliefReason, setReliefReason] = useState('');
  const [reliefSubject, setReliefSubject] = useState('');
  const [reliefGeneratedDoc, setReliefGeneratedDoc] = useState('');
  const [isGeneratingRelief, setIsGeneratingRelief] = useState(false);

  const [writingTopic, setWritingTopic] = useState('');
  const [writingContext, setWritingContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');

  const isAnyModalOpen = isPersonnelModalOpen || isReliefModalOpen;

  const [schoolReliefRequests, setSchoolReliefRequests] = useState<ReliefRequest[]>([
    { id: 'REQ-402', subject: 'Pure Mathematics (Senior)', reason: 'Maternity Leave Citation (6 Months)', dateRequested: '2024-05-10', status: 'PENDING' },
    { id: 'REQ-388', subject: 'Physics (Junior)', reason: 'Interim Vacancy - Study Leave', dateRequested: '2024-04-15', status: 'FILLED' }
  ]);

  const initialStaff: StaffMember[] = [
    { ...MOCK_TEACHER, subject: 'Mathematics', yearsExperience: 9, lastPerformanceScore: 92 },
    { 
      id: 'T1002', name: 'Kabo', surname: 'Segwagwa', idNumber: '920815521', email: 'kabo.s@gov.bw', 
      contact: '+267 72112233', designation: 'Teacher', salaryScale: 'C4', status: AvailabilityStatus.ACTIVE, 
      role: UserRole.TEACHER, // Fix: Add missing role property
      subject: 'History', yearsExperience: 5, lastPerformanceScore: 84, qualifications: ['B.Ed History'],
      currentSchool: 'Gaborone Secondary School', region: 'South East', dateJoinedService: '2019-02-10', dateIntoPost: '2019-02-10',
      dateIntoCurrentSchool: '2021-01-15'
    },
    { 
      id: 'R9001', name: 'Thato', surname: 'Lekau', idNumber: '980112233', email: 'thato.l@gov.bw',
      contact: '+267 75112233', designation: 'Relief Teacher', salaryScale: 'C4', status: AvailabilityStatus.ACTIVE, 
      role: UserRole.TEACHER, // Fix: Add missing role property
      subject: 'Geography', isRelief: true, contractEnd: '2024-12-15', yearsExperience: 2, lastPerformanceScore: 78,
      qualifications: ['B.Sc Geology'], currentSchool: 'Gaborone Secondary School', region: 'South East', 
      dateJoinedService: '2024-02-15', dateIntoPost: '2024-02-15', dateIntoCurrentSchool: '2024-02-15'
    }
  ];

  const [staffList, setStaffList] = useState(initialStaff);

  const handleAdminAction = () => {
    if (!selectedStaff || !actionType) return;
    
    setStaffList(prev => prev.map(s => {
      if (s.id === selectedStaff.id) {
        return {
          ...s,
          salaryScale: newScale || s.salaryScale,
          designation: newDesignation || s.designation,
          isRelief: actionType === 'APPOINT' ? false : s.isRelief
        };
      }
      return s;
    }));

    alert(`Administrative protocol for ${actionType} successful. National Registry updated.`);
    setIsPersonnelModalOpen(false);
    resetActionState();
  };

  const resetActionState = () => {
    setShowActions(false);
    setActionType(null);
    setActionJustification('');
    setNewScale('');
    setNewDesignation('');
  };

  const handleSchoolSave = () => {
    setSchoolDetails(schoolEditForm);
    setIsEditingSchool(false);
    setIsReplacingHead(false);
    alert("Station Registry updated.");
  };

  const handleGenerateReliefLetter = async () => {
    if (!reliefReason || !reliefSubject) return;
    setIsGeneratingRelief(true);
    try {
      const context = `Institutional Requisition for a relief teacher for ${reliefSubject}. Official Justification: ${reliefReason}.`;
      const letter = await generateAdministrativeLetter(schoolDetails, "Formal Requisition for Educational Relief Personnel", context);
      setReliefGeneratedDoc(letter);
    } catch (e) {
      alert("AI Synthesis failed.");
    } finally {
      setIsGeneratingRelief(false);
    }
  };

  const downloadWordDoc = (content: string, filename: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>";
    const footer = "</body></html>";
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + content.replace(/\n/g, '<br>') + footer);
    const link = document.createElement("a");
    link.href = source;
    link.download = `${filename}.doc`;
    link.click();
  };

  const handleDownloadPersonnelFile = () => {
    if (!selectedStaff) return;
    const content = `OFFICIAL PERSONNEL MASTER FILE - ${selectedStaff.name} ${selectedStaff.surname}\n\nStation: ${selectedStaff.currentSchool}\nDesignation: ${selectedStaff.designation}`;
    downloadWordDoc(content, `Portfolio_${selectedStaff.surname}`);
  };

  const handleTransferDecision = (requestId: string, status: TransferStatus) => {
    setEndorsements(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    alert(`Case ${requestId} has been ${status === TransferStatus.ENDORSED ? 'Endorsed' : 'Declined'}.`);
  };

  const filteredStaff = useMemo(() => {
    let result = [...staffList];
    if (activeView === 'staff') result = result.filter(s => !s.isRelief);
    else if (activeView === 'relief') result = result.filter(s => s.isRelief);
    if (searchTerm) {
      const ls = searchTerm.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(ls) || s.surname.toLowerCase().includes(ls) || s.subject.toLowerCase().includes(ls));
    }
    return result;
  }, [searchTerm, activeView, staffList]);

  const calculateDaysLeft = (endDate?: string) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24)));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {!isAnyModalOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden relative group animate-in slide-in-from-top-4 duration-500">
          <div className="relative p-6 lg:p-8 flex flex-col xl:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-6 w-full xl:w-auto">
              <div className="w-16 h-16 bg-gov-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-2xl font-black dark:text-white tracking-tight leading-none">{schoolDetails.name}</h2>
                <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span>ID: {schoolDetails.centreNumber}</span>
                  <span>{schoolDetails.region} Cluster</span>
                  <span className="text-slate-700 dark:text-slate-200">Head: {schoolDetails.schoolHeadName}</span>
                </div>
              </div>
            </div>

            <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-wrap justify-center gap-1.5 shadow-inner">
              {[
                { id: 'staff', label: 'Permanent', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { id: 'relief', label: 'Relief', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'endorsements', label: 'Transfers', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                { id: 'writing', label: 'Writing', icon: 'M15.232 5.232l3.536 3.536' },
                { id: 'school', label: 'School Info', icon: 'M13 16h-1v-4h-1m1-4h.01' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveView(tab.id as any)} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === tab.id ? 'bg-white dark:bg-slate-700 text-gov-blue shadow-sm border border-slate-100/50' : 'text-slate-400 hover:text-slate-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} /></svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`transition-all duration-500 ${isAnyModalOpen ? 'mt-0' : 'mt-4'}`}>
        {(activeView === 'staff' || activeView === 'relief') && (
          <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                <div>
                  <h3 className="text-2xl font-black dark:text-white tracking-tight uppercase leading-none">
                    {activeView === 'staff' ? 'Human Capital' : 'Contract Pipeline'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                    {activeView === 'staff' ? 'Verified Station Registry' : 'Monitoring Requisitions'}
                  </p>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="text" placeholder="Audit records..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm focus:border-gov-blue transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  {activeView === 'relief' && (
                    <button onClick={() => setIsReliefModalOpen(true)} className="px-6 py-3 bg-gov-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-gov-dark transition-all flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      <span>New Request</span>
                    </button>
                  )}
                </div>
             </div>

             {activeView === 'relief' && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Demands</h5>
                   </div>
                   <div className="space-y-3">
                     {schoolReliefRequests.map(req => (
                       <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-gov-blue/20 transition-all flex items-center justify-between group">
                         <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${req.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>{req.subject.charAt(0)}</div>
                            <div className="space-y-0.5">
                               <p className="text-sm font-black dark:text-white leading-none">{req.subject}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-xs">{req.reason}</p>
                            </div>
                         </div>
                         <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${req.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{req.status}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="bg-slate-950 p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10 space-y-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Registry Load</p>
                        <div className="flex items-end justify-center space-x-4">
                          <p className="text-6xl font-black text-white leading-none tracking-tighter">{filteredStaff.length}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Relief<br/>Staff</p>
                        </div>
                        <div className="pt-6 border-t border-white/5 space-y-4">
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gov-blue w-[94%] rounded-full shadow-[0_0_10px_rgba(0,174,239,0.8)]"></div>
                           </div>
                        </div>
                    </div>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map(s => {
                  const daysLeft = calculateDaysLeft(s.contractEnd);
                  return (
                    <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-gov-blue/60 transition-all relative group overflow-hidden">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                           <img src={`https://picsum.photos/seed/${s.id}/128/128`} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                        {s.isRelief && (
                          <div className="text-right">
                             <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-orange-100">Relief</span>
                             {daysLeft <= 30 && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-2 block animate-pulse">Expiring</span>}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black dark:text-white leading-tight">{s.name} <span className="text-gov-blue">{s.surname}</span></h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.subject} • {s.designation}</p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                           <span className="text-slate-400">Salary Grade</span>
                           <span className="dark:text-slate-200">{s.salaryScale}</span>
                        </div>
                        {s.isRelief && (
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Ends In</span>
                            <span className={`${daysLeft <= 30 ? 'text-red-500' : 'text-orange-500'}`}>{daysLeft} Days</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setSelectedStaff(s); setIsPersonnelModalOpen(true); }} className="w-full mt-6 py-3.5 bg-slate-50 dark:bg-slate-800 text-gov-blue text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue hover:text-white transition-all">Access Record</button>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {activeView === 'writing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                <h3 className="text-3xl font-black dark:text-white tracking-tight">Admin Writing</h3>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Subject Citation</label>
                      <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={writingTopic} onChange={e => setWritingTopic(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Narrative Rationale</label>
                      <textarea rows={5} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm resize-none" value={writingContext} onChange={e => setWritingContext(e.target.value)} />
                   </div>
                </div>
                <button onClick={async () => { setIsGenerating(true); setGeneratedDoc(await generateAdministrativeLetter(schoolDetails, writingTopic, writingContext)); setIsGenerating(false); }} disabled={isGenerating || !writingTopic} className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-40">{isGenerating ? 'Synthesizing...' : 'Generate Official Brief'}</button>
             </div>
             <div className="bg-slate-950 rounded-[2rem] p-8 text-white flex flex-col h-[600px] border border-slate-900 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manuscript Preview</h5>
                   {generatedDoc && <button onClick={() => downloadWordDoc(generatedDoc, writingTopic)} className="px-4 py-2 bg-gov-blue text-white rounded-lg font-black text-[9px] uppercase tracking-widest">Download .doc</button>}
                </div>
                <div className="flex-1 bg-white rounded-xl p-8 overflow-y-auto font-serif text-[14px] scale-90 origin-top leading-relaxed text-slate-900 whitespace-pre-wrap shadow-inner border-t-[10px] border-gov-blue">
                   {generatedDoc || <div className="h-full flex flex-col items-center justify-center opacity-10 text-center"><p className="font-black uppercase tracking-widest text-lg">Awaiting directives</p></div>}
                </div>
             </div>
          </div>
        )}

        {activeView === 'school' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-700">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                 <h3 className="text-3xl font-black dark:text-white tracking-tight leading-none">Station Master File</h3>
                 <button onClick={() => { setIsEditingSchool(!isEditingSchool); if(isEditingSchool) handleSchoolSave(); }} className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md ${isEditingSchool ? 'bg-emerald-500 text-white' : 'bg-gov-blue text-white'}`}>
                   {isEditingSchool ? 'Push Registry' : 'Edit Registry'}
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 {[
                    { l: 'Station Name', k: 'name' }, { l: 'Centre ID', k: 'centreNumber' }, { l: 'Reg No.', k: 'registrationNumber' }, { l: 'Phone', k: 'phone' }, { l: 'Email', k: 'email' }, { l: 'Regional Cluster', k: 'region' }
                 ].map(f => (
                    <div key={f.k} className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{f.l}</label>
                       {isEditingSchool ? (
                         <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-sm" value={(schoolEditForm as any)[f.k]} onChange={e => setSchoolEditForm({...schoolEditForm, [f.k]: e.target.value})} />
                       ) : (
                         <div className="w-full p-4 bg-slate-50/60 dark:bg-slate-800/60 dark:text-slate-200 border border-slate-100 rounded-xl font-black text-sm">{(schoolDetails as any)[f.k]}</div>
                       )}
                    </div>
                 ))}
              </div>
              <div className="mt-12 pt-8 border-t border-slate-100">
                 <div className="flex items-center space-x-8 p-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100">
                    <div className="w-24 h-24 rounded-2xl bg-gov-blue flex items-center justify-center text-white text-4xl font-black shadow-lg">
                      {schoolDetails.schoolHeadName?.charAt(0)}
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Authority</p>
                       <p className="text-3xl font-black dark:text-white leading-none tracking-tight">{schoolDetails.schoolHeadName}</p>
                       <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit mt-4">Verified</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'endorsements' && (
           <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-700">
              <div className="flex justify-between items-center px-4">
                 <h3 className="text-3xl font-black dark:text-white tracking-tight">Transfer Pipeline</h3>
                 <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-3 rounded-2xl border border-orange-100 flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{endorsements.filter(e => e.status === TransferStatus.PENDING).length} Items</span>
                 </div>
              </div>
              <div className="space-y-6">
                {endorsements.map(req => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-gov-blue transition-all">
                     <div className="flex flex-col xl:flex-row gap-8">
                        <div className="flex-1 space-y-8">
                           <div className="flex items-center space-x-6">
                              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-black text-2xl text-gov-blue shadow-inner border-2 border-white">
                                 {req.teacherName.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-xl font-black dark:text-white leading-none">{req.teacherName}</h4>
                                 <p className="text-[10px] text-gov-blue font-black uppercase tracking-widest">Verified Specialist</p>
                              </div>
                           </div>
                           <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 space-y-6 shadow-inner">
                              <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed font-medium">"{req.reason}"</p>
                              <div className="grid grid-cols-2 gap-8 text-[10px] font-black uppercase tracking-widest pt-6 border-t border-slate-100">
                                 <div><span className="text-slate-400 block mb-2 font-bold">Target Station:</span> <span className="dark:text-slate-200 text-lg leading-none">{req.targetSchool}</span></div>
                                 <div><span className="text-slate-400 block mb-2 font-bold">Date:</span> <span className="dark:text-slate-200 text-lg leading-none">{req.date}</span></div>
                              </div>
                           </div>
                        </div>
                        <div className="w-full xl:w-64 space-y-4 flex flex-col justify-center">
                           {req.status === TransferStatus.PENDING ? (
                             <div className="space-y-3">
                                <button 
                                  onClick={() => handleTransferDecision(req.id, TransferStatus.ENDORSED)}
                                  className="w-full py-3.5 bg-gov-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-gov-dark transition-all"
                                >
                                  Endorse Transfer
                                </button>
                                <button 
                                  onClick={() => handleTransferDecision(req.id, TransferStatus.REJECTED)}
                                  className="w-full py-3.5 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                  Decline Case
                                </button>
                             </div>
                           ) : (
                             <div className="p-8 rounded-2xl text-center border-2 border-dashed h-full flex flex-col items-center justify-center">
                                <p className={`text-2xl font-black uppercase tracking-widest mb-4 ${req.status === TransferStatus.ENDORSED ? 'text-emerald-500' : 'text-red-500'}`}>{req.status}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">National Records Updated</p>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>

      {isReliefModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in" onClick={() => setIsReliefModalOpen(false)}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-8 bg-slate-950 text-white flex justify-between items-center relative overflow-hidden border-b border-white/5">
                 <h4 className="text-2xl font-black tracking-tight leading-none uppercase">Relief Citation</h4>
                 <button onClick={() => setIsReliefModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Subject Area</label>
                    <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-base shadow-inner" placeholder="e.g. CORE MATHEMATICS" value={reliefSubject} onChange={e => setReliefSubject(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Rationale citation</label>
                    <textarea rows={4} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-xl outline-none font-bold text-base resize-none shadow-inner leading-relaxed" placeholder="Cite root causes (e.g. 6-month Maternity Citation)..." value={reliefReason} onChange={e => setReliefReason(e.target.value)} />
                 </div>
                 {reliefGeneratedDoc && (
                   <div className="p-8 bg-slate-950 rounded-2xl border border-slate-900 animate-in slide-in-from-top-10 duration-700 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6 relative z-10">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Synthesized Manuscript</p>
                         <button onClick={() => downloadWordDoc(reliefGeneratedDoc, "Relief_Requisition")} className="px-4 py-2 bg-gov-blue text-white rounded-lg font-black text-[9px] uppercase tracking-widest">Download</button>
                      </div>
                      <div className="bg-white rounded-lg p-8 h-48 overflow-y-auto font-serif text-[13px] leading-relaxed text-slate-900 whitespace-pre-wrap shadow-inner border-t-[8px] border-gov-blue">
                         {reliefGeneratedDoc}
                      </div>
                   </div>
                 )}
              </div>
              <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 flex gap-4">
                 <button onClick={handleGenerateReliefLetter} disabled={isGeneratingRelief || !reliefReason} className="flex-1 py-4 bg-gov-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md disabled:opacity-40">{isGeneratingRelief ? 'Synthesizing...' : 'Synthesize Letter'}</button>
                 <button onClick={() => { setIsReliefModalOpen(false); alert("Transmitted."); }} disabled={!reliefGeneratedDoc} className="flex-1 py-4 bg-slate-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30">Transmit</button>
              </div>
           </div>
        </div>
      )}

      {isPersonnelModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in" onClick={() => { setIsPersonnelModalOpen(false); resetActionState(); }}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-8 bg-gov-blue text-white flex justify-between items-center relative overflow-hidden">
                 <h4 className="text-2xl font-black tracking-tight uppercase leading-none">Personnel Registry Record</h4>
                 <button onClick={() => { setIsPersonnelModalOpen(false); resetActionState(); }} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                 <div className="flex items-center space-x-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-lg border-4 border-white dark:border-slate-700">
                       <img src={`https://picsum.photos/seed/${selectedStaff.id}/256/256`} className="w-full h-full object-cover" alt="Portrait" />
                    </div>
                    <div className="flex-1 space-y-3">
                       <h5 className="text-3xl font-black dark:text-white leading-none tracking-tight">{selectedStaff.name} <span className="text-gov-blue">{selectedStaff.surname}</span></h5>
                       <div className="flex flex-wrap gap-2">
                          <span className="text-[9px] text-gov-blue font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-100">{selectedStaff.designation}</span>
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100">{selectedStaff.salaryScale} Scale</span>
                       </div>
                       <div className="flex items-center space-x-6 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          <div>ID: {selectedStaff.idNumber}</div>
                          <div>Score: <span className="text-gov-blue">{selectedStaff.lastPerformanceScore}%</span></div>
                       </div>
                    </div>
                 </div>

                 {showActions ? (
                   <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex justify-between items-center mb-4">
                        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Action Protocol</h6>
                        <button onClick={() => setShowActions(false)} className="text-gov-blue font-black text-[9px] uppercase tracking-widest hover:underline">Cancel</button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {['PROMOTE', 'DEMOTE', 'APPOINT'].map(type => (
                          <button 
                            key={type} 
                            onClick={() => {
                              setActionType(type as any);
                              setNewScale(selectedStaff.salaryScale);
                              setNewDesignation(selectedStaff.designation);
                            }}
                            className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${
                              actionType === type ? 'bg-gov-blue text-white border-gov-blue' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 hover:border-gov-blue'
                            }`}
                          >
                            {type === 'APPOINT' ? 'Perm Appoint' : type}
                          </button>
                        ))}
                      </div>

                      {actionType && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase px-2">New Grade</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold" value={newScale} onChange={e => setNewScale(e.target.value)} />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase px-2">New Designation</label>
                                <input className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold" value={newDesignation} onChange={e => setNewDesignation(e.target.value)} />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase px-2">Institutional Rationale</label>
                            <textarea rows={2} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium resize-none" placeholder="Reason for action..." value={actionJustification} onChange={e => setActionJustification(e.target.value)} />
                          </div>
                          <button onClick={handleAdminAction} className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl">Commit Registry Update</button>
                        </div>
                      )}
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setShowActions(true)} className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center group hover:bg-gov-blue hover:text-white transition-all shadow-sm">
                         <svg className="w-8 h-8 mb-3 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span className="text-[9px] font-black uppercase tracking-widest">Promote/Demote</span>
                      </button>
                      <button onClick={() => { setShowActions(true); setActionType('APPOINT'); }} className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center group hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                         <svg className="w-8 h-8 mb-3 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <span className="text-[9px] font-black uppercase tracking-widest">Change Tenure</span>
                      </button>
                   </div>
                 )}

                 <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">National Registry Access Logs</p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                       <span className="text-[9px] font-black text-gov-blue uppercase">Service Portfolio</span>
                       <button onClick={handleDownloadPersonnelFile} className="text-[9px] font-black text-gov-blue hover:underline">Download Archive (.doc)</button>
                    </div>
                 </div>
              </div>
              
              <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 flex gap-4">
                 <button onClick={() => { setIsPersonnelModalOpen(false); resetActionState(); }} className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-500 font-black rounded-xl border border-slate-200 shadow-sm uppercase text-[9px] tracking-widest">Close Record</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SchoolHeadPanel;
