
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { storageService } from '../services/storageService';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [dept, setDept] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password strength logic for registration
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const reqs = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    setRequirements(reqs);

    let score = 0;
    if (reqs.length) score += 20;
    if (reqs.upper) score += 20;
    if (reqs.lower) score += 20;
    if (reqs.number) score += 20;
    if (reqs.special) score += 20;
    setStrength(score);
  }, [password]);

  const isPasswordValid = Object.values(requirements).every(Boolean) && password === confirmPassword;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = storageService.getUsers();
    
    // Normalize input
    const normalizedEmail = email.toLowerCase().trim();
    
    // Search for user
    const user = users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
    
    if (user) {
      // Role match check
      if (user.role !== selectedRole) {
        setError(`Access Restricted: This account belongs to the ${user.role === UserRole.ADMIN ? 'Faculty' : 'Student'} portal.`);
        return;
      }

      // Password verification
      if (user.password !== loginPassword) {
        setError('Incorrect security credential. Please verify your password.');
        return;
      }

      // Status check
      if (user.status === UserStatus.PENDING) {
        setError('Application Pending: Your account is currently awaiting administrative approval.');
      } else if (user.status === UserStatus.REJECTED) {
        setError('Access Denied: Your registration request has been declined.');
      } else {
        onLogin(user);
      }
    } else {
      setError('Identity not found. Please verify your email or register a new profile.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    const users = storageService.getUsers();
    if (users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim())) {
      setError('This email identity is already enrolled in the system.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: UserRole.STUDENT, // Registration is only for students
      status: UserStatus.PENDING,
      registerNo: regNo,
      department: dept,
      password: password,
      registrationDate: new Date().toISOString()
    };

    storageService.saveUser(newUser);
    
    storageService.addNotification({
      title: 'New Access Request',
      message: `${name} has applied for student credentials.`,
      type: 'REGISTRATION',
      linkTab: 'REGISTRATIONS'
    });

    setSuccess('Registration successful. Your account is now pending faculty approval.');
    setTimeout(() => {
        setIsRegistering(false);
        setSuccess('');
        resetForm();
    }, 3000);
  };

  const resetForm = () => {
    setEmail('');
    setLoginPassword('');
    setName('');
    setRegNo('');
    setDept('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Visual Branding Section (Left) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative p-16 flex-col justify-between overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase">EduPredict<span className="text-indigo-500">.AI</span></span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Data-Driven <br/><span className="text-indigo-400">Academic Intelligence.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            Analyze, predict, and intervene. Our AI models identify student academic risks with precision, allowing for proactive educational support.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div>
                <p className="text-3xl font-black text-white">98.4%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Prediction Accuracy</p>
            </div>
            <div>
                <p className="text-3xl font-black text-white">Real-time</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Behavioral Analytics</p>
            </div>
        </div>
      </div>

      {/* Form Interaction Section (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isRegistering ? 'Join the System' : 'Welcome to Portal'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isRegistering 
                ? 'Create your student profile to start monitoring performance.' 
                : 'Secure institutional access for authorized personnel.'}
            </p>
          </div>

          {/* Role Selection Toggle */}
          {!isRegistering && (
            <div className="p-1.5 bg-slate-200/50 rounded-2xl flex relative overflow-hidden">
                <div 
                    className="absolute h-[calc(100%-12px)] top-1.5 bg-white rounded-xl shadow-md transition-all duration-300 ease-out z-0"
                    style={{ 
                        width: 'calc(50% - 6px)', 
                        left: selectedRole === UserRole.STUDENT ? '6px' : 'calc(50%)' 
                    }}
                />
                <button 
                    onClick={() => { setSelectedRole(UserRole.STUDENT); setError(''); }}
                    className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${selectedRole === UserRole.STUDENT ? 'text-indigo-600' : 'text-slate-500'}`}
                >
                    Student
                </button>
                <button 
                    onClick={() => { setSelectedRole(UserRole.ADMIN); setError(''); }}
                    className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${selectedRole === UserRole.ADMIN ? 'text-indigo-600' : 'text-slate-500'}`}
                >
                    Faculty
                </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          {!isRegistering ? (
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input
                    type="email" required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium bg-white shadow-sm"
                    placeholder={selectedRole === UserRole.STUDENT ? "john@student.com" : "admin@faculty.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Password</label>
                  <input
                    type="password" required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium bg-white shadow-sm"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 transform active:scale-[0.98]"
                >
                  Authorize Access
                </button>
              </form>

              {/* Quick Info / Hints for Demo */}
              <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/40">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Demo Portal Access
                </p>
                {selectedRole === UserRole.ADMIN ? (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">Email: <span className="text-indigo-600">admin@faculty.com</span></p>
                    <p className="text-xs font-bold text-slate-700">Password: <span className="text-indigo-600">admin123</span></p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">Email: <span className="text-indigo-600">john@student.com</span></p>
                    <p className="text-xs font-bold text-slate-700">Password: <span className="text-indigo-600">student123</span></p>
                  </div>
                )}
              </div>

              {selectedRole === UserRole.STUDENT && (
                <div className="pt-2 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                    New to the system?{' '}
                    <button 
                        type="button"
                        onClick={() => { setIsRegistering(true); setError(''); }}
                        className="text-indigo-600 font-black hover:underline underline-offset-4"
                    >
                        Request Enrollment
                    </button>
                    </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar scroll-smooth">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input
                    type="text" required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm bg-white"
                    placeholder="e.g. Johnathan Smith"
                    /* Corrected: Use e.target.value instead of target.value */
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Email</label>
                  <input
                    type="email" required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm bg-white"
                    placeholder="student@university.edu"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reg ID</label>
                    <input
                        type="text" required
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm bg-white"
                        value={regNo} onChange={(e) => setRegNo(e.target.value)}
                    />
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept.</label>
                    <input
                        type="text" required
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm bg-white"
                        value={dept} onChange={(e) => setDept(e.target.value)}
                    />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Security Token</label>
                    <input
                        type="password" required
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm bg-white mb-3"
                        placeholder="Create Secure Password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    {/* Security Visualizer */}
                    <div className="p-3 bg-slate-100 rounded-xl space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Entropy Rating</span>
                            <span className={`text-[10px] font-black uppercase ${strength <= 40 ? 'text-rose-500' : strength <= 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {strength <= 40 ? 'Weak' : strength <= 80 ? 'Strong' : 'Exceptional'}
                            </span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className={`h-full transition-all duration-500 ${strength <= 40 ? 'bg-rose-500' : strength <= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${strength}%` }} />
                        </div>
                    </div>

                    <input
                        type="password" required
                        className={`w-full px-5 py-3.5 rounded-2xl border transition-all text-sm bg-white ${confirmPassword && password !== confirmPassword ? 'border-rose-300' : 'border-slate-200'}`}
                        placeholder="Confirm Token"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 mt-4"
              >
                Enroll Profile
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="w-full text-slate-400 py-2 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                Back to Authentication
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
