
import React, { useState } from 'react';
import { MOCK_SCHOOL, MOCK_TEACHER, MOCK_VACANCIES } from '../constants';
import { generateAdministrativeLetter } from '../services/geminiService';
import { Vacancy, Teacher, AvailabilityStatus, School } from '../types';

interface ExtendedSchool extends School {
  staffCount: number;
  vacancies: number;
  head: string;
  status: string;
  staffingLevel: 'Balanced' | 'Surplus' | 'Deficit';
  deficits: string[];
}

const SubRegionalPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hub' | 'stations' | 'market' | 'redirection' | 'relief' | 'briefs' | 'swaps' | 'resources_mgmt'>('hub');
  
  // Dynamic School State to show effects of redirection
  const [schools, setSchools] = useState<ExtendedSchool[]>([
    { ...MOCK_SCHOOL, staffCount: 142, vacancies: 3, head: 'Mr. Segwagwa', status: 'Optimal', staffingLevel: 'Balanced', deficits: [] },
    { ...MOCK_SCHOOL, id: 'S002', name: 'Naledi Senior Secondary', centreNumber: 'NS-104', subRegion: 'Gaborone South', staffCount: 135, vacancies: 0, head: 'Ms. Tlou', status: 'Overstaffed', staffingLevel: 'Surplus', deficits: [] },
    { ...MOCK_SCHOOL, id: 'S003', name: 'St. Josephs College', centreNumber: 'STJ-08', subRegion: 'Gaborone South', staffCount: 156, vacancies: 2, head: 'Father Dintwa', status: 'Optimal', staffingLevel: 'Balanced', deficits: [] },
    { ...MOCK_SCHOOL, id: 'S004', name: 'Ledumang Senior', centreNumber: 'LS-22', subRegion: 'Gaborone South', staffCount: 110, vacancies: 9, head: 'Mr. Moloi', status: 'Critical', staffingLevel: 'Deficit', deficits: ['English', 'Setswana', 'Pure Math'] },
  ]);

  // Vacancy Market State
  const [localVacancies, setLocalVacancies] = useState<(Vacancy & { isRegional?: boolean })[]>(MOCK_VACANCIES);
  const [marketView, setMarketView] = useState<'local' | 'regional'>('local');
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [newVacancy, setNewVacancy] = useState({ school: schools[0].name, subject: '', scale: 'C3', grade: 'Senior' });

  // Redirection State
  const [selectedStaffToRedirect, setSelectedStaffToRedirect] = useState<any | null>(null);
  const [targetSchoolId, setTargetSchoolId] = useState<string>('');

  // Direct Contact State
  const [contactTarget, setContactTarget] = useState<{name: string, role: string} | null>(null);
  const [messageText, setMessageText] = useState('');

  // Relief State
  const [selectedReliefId, setSelectedReliefId] = useState<string | null>(null);
  const [reliefApplicants, setReliefApplicants] = useState([
    { id: 'RA-01', name: 'Thato Lekau', subject: 'Geography', qualification: 'BSc Geology', status: 'Available' },
    { id: 'RA-02', name: 'Phemelo Tau', subject: 'English', qualification: 'BA English Lang', status: 'Available' },
    { id: 'RA-03', name: 'Lerato Phiri', subject: 'Mathematics', qualification: 'BEd Maths', status: 'Assigned' },
    { id: 'RA-04', name: 'Kabo Letsholo', subject: 'Science', qualification: 'BSc Chemistry', status: 'Available' },
  ]);

  // Swaps State
  const [proxySwaps, setProxySwaps] = useState([
    { id: 'PS-101', teacher: 'John Molefe', current: 'Naledi Senior', target: 'Molepolole Secondary', status: 'Searching', color: 'text-orange-500' },
    { id: 'PS-102', teacher: 'Bame Tau', current: 'Ledumang Senior', target: 'Francistown High', status: 'Potential Match', color: 'text-emerald-500' },
  ]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [newSwap, setNewSwap] = useState({ teacher: '', current: schools[0].name, targetRegion: 'North West', reason: '' });

  // Resources State
  const [resources, setResources] = useState([
    { id: 'RES-01', title: 'Cluster South Circular 2025/01', type: 'Administrative', date: '2025-01-10', size: '1.2 MB' },
    { id: 'RES-02', title: 'Teacher Attendance Protocol', type: 'Policy', date: '2024-12-08', size: '840 KB' },
  ]);

  const [auditingSchoolId, setAuditingSchoolId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState('');
  const [briefTopic, setBriefTopic] = useState('');
  const [briefContext, setBriefContext] = useState('');

  // --- Handlers ---

  const handleAuditStaff = (id: string) => {
    setAuditingSchoolId(id);
  };

  const handleCaptureVacancy = () => {
    if(!newVacancy.subject) return;
    const v: Vacancy & { isRegional?: boolean } = {
      id: `V${localVacancies.length + 100}`,
      schoolName: newVacancy.school,
      region: 'South East',
      subject: newVacancy.subject,
      salaryScale: newVacancy.scale,
      grade: newVacancy.grade,
      isRegional: false
    };
    setLocalVacancies([v, ...localVacancies]);
    setShowVacancyModal(false);
    setNewVacancy({ school: schools[0].name, subject: '', scale: 'C3', grade: 'Senior' });
    alert("Vacancy captured successfully in TSM Local Market.");
  };

  const handleAdvertiseRegionally = (id: string) => {
    setLocalVacancies(prev => prev.map(v => v.id === id ? { ...v, isRegional: true } : v));
    alert("Vacancy escalated to Regional TSM Registry.");
  };

  const handleCommitRedirection = () => {
    if (!selectedStaffToRedirect || !targetSchoolId) return;
    setSchools(prev => prev.map(s => {
      if (s.name === selectedStaffToRedirect.currentSchool) {
        return { ...s, staffCount: s.staffCount - 1, staffingLevel: s.staffCount - 1 > 130 ? 'Surplus' : 'Balanced' };
      }
      if (s.id === targetSchoolId) {
        return { ...s, staffCount: s.staffCount + 1, vacancies: Math.max(0, s.vacancies - 1), staffingLevel: s.staffCount + 1 < 120 ? 'Deficit' : 'Balanced' };
      }
      return s;
    }));
    alert(`Rebalancing Complete: ${selectedStaffToRedirect.name} redirected.`);
    setSelectedStaffToRedirect(null);
    setTargetSchoolId('');
  };

  const handleDispatchRelief = () => {
    if (!selectedReliefId) {
      alert("Select a qualified applicant first.");
      return;
    }
    setReliefApplicants(prev => prev.map(ra => ra.id === selectedReliefId ? { ...ra, status: 'Assigned' } : ra));
    alert("Relief Staff Dispatched. TSM Contract Activated.");
    setSelectedReliefId(null);
  };

  const handleInitiateProxySwap = () => {
    const swap = {
      id: `PS-${Date.now().toString().slice(-3)}`,
      teacher: newSwap.teacher,
      current: newSwap.current,
      target: newSwap.targetRegion,
      status: 'Searching',
      color: 'text-orange-500'
    };
    setProxySwaps([swap, ...proxySwaps]);
    setShowSwapModal(false);
    alert("Proxy Swap Request Published.");
  };

  const handleUploadDocument = () => {
    const title = prompt("Enter Document Title:");
    if (title) {
      setResources([{ id: `RES-${Date.now()}`, title, type: 'Directive', date: '2025-02-15', size: '1.1 MB' }, ...resources]);
    }
  };

  const handleGenerateBrief = async () => {
    if (!briefTopic || !briefContext) return;
    setIsGenerating(true);
    try {
      const brief = await generateAdministrativeLetter(MOCK_SCHOOL, briefTopic, briefContext);
      setGeneratedBrief(brief);
    } catch (error) {
      alert("AI Synthesis Offline.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Optimal': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100';
      case 'Overstaffed': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100';
      case 'Critical': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const menuItems = [
    { id: 'hub', label: 'Hub', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3' },
    { id: 'stations', label: 'Stations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
    { id: 'market', label: 'Market', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: 'redirection', label: 'Redirect', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4' },
    { id: 'relief', label: 'Relief', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5' },
    { id: 'briefs', label: 'Briefs', icon: 'M15.232 5.232l3.536 3.536' },
    { id: 'swaps', label: 'Swaps', icon: 'M7 16V4m0 0L3 8m4-4l4 4' },
    { id: 'resources_mgmt', label: 'Docs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5' },
  ];

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      {/* Uniform Hub Header */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gov-blue/20 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-gov-blue animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">TSM Regional Operations</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-none">Gaborone South Cluster</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 p-2 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 w-full xl:w-auto">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-gov-blue text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Cluster Parity', value: '92%', trend: 'Balanced', color: 'text-emerald-500' },
            { label: 'Unfilled Posts', value: schools.reduce((a,b)=>a+b.vacancies,0).toString(), trend: 'Active', color: 'text-red-500' },
            { label: 'Relief Personnel', value: reliefApplicants.filter(r=>r.status==='Assigned').length.toString(), trend: 'Deployed', color: 'text-gov-blue' },
            { label: 'Surplus Staff', value: schools.filter(s=>s.staffingLevel==='Surplus').length.toString(), trend: 'Rebalancing', color: 'text-orange-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
              <h4 className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-4 italic">{stat.trend} Monitoring</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stations' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {schools.map(school => (
              <div key={school.id} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl group transition-all">
                <div className="flex justify-between mb-8">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gov-blue font-black shadow-inner">
                    {school.centreNumber.split('-')[0]}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(school.status)}`}>
                    {school.status}
                  </div>
                </div>
                <h4 className="text-xl font-black dark:text-white mb-2">{school.name}</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-8 leading-none">Head: {school.head}</p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Staff</p>
                    <p className="text-xl font-black dark:text-white">{school.staffCount}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Level</p>
                    <p className={`text-[10px] font-black ${school.staffingLevel === 'Deficit' ? 'text-red-500' : 'text-gov-blue'}`}>{school.staffingLevel}</p>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                   <button onClick={() => setContactTarget({name: school.head, role: 'School Head'})} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-gov-blue text-[8px] font-black uppercase rounded-xl">Contact</button>
                   <button onClick={() => handleAuditStaff(school.id)} className="flex-1 py-3 bg-slate-900 text-white text-[8px] font-black uppercase rounded-xl">Audit</button>
                </div>
              </div>
            ))}
          </div>

          {auditingSchoolId && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black dark:text-white">Staff Audit: {schools.find(s=>s.id===auditingSchoolId)?.name}</h3>
                <button onClick={() => setAuditingSchoolId(null)} className="text-gov-blue font-black text-xs uppercase underline">Exit Audit</button>
              </div>
              <div className="space-y-4">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-gov-blue text-white flex items-center justify-center font-black">BW</div>
                        <div>
                          <p className="font-black dark:text-white">Verified TSM Personnel {i+1}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">TS-ID: 992{i}81 • Designation: Teacher</p>
                        </div>
                     </div>
                     <button onClick={() => setContactTarget({name: `TS Personnel ${i+1}`, role: 'Teacher'})} className="px-6 py-2 bg-white dark:bg-slate-900 text-gov-blue text-[9px] font-black uppercase rounded-xl border border-slate-100">Direct Contact</button>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-10">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-3xl font-black dark:text-white tracking-tight">Vacancy Market</h3>
                <div className="flex mt-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit shadow-inner">
                   <button onClick={() => setMarketView('local')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${marketView === 'local' ? 'bg-white text-gov-blue shadow-sm' : 'text-slate-400'}`}>Local</button>
                   <button onClick={() => setMarketView('regional')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${marketView === 'regional' ? 'bg-white text-gov-blue shadow-sm' : 'text-slate-400'}`}>Regional Registry</button>
                </div>
              </div>
              <button onClick={() => setShowVacancyModal(true)} className="px-8 py-4 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Capture New Vacancy</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {localVacancies.filter(v => marketView === 'regional' ? v.isRegional : !v.isRegional).map(v => (
                <div key={v.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl group transition-all">
                   <h4 className="text-2xl font-black dark:text-white leading-tight mb-4">{v.schoolName}</h4>
                   <p className="text-sm font-bold dark:text-slate-200">{v.subject}</p>
                   <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex gap-4">
                     {!v.isRegional && <button onClick={() => handleAdvertiseRegionally(v.id)} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-gov-blue text-[9px] font-black uppercase rounded-2xl hover:bg-gov-blue hover:text-white transition-all">Advertise Regionally</button>}
                     <button className="flex-1 py-4 bg-slate-900 text-white text-[9px] font-black uppercase rounded-2xl">Details</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'redirection' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
           <h3 className="text-3xl font-black dark:text-white mb-10">Institutional Rebalancing</h3>
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl w-fit">Source: Identified by Head (Surplus)</h5>
                 {schools.filter(s => s.staffingLevel === 'Surplus').map((s, i) => (
                   <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent hover:border-blue-500 cursor-pointer flex items-center justify-between" onClick={() => setSelectedStaffToRedirect({ name: `Nominee ${i+1}`, currentSchool: s.name })}>
                      <div>
                        <p className="font-black text-lg dark:text-white">Staff Nominee {i+1}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{s.name}</p>
                      </div>
                      <button className="text-blue-500 font-black text-[9px] uppercase tracking-widest">Mark for Move</button>
                   </div>
                 ))}
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl w-fit">Target: Deficit Stations</h5>
                 {schools.filter(s => s.staffingLevel === 'Deficit').map((s, i) => (
                   <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-between">
                      <div>
                         <p className="font-black text-lg dark:text-white">{s.name}</p>
                         <p className="text-[10px] text-red-500 font-bold uppercase">Gap: {s.vacancies} Posts</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           {selectedStaffToRedirect && (
              <div className="mt-12 p-10 bg-slate-950 rounded-[2.5rem] text-white">
                 <h4 className="text-xl font-black mb-8 leading-none">Redirecting {selectedStaffToRedirect.name} from {selectedStaffToRedirect.currentSchool}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Destination Station</label>
                       <select className="w-full p-5 bg-slate-900 text-white rounded-2xl border border-white/10 font-bold" value={targetSchoolId} onChange={e => setTargetSchoolId(e.target.value)}>
                          <option value="">Select Deficit Station...</option>
                          {schools.filter(s=>s.staffingLevel==='Deficit').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                    <button onClick={handleCommitRedirection} className="py-6 bg-gov-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">Execute TSM Rebalance</button>
                 </div>
              </div>
           )}
        </div>
      )}

      {activeTab === 'relief' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl">
           <h3 className="text-3xl font-black dark:text-white mb-10">Relief Dispatch Engine</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Qualified Applicant Registry</h5>
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                    {reliefApplicants.map(app => (
                      <div key={app.id} className={`p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 transition-all flex items-center justify-between cursor-pointer ${selectedReliefId === app.id ? 'border-gov-blue' : 'border-transparent'}`} onClick={() => setSelectedReliefId(app.id)}>
                         <div className="flex items-center space-x-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${app.status === 'Available' ? 'bg-gov-blue' : 'bg-slate-400'}`}>{app.name.charAt(0)}</div>
                            <div>
                               <p className="font-black text-lg dark:text-white">{app.name}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{app.subject}</p>
                            </div>
                         </div>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${app.status === 'Available' ? 'text-emerald-500' : 'text-slate-400'}`}>{app.status}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-950 p-10 rounded-[3rem] text-white flex flex-col justify-center border border-white/5">
                 <h4 className="text-3xl font-black leading-tight mb-10">Dispatch Assignment</h4>
                 <div className="space-y-6">
                    <select className="w-full p-5 bg-slate-900 text-white rounded-2xl border border-white/10 outline-none font-bold">
                       <option>REQ-402: Ledumang Senior (Math)</option>
                       <option>REQ-388: Gaborone Secondary (Physics)</option>
                    </select>
                    <button onClick={handleDispatchRelief} className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">Deploy to Station</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'swaps' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-3xl font-black dark:text-white tracking-tight">Swap Proxy Hub</h3>
              <button onClick={() => setShowSwapModal(true)} className="px-8 py-4 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Initiate New Proxy Swap</button>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black uppercase text-slate-400">
                       <th className="px-10 py-6">Requesting Personnel</th>
                       <th className="px-10 py-6">Current Station</th>
                       <th className="px-10 py-6">Status</th>
                       <th className="px-10 py-6 text-right">Protocol</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {proxySwaps.map(swap => (
                      <tr key={swap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="px-10 py-6 font-black dark:text-white">{swap.teacher}</td>
                         <td className="px-10 py-6 text-xs font-bold dark:text-slate-300">{swap.current}</td>
                         <td className="px-10 py-6">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${swap.color}`}>{swap.status}</span>
                         </td>
                         <td className="px-10 py-6 text-right">
                            <button onClick={() => alert(`Opening Management Protocol for Case ID: ${swap.id}`)} className="text-gov-blue font-black text-[9px] uppercase hover:underline">Manage Case</button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'resources_mgmt' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-3xl font-black dark:text-white tracking-tight">TSM Document Center</h3>
              <button onClick={handleUploadDocument} className="px-8 py-4 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Upload Document</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resources.map(res => (
                <div key={res.id} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-between group transition-all">
                   <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-gov-blue">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                         <p className="font-black text-lg dark:text-white leading-tight">{res.title}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{res.type} • {res.date}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                     <button className="px-6 py-2 bg-slate-50 dark:bg-slate-800 text-gov-blue font-black text-[9px] uppercase rounded-xl">Manage</button>
                     <button onClick={() => setResources(prev => prev.filter(r=>r.id!==res.id))} className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Capture Vacancy Modal */}
      {showVacancyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowVacancyModal(false)}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 bg-gov-blue text-white flex justify-between items-center">
                 <h4 className="text-3xl font-black tracking-tight uppercase leading-none">Vacancy Capture</h4>
                 <button onClick={() => setShowVacancyModal(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Station</label>
                       <select className="w-full p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm appearance-none" value={newVacancy.school} onChange={e => setNewVacancy({...newVacancy, school: e.target.value})}>
                          {schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Salary Scale</label>
                       <input className="w-full p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm" value={newVacancy.scale} onChange={e => setNewVacancy({...newVacancy, scale: e.target.value})} placeholder="e.g. C3" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Discipline</label>
                    <input className="w-full p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm" value={newVacancy.subject} onChange={e => setNewVacancy({...newVacancy, subject: e.target.value})} placeholder="e.g. Pure Mathematics" />
                 </div>
                 <button onClick={handleCaptureVacancy} className="w-full py-6 bg-gov-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl">Capture & Advertise Vacancy</button>
              </div>
           </div>
        </div>
      )}

      {/* Proxy Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowSwapModal(false)}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                 <h4 className="text-3xl font-black tracking-tight uppercase leading-none">Initiate Proxy Swap</h4>
                 <button onClick={() => setShowSwapModal(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Teacher ID / Name</label>
                    <input className="w-full p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Kabo Segwagwa" value={newSwap.teacher} onChange={e => setNewSwap({...newSwap, teacher: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Current Station</label>
                       <select className="w-full p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm appearance-none" value={newSwap.current} onChange={e => setNewSwap({...newSwap, current: e.target.value})}>
                          {schools.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Target Region</label>
                       <select className="w-full p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm appearance-none" value={newSwap.targetRegion} onChange={e => setNewSwap({...newSwap, targetRegion: e.target.value})}>
                          <option>North West</option>
                          <option>North East</option>
                          <option>Southern</option>
                       </select>
                    </div>
                 </div>
                 <button onClick={handleInitiateProxySwap} className="w-full py-6 bg-gov-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30">Publicize Proxy Swap Request</button>
              </div>
           </div>
        </div>
      )}

      {/* Direct Contact Modal */}
      {contactTarget && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setContactTarget(null)}></div>
           <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-8 bg-slate-900 text-white flex items-center space-x-6 border-b border-white/5">
                 <div className="w-14 h-14 bg-gov-blue rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">{contactTarget.name.charAt(0)}</div>
                 <div>
                    <h4 className="text-xl font-black leading-none">{contactTarget.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{contactTarget.role}</p>
                 </div>
              </div>
              <div className="p-10 space-y-8">
                 <textarea rows={5} className="w-full p-6 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-[2rem] outline-none font-bold text-sm resize-none shadow-inner leading-relaxed" placeholder="Type official communication..." value={messageText} onChange={e => setMessageText(e.target.value)} />
                 <button onClick={() => {alert("Message Transmitted through Secure TSM Channel."); setContactTarget(null); setMessageText('');}} className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-gov-dark active:scale-95 transition-all">Transmit Message</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubRegionalPanel;
