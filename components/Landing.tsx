
import React, { useState } from 'react';
import { BrainIcon, GitBranchIcon } from '../constants';
import { DEMO_GIT_LOG } from '../types';
import { fetchGithubData } from '../services/githubService';

interface LandingProps {
  onAnalyze: (log: string, repoUrl: string, description: string) => void;
  isLoading: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onAnalyze, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleDemo = () => {
    setInputText(DEMO_GIT_LOG.trim());
    setRepoUrl('https://github.com/example/demo-project');
    setDescription('A NestJS backend service for managing user authentication and analytics dashboards.');
    setFetchError(null);
  };

  const handleFetchGithub = async () => {
    if (!repoUrl) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await fetchGithubData(repoUrl);
      setInputText(data.log);
      if (data.description) {
        setDescription(data.description);
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch from GitHub");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <div className="mb-6 p-4 bg-primary/20 rounded-full animate-pulse">
        <BrainIcon className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
        AI Git Tutor
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mb-8">
        Don't just read git logs. Understand the story behind the code.
        Paste your <code>git log</code> or enter a GitHub URL to let AI explain how it evolved.
      </p>

      <div className="w-full max-w-3xl bg-surface rounded-xl shadow-2xl border border-slate-700 overflow-hidden p-6 text-left">
        
        {/* Repo URL Section */}
        <div className="mb-4">
          <label className="block text-slate-400 text-sm font-medium mb-2">
            Repository URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-background text-slate-300 text-sm p-3 rounded-lg border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchGithub()}
            />
            <button
              onClick={handleFetchGithub}
              disabled={isFetching || !repoUrl}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isFetching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GitBranchIcon className="w-4 h-4" />
              )}
              Load
            </button>
          </div>
          {fetchError && (
            <p className="text-red-400 text-xs mt-2">{fetchError}</p>
          )}
        </div>

        {/* Description Section */}
        <div className="mb-4">
          <label className="block text-slate-400 text-sm font-medium mb-2">
            What does this project do? (Optional)
          </label>
          <textarea
            className="w-full h-20 bg-background text-slate-300 text-sm p-3 rounded-lg border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="e.g. A React Native app for tracking daily water intake with push notifications..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Git Log Section */}
        <div className="mb-4">
          <label className="block text-slate-400 text-sm font-medium mb-2 flex justify-between">
            <span>Git Log Output</span>
            <span className="text-xs text-slate-500 font-normal">Run: git log --stat -n 50</span>
          </label>
          <textarea
            className="w-full h-48 bg-background text-slate-300 font-mono text-xs p-4 rounded-lg border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder={`commit a1b2c3d...
Author: ...
Date: ...
Message: ...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={handleDemo}
            className="text-sm text-slate-400 hover:text-white underline decoration-dotted"
          >
            Load Demo Data
          </button>
          
          <button
            onClick={() => onAnalyze(inputText, repoUrl, description)}
            disabled={!inputText || isLoading}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${
              !inputText || isLoading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-primary hover:bg-blue-600 text-white shadow-lg hover:shadow-primary/50'
            }`}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Repository'}
          </button>
        </div>
      </div>
    </div>
  );
};
