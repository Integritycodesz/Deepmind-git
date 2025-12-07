
import React from 'react';
import { Commit, CommitType } from '../types';
import { COLORS } from '../constants';

interface CommitListProps {
  commits: Commit[];
  selectedCommit: Commit | null;
  onSelect: (commit: Commit) => void;
}

export const CommitList: React.FC<CommitListProps> = ({ commits, selectedCommit, onSelect }) => {
  const getTypeColor = (type: CommitType) => {
    switch(type) {
      case CommitType.FEATURE: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case CommitType.BUGFIX: return 'text-red-400 bg-red-500/10 border-red-500/20';
      case CommitType.REFACTOR: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case CommitType.PERF: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case CommitType.SECURITY: return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-10">
        Commit History
      </h3>
      <div className="space-y-1 px-2 pb-20">
        {commits.map((commit) => (
          <div
            key={commit.hash}
            onClick={() => onSelect(commit)}
            className={`group p-3 rounded-lg cursor-pointer transition-all border ${
              selectedCommit?.hash === commit.hash
                ? 'bg-surface border-primary shadow-md'
                : 'hover:bg-surface border-transparent hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getTypeColor(commit.type)}`}>
                {commit.type}
              </span>
              <span className="text-slate-500 text-xs font-mono">{commit.shortHash}</span>
            </div>
            <p className={`text-sm font-medium mb-1 line-clamp-2 ${
               selectedCommit?.hash === commit.hash ? 'text-white' : 'text-slate-300 group-hover:text-white'
            }`}>
              {commit.message}
            </p>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{commit.author.split('<')[0]}</span>
              <span>{commit.date.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
