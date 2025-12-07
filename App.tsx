
import React, { useState } from 'react';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { CommitList } from './components/CommitList';
import { CommitDetail } from './components/CommitDetail';
import { ChatInterface } from './components/ChatInterface';
import { analyzeGitLog } from './services/geminiService';
import { AnalysisResult, AppView, Commit } from './types';
import { BrainIcon, BarChartIcon, GitBranchIcon, GitCommitIcon, MessageSquareIcon } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [repoData, setRepoData] = useState<AnalysisResult | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleAnalyze = async (log: string, repoUrl: string, description: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeGitLog(log, repoUrl, description);
      setRepoData(result);
      setView(AppView.DASHBOARD);
    } catch (error) {
      alert("Analysis failed. Please make sure the API Key is set in your environment.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommitSelect = (commit: Commit) => {
    setSelectedCommit(commit);
    setView(AppView.COMMIT_DETAIL);
  };

  if (view === AppView.LANDING) {
    return <Landing onAnalyze={handleAnalyze} isLoading={isAnalyzing} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-16 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-20">
        <div className="mb-8 p-2 bg-primary/20 rounded-lg">
          <BrainIcon className="w-6 h-6 text-primary" />
        </div>
        
        <nav className="flex-1 space-y-4 w-full flex flex-col items-center">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className={`p-3 rounded-xl transition-all ${view === AppView.DASHBOARD ? 'bg-surface text-white' : 'text-slate-500 hover:text-slate-300'}`}
            title="Dashboard"
          >
            <BarChartIcon className="w-6 h-6" />
          </button>
          
          <div className="w-8 h-[1px] bg-slate-800 my-2" />
          
          <button 
             className={`p-3 rounded-xl transition-all ${view === AppView.COMMIT_DETAIL ? 'bg-surface text-white' : 'text-slate-500 hover:text-slate-300'}`}
             onClick={() => {
                if(repoData && repoData.commits.length > 0) handleCommitSelect(repoData.commits[0]);
             }}
             title="Commits"
          >
            <GitBranchIcon className="w-6 h-6" />
          </button>
        </nav>

        <button 
          onClick={() => setShowChat(!showChat)}
          className={`mt-auto p-3 rounded-xl transition-all ${showChat ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-500 hover:text-accent'}`}
          title="Chat AI"
        >
          <MessageSquareIcon className="w-6 h-6" />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Secondary Sidebar (Commit List) - Always visible unless mobile */}
        <div className="w-80 bg-background border-r border-slate-800 hidden md:block">
          {repoData && (
            <CommitList 
              commits={repoData.commits} 
              selectedCommit={selectedCommit}
              onSelect={handleCommitSelect}
            />
          )}
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto bg-background relative">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex justify-between items-center">
             <h1 className="text-xl font-bold text-white flex items-center gap-2">
               {view === AppView.DASHBOARD ? 'Dashboard' : 'Commit Analysis'}
             </h1>
             {repoData && <span className="text-sm text-slate-500">{repoData.repoName}</span>}
          </header>

          <div className="min-h-full">
            {view === AppView.DASHBOARD && repoData && (
              <Dashboard data={repoData} />
            )}
            
            {view === AppView.COMMIT_DETAIL && selectedCommit && (
              <CommitDetail commit={selectedCommit} />
            )}
          </div>

          {showChat && repoData && (
            <ChatInterface repoContext={repoData} onClose={() => setShowChat(false)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
