
import React, { useState, useEffect } from 'react';
import { UserRole, User, Notification, AvailabilityStatus } from './types';
import Layout from './components/Layout';
import Login from './components/Login';
import Landing from './components/Landing';
import TeacherDashboard from './components/TeacherDashboard';
import TransferPortal from './components/TransferPortal';
import ResourceHub from './components/ResourceHub';
import AdminPanel from './components/AdminPanel';
import SchoolHeadPanel from './components/SchoolHeadPanel';
import RegionalPanel from './components/RegionalPanel';
import SubRegionalPanel from './components/SubRegionalPanel';
import TemporaryTeacherModule from './components/TemporaryTeacherModule';
import ReliefDatabase from './components/ReliefDatabase';
import ProfileWizard from './components/ProfileWizard';
import ProfilePage from './components/ProfilePage';
import { auth, db } from './firebase';

type ViewState = 'LANDING' | 'LOGIN' | 'APP' | 'RELIEF_APPLY' | 'VERIFY_EMAIL' | 'COMPLETE_PROFILE';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          try {
            const userRef = db.collection('users').doc(firebaseUser.uid);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
              const userData = userDoc.data() as User;
              setCurrentUser(userData);
              
              if (!userData.profileComplete) {
                setCurrentView('COMPLETE_PROFILE');
              } else {
                setCurrentView('APP');
              }
            } else {
              // Upsert logic: Create missing document with default TSM fields
              const newUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'TSM User',
                role: UserRole.TEACHER,
                gender: 'Male',
                profileComplete: false,
                botepcoAccreditation: '',
                contact: '',
                currentSchool: 'Unassigned',
                dateIntoCurrentSchool: '',
                dateIntoPost: '',
                dateJoinedService: '',
                designation: 'Staff Member',
                emergencyContactName: '',
                emergencyContactNo: '',
                emergencyContactRelation: '',
                idNumber: '',
                physicalAddress: '',
                postalAddress: '',
                qualifications: [],
                region: 'Not Set',
                salaryScale: 'TBD',
                status: AvailabilityStatus.ACTIVE,
                unionAffiliation: 'None',
                teacherMovement: []
              };
              await userRef.set(newUser);
              setCurrentUser(newUser);
              setCurrentView('COMPLETE_PROFILE');
            }
            
            setNotifications([{
              id: 'init-1',
              title: 'Verified Access',
              message: `Securely logged in. Welcome to TSM.`,
              timestamp: new Date().toLocaleTimeString(),
              read: false,
              type: 'SYSTEM'
            }]);
          } catch (err) {
            console.error("Error fetching user profile:", err);
            await auth.signOut();
            setCurrentUser(null);
            setCurrentView('LANDING');
          }
        } else {
          if (currentView !== 'VERIFY_EMAIL') {
            await auth.signOut();
            setCurrentUser(null);
            setCurrentView('LANDING');
          }
        }
      } else {
        setCurrentUser(null);
        if (currentView === 'APP' || currentView === 'COMPLETE_PROFILE') setCurrentView('LANDING');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentView]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setCurrentView('LANDING');
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginSuccess = () => {
    // onAuthStateChanged will handle the redirection logic based on profileComplete
  };

  const handleRequireVerification = (email: string) => {
    setVerificationEmail(email);
    setCurrentView('VERIFY_EMAIL');
  };

  const handleProfileComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setCurrentView('APP');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  if (isLoading && currentView !== 'LANDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gov-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Syncing TSM Registry...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'VERIFY_EMAIL') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 selection:bg-gov-blue selection:text-white grid-pattern">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-gov-blue mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Identity Verification</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              We have sent you a verification email to <span className="font-black text-gov-blue">{verificationEmail}</span>. 
              Verify it and log in to continue.
            </p>
          </div>
          <button 
            onClick={() => setCurrentView('LOGIN')}
            className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-gov-dark active:scale-95 transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'COMPLETE_PROFILE' && currentUser) {
    return <ProfileWizard user={currentUser} onComplete={handleProfileComplete} onLogout={handleLogout} />;
  }

  if (currentView === 'LANDING') {
    return <Landing 
      onStart={() => setCurrentView('LOGIN')} 
      onApplyRelief={() => setCurrentView('RELIEF_APPLY')} 
    />;
  }

  if (currentView === 'RELIEF_APPLY') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-10">
        <button 
          onClick={() => setCurrentView('LANDING')} 
          className="mb-8 flex items-center text-gov-blue font-bold hover:translate-x-[-4px] transition-transform"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </button>
        <TemporaryTeacherModule />
      </div>
    );
  }

  if (currentView === 'LOGIN') {
    return <Login onLogin={handleLoginSuccess} onBack={() => setCurrentView('LANDING')} onRequireVerification={handleRequireVerification} />;
  }

  if (!currentUser) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TeacherDashboard externalUser={currentUser} />;
      case 'transfers':
        return <TransferPortal role={currentUser.role} />;
      case 'resources':
        return <ResourceHub />;
      case 'temporary':
        return <TemporaryTeacherModule />;
      case 'relief_db':
        return <ReliefDatabase />;
      case 'profile':
        return <ProfilePage user={currentUser} onUpdate={handleUserUpdate} />;
      case 'management':
        if (currentUser.role === UserRole.SUPER_ADMIN) return <AdminPanel />;
        if (currentUser.role === UserRole.REGIONAL_OFFICER) return <RegionalPanel />;
        if (currentUser.role === UserRole.SUB_REGIONAL_OFFICER) return <SubRegionalPanel />;
        if (currentUser.role === UserRole.SCHOOL_HEAD) return <SchoolHeadPanel />;
        return <TeacherDashboard externalUser={currentUser} />;
      default:
        return <TeacherDashboard externalUser={currentUser} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      children={
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out h-full">
          {renderContent()}
        </div>
      }
      darkMode={darkMode}
      toggleTheme={toggleTheme}
      notifications={notifications}
      setNotifications={setNotifications}
    />
  );
};

export default App;
