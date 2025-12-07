
import React from 'react';
import { AnalysisResult, CommitType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { COLORS, GitBranchIcon } from '../constants';

interface DashboardProps {
  data: AnalysisResult;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Process data for Pie Chart (Type Distribution)
  const typeCount = data.commits.reduce((acc, commit) => {
    acc[commit.type] = (acc[commit.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(typeCount).map(type => ({
    name: type,
    value: typeCount[type]
  }));

  // Process data for Bar Chart (Impact over Time - simplified)
  const impactData = data.commits.slice().reverse().map(c => ({
    name: c.shortHash,
    impact: c.impactScore,
    type: c.type
  }));

  const getCellColor = (type: string) => {
    switch(type as CommitType) {
      case CommitType.FEATURE: return COLORS.feature;
      case CommitType.BUGFIX: return COLORS.bugfix;
      case CommitType.REFACTOR: return COLORS.refactor;
      case CommitType.PERF: return COLORS.perf;
      case CommitType.SECURITY: return COLORS.security;
      default: return COLORS.chore;
    }
  };

  return (
    <div className="p-6 animate-fade-in space-y-8">
      
      {/* Header & Repo Identity */}
      <div className="bg-gradient-to-r from-surface to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{data.repoName}</h2>
              {data.repoUrl && (
                <a href={data.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded">
                  View on GitHub
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-secondary/20 text-secondary text-xs font-bold px-2 py-1 rounded-full border border-secondary/30">
                  {data.projectType}
                </span>
                <span className="text-slate-400 text-sm italic border-l border-slate-600 pl-3">
                  {data.whatItIs}
                </span>
            </div>
          </div>
          <div className="hidden md:block bg-slate-800 p-3 rounded-full">
            <GitBranchIcon className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What does this repo do?</h4>
          <p className="text-slate-200 leading-relaxed">
            {data.whatItDoes}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Commit Types */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Development Focus</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCellColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCellColor(entry.name)}} />
                <span className="text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Impact Velocity */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Change Velocity & Impact</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: '#334155', opacity: 0.2}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="impact" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">Recent commits ranked by AI-perceived impact score (1-10)</p>
        </div>
      </div>
      
      {/* Overview */}
      <div className="bg-surface p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2">History Overview</h3>
        <p className="text-slate-400">{data.overview}</p>
      </div>

    </div>
  );
};
