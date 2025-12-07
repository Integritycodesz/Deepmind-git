
import React, { useState, useEffect } from 'react';
import { Commit, CommitType } from '../types';
import { explainCommit } from '../services/geminiService';
import { BrainIcon } from '../constants';

interface CommitDetailProps {
  commit: Commit;
}

export const CommitDetail: React.FC<CommitDetailProps> = ({ commit }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentMode, setStudentMode] = useState(true);

  useEffect(() => {
    // Reset state when commit changes
    setExplanation(null);
  }, [commit]);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const result = await explainCommit(commit, studentMode);
      setExplanation(result);
    } catch (e) {
      setExplanation("Failed to generate explanation. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeClass = (type: CommitType) => {
      switch(type) {
          case CommitType.FEATURE: return 'bg-blue-600';
          case CommitType.BUGFIX: return 'bg-red-600';
          case CommitType.REFACTOR: return 'bg-amber-600';
          case CommitType.PERF: return 'bg-emerald-600';
          case CommitType.SECURITY: return 'bg-violet-600';
          default: return 'bg-slate-600';
      }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Commit Details</h2>
          <p className="text-slate-400 font-mono text-sm">Hash: {commit.hash}</p>
        </div>
        <div className="flex items-center gap-3 bg-surface p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setStudentMode(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              studentMode ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Mode
          </button>
          <button
            onClick={() => setStudentMode(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              !studentMode ? 'bg-secondary text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Expert Mode
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-700">
          <p className="text-lg font-medium text-white">{commit.message}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
             <span>👤 {commit.author}</span>
             <span>📅 {commit.date}</span>
             <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getTypeBadgeClass(commit.type)}`}>
                 {commit.type}
             </span>
          </div>
        </div>
        
        <div className="p-6 bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">AI Summary</h4>
            <p className="text-slate-300 italic mb-4">"{commit.summary}"</p>
            
            {commit.codeSmells && commit.codeSmells.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 font-bold uppercase mr-2 mt-1">Detected Smells:</span>
                {commit.codeSmells.map(smell => (
                  <span key={smell} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {smell}
                  </span>
                ))}
              </div>
            )}
        </div>
      </div>

      {!explanation && !loading && (
        <div className="flex justify-center my-12">
          <button
            onClick={handleExplain}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-105"
          >
            <BrainIcon className="w-5 h-5" />
            Explain the "Why"
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center my-12 text-slate-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Analyzing code evolution...</p>
        </div>
      )}

      {explanation && (
        <div className="bg-gradient-to-br from-surface to-slate-900 rounded-xl border border-primary/30 p-1 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary"></div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BrainIcon className="text-primary w-6 h-6" />
              AI Explanation
            </h3>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
              {explanation.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mock Diff View */}
      <div className="mt-8">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">Simulated Diff</h3>
        <div className="bg-[#0d1117] rounded-lg border border-slate-800 font-mono text-sm overflow-x-auto p-4 text-slate-400">
           <div className="text-emerald-500">+ function newFeature() &#123;</div>
           <div className="text-emerald-500 pl-4">+   // Added Logic for {commit.type}</div>
           <div className="text-emerald-500 pl-4">+   return true;</div>
           <div className="text-emerald-500">+ &#125;</div>
           <div className="text-red-500 mt-2">- const oldBuggyCode = () =&gt; &#123; crash() &#125;;</div>
        </div>
      </div>
    </div>
  );
};
