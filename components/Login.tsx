
import React, { useState } from 'react';
import { auth, db, firebase } from '../firebase';
import { UserRole, AvailabilityStatus, User } from '../types';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
  onRequireVerification: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack, onRequireVerification }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.TEACHER);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (user && !user.emailVerified) {
        await user.sendEmailVerification();
        await auth.signOut();
        onRequireVerification(email);
      } else {
        onLogin();
      }
    } catch (err: any) {
      console.error(err);
      setError("Password or Email Incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        await user.updateProfile({ displayName: fullName });

        const newUser: User = {
          id: user.uid,
          name: fullName,
          email: email,
          role: selectedRole,
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

        await db.collection('users').doc(user.uid).set(newUser);
        await user.sendEmailVerification();
        await auth.signOut();
        onRequireVerification(email);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("User already exists. Sign in?");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      onLogin(); // App.tsx handles the upsert logic
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await auth.sendPasswordResetEmail(email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const toggleResetPassword = () => {
    setError(null);
    setResetEmailSent(false);
    setIsResettingPassword(!isResettingPassword);
    setIsRegistering(false);
  };

  const toggleRegister = () => {
    setError(null);
    setIsRegistering(!isRegistering);
    setIsResettingPassword(false);
    setResetEmailSent(false);
  };

  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 selection:bg-gov-blue selection:text-white grid-pattern">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Email Dispatched</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              We have sent you a password change link to <span className="font-black text-gov-blue">{email}</span>.
            </p>
          </div>
          <button 
            onClick={() => { setResetEmailSent(false); setIsResettingPassword(false); }}
            className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-gov-dark active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 selection:bg-gov-blue selection:text-white grid-pattern">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
        <div className="bg-gov-blue p-12 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-[1.75rem] mx-auto flex items-center justify-center text-gov-blue font-black text-4xl mb-8 shadow-2xl rotate-3">BW</div>
            <h1 className="text-3xl font-black tracking-tight">TSM <span className="opacity-70">Portal</span></h1>
            <p className="opacity-80 text-sm mt-3 font-medium uppercase tracking-[0.2em]">Secure Access Point</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        </div>
        
        <div className="p-10">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                {isResettingPassword ? 'Security Recovery' : isRegistering ? 'Personnel Registration' : 'Account Access'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">
                {isResettingPassword ? 'Credential Reset' : 'Identity Authentication'}
              </p>
            </div>
            <button onClick={onBack} className="p-3 text-slate-400 hover:text-gov-blue hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          </div>

          <form onSubmit={isResettingPassword ? handleResetPassword : isRegistering ? handleRegister : handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex justify-between items-center animate-in slide-in-from-top-2">
                <span>{error}</span>
                {error === "User already exists. Sign in?" && (
                  <button type="button" onClick={() => setIsRegistering(false)} className="underline ml-2">Sign in</button>
                )}
              </div>
            )}

            {isRegistering && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter your full name" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Professional Role</label>
                  <select 
                    required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm appearance-none"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  >
                    <option value={UserRole.TEACHER}>Teacher</option>
                    <option value={UserRole.SCHOOL_HEAD}>School Head</option>
                    <option value={UserRole.SUB_REGIONAL_OFFICER}>Sub-Regional Officer</option>
                    <option value={UserRole.REGIONAL_OFFICER}>Regional Officer</option>
                    <option value={UserRole.SUPER_ADMIN}>System Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Email Address</label>
              <input 
                required 
                type="email" 
                placeholder="email@gov.bw" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isResettingPassword && (
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  {!isRegistering && (
                    <button 
                      type="button" 
                      onClick={toggleResetPassword}
                      className="text-[9px] font-black text-gov-blue uppercase tracking-widest hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gov-blue"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Repeat Password</label>
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-transparent focus:border-gov-blue rounded-2xl outline-none font-bold text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-gov-dark active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isResettingPassword ? 'Get Reset Link' : isRegistering ? 'Establish Identity' : 'Secure Entry')}
              </button>

              {!isResettingPassword && !isRegistering && (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center space-x-3"
                  >
                    <img 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                      className="w-5 h-5" 
                      alt="Google Icon" 
                    />
                    <span>Continue with Google</span>
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={toggleRegister}
              className="text-xs font-black text-gov-blue uppercase tracking-widest hover:underline block w-full"
            >
              {isRegistering ? 'Already have an account? Sign in' : isResettingPassword ? '' : 'Establish new personnel account'}
            </button>
            
            {isResettingPassword && (
              <button 
                onClick={toggleResetPassword}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:underline block w-full"
              >
                Return to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
