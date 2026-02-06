
import React, { useState, useEffect, useRef } from 'react';
import { User, StudentFullProfile, RiskLevel, UserStatus, UserRole, AcademicData, AuditLog, UserFeedback } from '../types';
import { storageService } from '../services/storageService';
import { auditLogService } from '../services/auditLogService';
import RiskBadge from '../components/RiskBadge';
import DashboardCharts from '../components/DashboardCharts';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [profiles, setProfiles] = useState<StudentFullProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REGISTRATIONS' | 'STUDENTS' | 'FEEDBACK' | 'AUDIT'>('OVERVIEW');
  const [userSearch, setUserSearch] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentHistory, setStudentHistory] = useState<AcademicData[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    setProfiles(storageService.getStudentProfiles());
    setUsers(storageService.getUsers());
    setLogs(auditLogService.getLogs());
    setFeedback(storageService.getFeedback());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (targetUser: User, newStatus: UserStatus) => {
    storageService.updateUserStatus(targetUser.id, newStatus);
    auditLogService.logAction(user, `Registration ${newStatus}`, targetUser.id, targetUser.name);
    refreshData();
  };

  const handleViewHistory = (studentId: string) => {
    const studentUser = users.find(u => u.id === studentId);
    if (studentUser) {
      setSelectedStudent(studentUser);
      setStudentHistory(storageService.getStudentHistory(studentId));
    }
  };

  const filteredStudents = users.filter(u => u.role === UserRole.STUDENT && u.status !== UserStatus.PENDING).filter(u => {
    return u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
  });

  const pendingRegistrations = users.filter(u => u.role === UserRole.STUDENT && u.status === UserStatus.PENDING).filter(u => {
    return u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
  });

  const stats = {
    total: profiles.length,
    highRisk: profiles.filter(p => p.prediction?.riskLevel === RiskLevel.HIGH).length,
    pendingRegs: users.filter(u => u.status === UserStatus.PENDING).length
  };

  const tabs: Array<{ id: typeof activeTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'OVERVIEW', label: 'Overview', icon: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { id: 'STUDENTS', label: 'Registry', icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { id: 'REGISTRATIONS', label: 'Requests', icon: <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />, badge: stats.pendingRegs },
    { id: 'FEEDBACK', label: 'Feedback', icon: <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /> },
    { id: 'AUDIT', label: 'Audit', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ];

  return (
    <div className="flex flex-col min-h-full pb-20 overflow-x-hidden">
      <div className="sticky top-0 z-[45] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all overflow-hidden flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div 
            ref={tabContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-touch py-1 snap-x snap-mandatory"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all snap-start flex-shrink-0 border-2 ${
                  activeTab === tab.id 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{tab.icon}</svg>
                {tab.label}
                {tab.badge ? <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center font-bold ml-1">{tab.badge}</span> : null}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 xl:w-80 group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search registry..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none transition-all"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-10 space-y-10 animate-fade-up">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {[
                { label: 'Network Coverage', val: stats.total, sub: 'Active Student Nodes', icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
                { label: 'Security Risks', val: stats.highRisk, sub: 'Critical Alerts Raised', color: 'text-rose-600', icon: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
                { label: 'Access Control', val: stats.pendingRegs, sub: 'Pending Auth Requests', icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-7 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all hover:shadow-2xl">
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 truncate">{kpi.label}</p>
                    <h3 className={`text-3xl sm:text-5xl font-black tracking-tighter ${kpi.color || 'text-slate-900'}`}>{kpi.val}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 sm:mt-3 uppercase tracking-[0.2em] truncate">{kpi.sub}</p>
                  </div>
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] flex items-center justify-center flex-shrink-0 ${kpi.color ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{kpi.icon}</svg>
                  </div>
                </div>
              ))}
            </div>
            <DashboardCharts profiles={profiles} />
          </div>
        )}

        {(activeTab === 'STUDENTS' || activeTab === 'REGISTRATIONS') && (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 px-2">{activeTab} TERMINAL</h2>
            
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto scroll-touch no-scrollbar relative">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-8 py-6">Subject Identity</th>
                      <th className="px-8 py-6">Registry ID</th>
                      <th className="px-8 py-6">Performance Score</th>
                      <th className="px-8 py-6">Status / Risk</th>
                      <th className="px-8 py-6 text-right">Interaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeTab === 'STUDENTS' && filteredStudents.map(u => {
                      const profile = profiles.find(p => p.studentId === u.id);
                      const isHighRisk = profile?.prediction?.riskLevel === RiskLevel.HIGH;
                      return (
                        <tr key={u.id} className={`text-sm font-bold transition-colors ${isHighRisk ? 'bg-rose-50/50 hover:bg-rose-100/50' : 'text-slate-600 hover:bg-slate-50/50'}`}>
                          <td className="px-8 py-7 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isHighRisk ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>{u.name.charAt(0)}</div>
                            <div>
                              <div className={`font-black tracking-tight ${isHighRisk ? 'text-rose-700' : 'text-slate-900'}`}>{u.name}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{u.email}</div>
                            </div>
                          </td>
                          <td className="px-8 py-7 uppercase font-black text-indigo-600 text-xs tracking-tighter">{u.registerNo}</td>
                          <td className={`px-8 py-7 font-black text-lg ${isHighRisk ? 'text-rose-600' : ''}`}>{profile?.prediction?.performanceScore || '--'}</td>
                          <td className="px-8 py-7">
                            {profile?.prediction ? <RiskBadge level={profile.prediction.riskLevel} /> : <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] uppercase font-black tracking-widest text-slate-500">Unindexed</span>}
                          </td>
                          <td className="px-8 py-7 text-right">
                            <button onClick={() => handleViewHistory(u.id)} className={`w-10 h-10 rounded-xl border flex inline-flex items-center justify-center transition-all shadow-md ${isHighRisk ? 'border-rose-200 bg-white text-rose-600 hover:bg-rose-600 hover:text-white' : 'border-slate-200 hover:bg-slate-900 hover:text-white'}`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeTab === 'REGISTRATIONS' && pendingRegistrations.map(u => (
                      <tr key={u.id} className="text-sm font-bold text-slate-600 hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-7 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">{u.name.charAt(0)}</div>
                          <div>
                            <div className="text-slate-900 font-black tracking-tight">{u.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-8 py-7 uppercase font-black text-indigo-600 text-xs tracking-tighter">{u.registerNo}</td>
                        <td className="px-8 py-7">--</td>
                        <td className="px-8 py-7 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">{u.department}</td>
                        <td className="px-8 py-7 text-right flex justify-end gap-2">
                           <button onClick={() => handleStatusChange(u, UserStatus.APPROVED)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md">Grant</button>
                           <button onClick={() => handleStatusChange(u, UserStatus.REJECTED)} className="px-6 py-2.5 bg-white border border-rose-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">Deny</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
               {(activeTab === 'STUDENTS' ? filteredStudents : pendingRegistrations).map(u => {
                 const profile = profiles.find(p => p.studentId === u.id);
                 const isHighRisk = profile?.prediction?.riskLevel === RiskLevel.HIGH;
                 return (
                  <div key={u.id} className={`p-6 rounded-3xl border shadow-sm space-y-4 ${isHighRisk ? 'border-rose-200 bg-rose-50' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isHighRisk ? 'bg-rose-600 text-white animate-pulse' : (activeTab === 'STUDENTS' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white')}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className={`font-black truncate ${isHighRisk ? 'text-rose-700' : 'text-slate-900'}`}>{u.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{u.registerNo}</p>
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-4 py-4 border-y ${isHighRisk ? 'border-rose-100' : 'border-slate-50'}`}>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                        <p className={`font-black ${isHighRisk ? 'text-rose-600' : 'text-indigo-600'}`}>{profile?.prediction?.performanceScore || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Index</p>
                        {profile?.prediction ? <RiskBadge level={profile.prediction.riskLevel} /> : <span className="text-[10px] font-bold text-slate-300 uppercase">Void</span>}
                      </div>
                    </div>
                    <div className="pt-2">
                      {activeTab === 'STUDENTS' ? (
                        <button onClick={() => handleViewHistory(u.id)} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${isHighRisk ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>Inspect Registry Dossier</button>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleStatusChange(u, UserStatus.APPROVED)} className="py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Grant</button>
                          <button onClick={() => handleStatusChange(u, UserStatus.REJECTED)} className="py-3 bg-white border border-rose-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Deny
                        
                      
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                 );
               })}
            </div>

            {((activeTab === 'STUDENTS' && filteredStudents.length === 0) || (activeTab === 'REGISTRATIONS' && pendingRegistrations.length === 0)) && (
              <div className="py-24 text-center text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">Zero Master Records Found</div>
            )}
          </div>
        )}

        {activeTab === 'FEEDBACK' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {feedback.map(item => (
              <div key={item.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group flex flex-col">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-[22px] bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">{item.studentName.charAt(0)}</div>
                  <div className="overflow-hidden">
                    <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">{item.studentName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed flex-grow">"{item.message}"</p>
                <button onClick={() => handleViewHistory(item.studentId)} className="mt-8 text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-all">
                  Inspect Dossier <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Metrics Modal - Unshakable Alignment */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={() => setSelectedStudent(null)} />
          <div className="relative w-full max-w-6xl bg-white rounded-[40px] sm:rounded-[64px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-8 sm:p-12 border-b border-slate-100 flex items-center justify-between gap-6 bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-6 sm:gap-10 overflow-hidden">
                <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-[28px] sm:rounded-[44px] bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-3xl sm:text-5xl shadow-2xl flex-shrink-0">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none truncate">{selectedStudent.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 sm:mt-6">
                    <span className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 sm:px-4 py-1.5 rounded-xl border border-indigo-100 shadow-sm">{selectedStudent.registerNo}</span>
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{selectedStudent.department}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[22px] sm:rounded-[32px] border border-slate-200 bg-white transition-all shadow-xl hover:shadow-2xl flex-shrink-0"><svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-4 sm:p-12 overflow-y-auto overflow-x-hidden no-scrollbar flex-grow bg-white">
              <div className="border border-slate-200 rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-2xl shadow-slate-100/40">
                <div className="overflow-x-auto no-scrollbar scroll-touch">
                  <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-200 sticky top-0">
                      <tr><th className="px-10 py-7">Timeline</th><th className="px-10 py-7 text-center">Score</th><th className="px-10 py-7 text-center">Attendance %</th><th className="px-10 py-7">Risk</th><th className="px-10 py-7">AI Diagnostic Context</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentHistory.map(h => {
                        const p = storageService.getPredictionForData(h.id);
                        return (
                          <tr key={h.id} className="text-sm font-bold text-slate-600 hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-8 text-slate-900 font-black whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                            <td className="px-10 py-8 text-center font-black text-lg text-indigo-600">{p?.performanceScore || '--'}</td>
                            <td className="px-10 py-8 text-center tabular-nums text-lg font-black">{h.attendance}%</td>
                            <td className="px-10 py-8">{p ? <RiskBadge level={p.riskLevel} /> : '--'}</td>
                            <td className="px-10 py-8 max-w-sm italic text-slate-400 font-semibold leading-relaxed text-xs">"{p?.summary || 'Metric record unindexed'}"</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-8 sm:p-12 bg-slate-50 border-t border-slate-100 text-right flex-shrink-0">
              <button onClick={() => setSelectedStudent(null)} className="w-full sm:w-auto px-14 py-5 bg-slate-900 text-white rounded-[26px] text-xs font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Dismiss Dossier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
