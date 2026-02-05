
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { StudentFullProfile, RiskLevel } from '../types';

interface ChartsProps {
  profiles: StudentFullProfile[];
}

const DashboardCharts: React.FC<ChartsProps> = ({ profiles }) => {
  const riskCounts = {
    [RiskLevel.LOW]: profiles.filter(p => p.prediction?.riskLevel === RiskLevel.LOW).length,
    [RiskLevel.MEDIUM]: profiles.filter(p => p.prediction?.riskLevel === RiskLevel.MEDIUM).length,
    [RiskLevel.HIGH]: profiles.filter(p => p.prediction?.riskLevel === RiskLevel.HIGH).length,
  };

  const pieData = [
    { name: 'Low Risk', value: riskCounts[RiskLevel.LOW], color: '#10b981' },
    { name: 'Medium Risk', value: riskCounts[RiskLevel.MEDIUM], color: '#f59e0b' },
    { name: 'High Risk', value: riskCounts[RiskLevel.HIGH], color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const barData = profiles.slice(-5).map(p => ({
    name: p.studentName.split(' ')[0],
    Attendance: p.attendance,
    Marks: p.internalMarks,
    Assignments: p.assignmentScore
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Risk Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Student Performance (%)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Marks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Assignments" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
