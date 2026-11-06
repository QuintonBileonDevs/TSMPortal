
import React, { useState } from 'react';
import { MOCK_TEACHER, MOCK_VACANCIES } from '../constants';
import { UserRole, Vacancy, TransferStatus } from '../types';
import { generateTransferLetter } from '../services/geminiService';

interface TransferPortalProps {
  role: UserRole;
}

interface MarketPost extends Vacancy {
  isSwap?: boolean;
  offeredBy?: string;
  offeredScale?: string;
  offeredDesignation?: string;
}

const TransferPortal: React.FC<TransferPortalProps> = ({ role }) => {
  const [activeView, setActiveView] = useState<'browse' | 'requests' | 'apply' | 'post-swap'>('browse');
  const [marketPosts, setMarketPosts] = useState<MarketPost[]>(MOCK_VACANCIES);
  
  const [myRequests, setMyRequests] = useState<any[]>([
    { id: 'TR-7721', schoolName: 'Maun Secondary', region: 'North West', status: TransferStatus.PENDING, date: '2024-05-20', isSwap: false },
    { id: 'TR-8810', schoolName: 'Francistown High', region: 'North East', status: TransferStatus.ENDORSED, date: '2024-05-15', isSwap: false },
    { id: 'TR-9902', schoolName: 'Kanye Senior', region: 'Southern', status: TransferStatus.PROCESSED, date: '2024-04-28', isSwap: false },
  ]);
  
  const [selectedVacancy, setSelectedVacancy] = useState<MarketPost | null>(null);
  const [reason, setReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);

  const [swapTarget, setSwapTarget] = useState({
    region: 'North West',
    subRegion: '',
    school: '',
    reason: ''
  });

  const handleApply = (v: MarketPost) => {
    setSelectedVacancy(v);
    setApplicationStep(1);
    setActiveView('apply');
    setGeneratedLetter('');
    setSignedFile(null);
  };

  const handlePostSwap = () => {
    const newPost: MarketPost = {
      id: `SWAP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      schoolName: swapTarget.school || 'Any School',
      region: swapTarget.region,
      subject: MOCK_TEACHER.qualifications[0].includes('Science') ? 'Science' : 'Specialist',
      salaryScale: MOCK_TEACHER.salaryScale,
      grade: MOCK_TEACHER.designation,
      isSwap: true,
      offeredBy: `${MOCK_TEACHER.name} ${MOCK_TEACHER.surname}`,
      offeredScale: MOCK_TEACHER.salaryScale,
      offeredDesignation: MOCK_TEACHER.designation
    };

    setMarketPosts([newPost, ...marketPosts]);
    setMyRequests([{ ...newPost, status: TransferStatus.PENDING, date: new Date().toISOString().split('T')[0] }, ...myRequests]);
    alert("Your swap desire has been publicized in the TSM Market.");
    setActiveView('browse');
  };

  const handleGenerateLetter = async () => {
    if (!selectedVacancy || !reason) return;
    setIsGenerating(true);
    try {
      const letter = await generateTransferLetter(MOCK_TEACHER, reason, selectedVacancy.schoolName);
      setGeneratedLetter(letter);
      setApplicationStep(2);
    } catch (error) {
      alert("Error generating letter. Please check your network.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsWord = () => {
    if (!generatedLetter) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Transfer Brief</title><style>body { font-family: 'Times New Roman', serif; line-height: 1.5; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + generatedLetter.replace(/\n/g, '<br>') + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Transfer_Request_${MOCK_TEACHER.surname}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    setApplicationStep(3);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setSignedFile(e.target.files![0]);
        setIsUploading(false);
        setApplicationStep(4);
      }, 1500);
    }
  };

  const handleSubmitApplication = () => {
    if (!signedFile) return;
    alert("Application submitted successfully through TSM Protocol!");
    setActiveView('browse');
  };

  const getSubjectTheme = (post: MarketPost) => {
    if (post.isSwap) return {
      icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
      color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-100 dark:border-orange-800'
    };
    return { 
      icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      color: 'text-gov-blue', bg: 'bg-blue-50 dark:bg-blue-900/40', border: 'border-blue-100 dark:border-blue-800'
    };
  };

  const ApplicationProgress: React.FC<{ status: TransferStatus }> = ({ status }) => {
    const stages = [
      { id: 'submitted', label: 'Submitted', key: [TransferStatus.PENDING, TransferStatus.ENDORSED, TransferStatus.APPROVED, TransferStatus.PROCESSED] },
      { id: 'head', label: 'Endorsed', key: [TransferStatus.ENDORSED, TransferStatus.APPROVED, TransferStatus.PROCESSED] },
      { id: 'regional', label: 'Regional', key: [TransferStatus.APPROVED, TransferStatus.PROCESSED] },
      { id: 'processed', label: 'Processed', key: [TransferStatus.PROCESSED] },
    ];

    const isRejected = status === TransferStatus.REJECTED;

    return (
      <div className="w-full mt-10">
        <div className="relative flex justify-between items-center">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gov-blue rounded-full z-0 transition-all duration-1000 ease-out" style={{ width: isRejected ? '0%' : `${(stages.filter(s => s.key.includes(status)).length - 1) / (stages.length - 1) * 100}%` }}></div>
          {stages.map((stage, index) => {
            const isCompleted = stage.key.includes(status) && status !== stages[index].key[0];
            const isCurrent = status === stages[index].key[0];
            const isFuture = !stage.key.includes(status);
            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${isCompleted ? 'bg-gov-blue border-white dark:border-slate-900 text-white' : isCurrent ? 'bg-white dark:bg-slate-900 border-gov-blue text-gov-blue shadow-[0_0_15px_rgba(0,174,239,0.3)]' : isRejected && index === 0 ? 'bg-red-500 border-white dark:border-slate-900 text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300'}`}>
                  {isCompleted ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg> : isRejected && index === 0 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg> : <span className="text-[10px] font-black">{index + 1}</span>}
                </div>
                <div className="absolute top-10 whitespace-nowrap"><p className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-gov-blue' : isFuture ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>{stage.label}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (activeView === 'post-swap') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setActiveView('browse')} className="text-gov-blue font-black text-xs uppercase tracking-widest flex items-center hover:translate-x-[-4px] transition-transform">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Back to TSM Market
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
               <h3 className="text-3xl font-black dark:text-white tracking-tight">Define Your Desired Target</h3>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Preferred Region</label>
                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm" value={swapTarget.region} onChange={e => setSwapTarget({...swapTarget, region: e.target.value})}>
                      <option>North West</option>
                      <option>North East</option>
                      <option>South East</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Specific Station (Optional)</label>
                    <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Maun Secondary" value={swapTarget.school} onChange={e => setSwapTarget({...swapTarget, school: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Reason Narrative</label>
                    <textarea rows={4} className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm resize-none" placeholder="Provide context..." value={swapTarget.reason} onChange={e => setSwapTarget({...swapTarget, reason: e.target.value})} />
                  </div>
                  <button onClick={handlePostSwap} className="w-full py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl text-[10px] uppercase tracking-[0.2em]">Publicize Swap Desire</button>
               </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
         <div>
            <h3 className="text-4xl font-black dark:text-white tracking-tight">Transfer Opportunity Market</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">Cross-regional vacancy and swap synchronization.</p>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('post-swap')} className="px-6 py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4" /></svg>
               Initiate Swap Request
            </button>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.75rem]">
               <button onClick={() => setActiveView('browse')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'browse' ? 'bg-white dark:bg-slate-700 text-gov-blue shadow-lg' : 'text-slate-500'}`}>Market ({marketPosts.length})</button>
               <button onClick={() => setActiveView('requests')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'requests' ? 'bg-white dark:bg-slate-700 text-gov-blue shadow-lg' : 'text-slate-500'}`}>My Portfolio</button>
            </div>
         </div>
      </div>

      {activeView === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {marketPosts.map((v) => {
            const theme = getSubjectTheme(v);
            return (
              <div key={v.id} className={`group bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 shadow-2xl border-2 transition-all flex flex-col h-full transform hover:-translate-y-2 duration-500 relative overflow-hidden ${v.isSwap ? 'border-orange-100 dark:border-orange-900/30' : 'border-slate-100 dark:border-slate-800 hover:border-gov-blue'}`}>
                <div className={`p-6 w-20 h-20 flex items-center justify-center ${theme.bg} ${theme.color} rounded-[2rem] mb-8 border-2 ${theme.border} shadow-sm group-hover:scale-110 transition-all duration-500`}>{theme.icon}</div>
                <div className="space-y-4 mb-8">
                  <h4 className="font-black text-3xl dark:text-white leading-tight group-hover:text-gov-blue transition-colors">{v.schoolName}</h4>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{v.region} Region</p>
                  <p className={`text-sm font-black uppercase tracking-widest ${theme.color}`}>{v.subject}</p>
                </div>
                <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800">
                  <button onClick={() => handleApply(v)} className={`w-full py-5 text-white font-black rounded-2xl shadow-2xl transition-all text-[10px] uppercase tracking-[0.2em] ${v.isSwap ? 'bg-orange-500 shadow-orange-500/30' : 'bg-gov-blue shadow-blue-500/40'}`}>
                    {v.isSwap ? 'Negotiate Swap' : 'Secure Post'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8 max-w-5xl mx-auto">
          {myRequests.map(req => (
            <div key={req.id} className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 group hover:border-gov-blue/50 transition-all">
              <div className="flex justify-between items-center">
                 <div>
                    <h4 className="text-3xl font-black dark:text-white leading-tight">{req.schoolName}</h4>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{req.region} • Ref: {req.id}</p>
                 </div>
                 <button className="px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-500 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100">Retract</button>
              </div>
              <div className="pt-10 border-t border-slate-50 dark:border-slate-800">
                <ApplicationProgress status={req.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransferPortal;
