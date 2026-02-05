
import React, { useState, useEffect } from 'react';
import { User, AcademicData, PredictionResult, RiskLevel } from '../types';
import { storageService } from '../services/storageService';
import { predictAcademicRisk } from '../services/geminiService';
import RiskBadge from '../components/RiskBadge';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [attendance, setAttendance] = useState(85);
  const [internalMarks, setInternalMarks] = useState(70);
  const [assignmentScore, setAssignmentScore] = useState(75);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<AcademicData[]>([]);

  useEffect(() => {
    const studentProfiles = storageService.getStudentProfiles();
    const myProfile = studentProfiles.find(p => p.studentId === user.id);
    if (myProfile?.prediction) setPrediction(myProfile.prediction);
    setHistory(storageService.getStudentHistory(user.id));
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newData: AcademicData = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      studentName: user.name,
      attendance,
      internalMarks,
      assignmentScore,
      timestamp: new Date().toISOString(),
    };
    try {
      const result = await predictAcademicRisk(newData);
      storageService.saveAcademicData(newData);
      storageService.savePrediction(result, user.name);
      setPrediction(result);
      setHistory(storageService.getStudentHistory(user.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 max-w-[1600px] mx-auto space-y-8 sm:y-12 animate-fade-up pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="overflow-hidden">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none truncate">Academic Portal</h1>
          <p className="text-slate-500 text-sm sm:text-base mt-3 sm:mt-4 font-bold uppercase tracking-widest truncate">Student Node: {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistoryModal(true)} className="w-full md:w-auto px-6 sm:px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
            View Analytics History
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
        {/* Assessment Engine Form */}
        <div className="lg:col-span-4 bg-white rounded-[32px] sm:rounded-[48px] border border-slate-200 p-6 sm:p-10 shadow-sm lg:sticky lg:top-8 z-20">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Performance Sync</h3>
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {[
              { label: 'Attendance Rate', val: attendance, set: setAttendance, unit: '%' },
              { label: 'Exam Internal Score', val: internalMarks, set: setInternalMarks, unit: '/100' },
              { label: 'Assignment Precision', val: assignmentScore, set: setAssignmentScore, unit: '/100' },
            ].map((field, i) => (
              <div key={i} className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                  <span className="text-sm font-black text-slate-900 tabular-nums">{field.val}{field.unit}</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={field.val} 
                  onChange={(e) => field.set(parseInt(e.target.value))} 
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 outline-none" 
                />
              </div>
            ))}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl sm:rounded-[22px] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
            >
              {loading ? 'Analyzing Neural Nodes...' : 'Initiate AI Audit'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center">
               Score = (Attendance + Internal + Assignment) / 3
             </p>
          </div>
        </div>

        {/* Prediction Display Area */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
          {prediction ? (
            <div className="bg-white rounded-[32px] sm:rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]">
              <div className="p-8 sm:p-10 md:w-2/5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/20">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-6 sm:mb-8">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="44%" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50%" cy="50%" r="44%" fill="none" stroke={prediction.riskLevel === 'HIGH' ? '#ef4444' : prediction.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'} strokeWidth="10" strokeLinecap="round" strokeDasharray="300%" strokeDashoffset={`${300 * (1 - (prediction.performanceScore / 100))}%`} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{prediction.performanceScore}</span>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Perf. Index</span>
                  </div>
                </div>
                <RiskBadge level={prediction.riskLevel} />
              </div>
              <div className="p-8 sm:p-10 md:w-3/5 flex flex-col justify-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 sm:mb-4">Neural Narrative Output</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-6 sm:mb-8">"{prediction.summary}"</h4>
                <div className="space-y-3 sm:space-y-4">
                  {prediction.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 flex gap-4">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i+1}</div>
                      <span className="text-xs sm:text-sm font-bold text-slate-600 leading-snug">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-100/50 rounded-[32px] sm:rounded-[48px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 sm:p-12">
               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 sm:mb-10 text-slate-200 animate-pulse"><svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
               <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">AI Diagnostic Ready</h3>
               <p className="text-slate-400 text-[11px] sm:text-sm mt-3 sm:mt-4 font-bold uppercase tracking-widest max-w-sm">Awaiting diagnostic metrics from the sync panel.</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" onClick={() => setShowHistoryModal(false)} />
          <div className="relative w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Analytics History</h2>
              <button onClick={() => setShowHistoryModal(false)} className="w-10 h-10 sm:w-12 rounded-xl sm:rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-4 sm:p-10 overflow-y-auto no-scrollbar flex-grow bg-slate-50/20">
              {history.length > 0 ? (
                <div className="border border-slate-200 rounded-[24px] sm:rounded-[32px] overflow-hidden bg-white shadow-xl min-w-[600px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 sticky top-0">
                      <tr><th className="px-6 sm:px-8 py-5">Date</th><th className="px-6 sm:px-8 py-5 text-center">Score</th><th className="px-6 sm:px-8 py-5 text-center">Attendance</th><th className="px-6 sm:px-8 py-5">Risk Rating</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map(item => {
                        const p = storageService.getPredictionForData(item.id);
                        return (
                          <tr key={item.id} className="text-sm font-bold text-slate-600 hover:bg-slate-50">
                            <td className="px-6 sm:px-8 py-6 text-slate-900 font-black">{new Date(item.timestamp).toLocaleDateString()}</td>
                            <td className="px-6 sm:px-8 py-6 text-center font-black">{p?.performanceScore || '--'}</td>
                            <td className="px-6 sm:px-8 py-6 text-center">{item.attendance}%</td>
                            <td className="px-6 sm:px-8 py-6"><RiskBadge level={p?.riskLevel || RiskLevel.LOW} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <div className="py-20 sm:py-24 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No historical metrics found in registry</div>}
            </div>
            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 text-right flex-shrink-0">
              <button onClick={() => setShowHistoryModal(false)} className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Close Registry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
