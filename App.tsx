import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { WelcomeModal } from './components/WelcomeModal';
import { AnalysisInput, Narrative, Post, SearchSource, Theme } from './types';
import { fetchRealtimePosts, detectAndClusterNarratives, enrichNarrative } from './services/geminiService';
import { fetchTwitterPosts } from './services/twitterService';
import { Header } from './components/Header';
import { Toast, ToastData } from './components/Toast';
import { generateId } from './utils/generateId';

const App: React.FC = () => {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<'fetching' | 'clustering' | 'enriching' | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    setToasts(currentToasts => [...currentToasts, { ...toast, id: generateId() }]);
  }, []);

  const handleAnalysis = useCallback(async (inputs: AnalysisInput) => {
    setIsLoading(true);
    setAnalysisPhase('fetching');
    setNarratives([]);
    setSources([]);
    addToast({ type: 'info', message: 'Starting analysis... Fetching real-time data.' });

    try {
      const dataPromises: Promise<{ posts: Post[], sources: SearchSource[] }>[] = [];

      if (inputs.sources.includes('Google News / Search')) {
        dataPromises.push(fetchRealtimePosts(inputs));
      }
      if (inputs.sources.includes('X / Twitter')) {
        dataPromises.push(fetchTwitterPosts(inputs));
      }

      const results = await Promise.allSettled(dataPromises);
      
      let combinedPosts: Post[] = [];
      let combinedSources: SearchSource[] = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          combinedPosts.push(...result.value.posts);
          combinedSources.push(...result.value.sources);
        } else {
          console.error(`Failed to fetch from a source:`, result.reason);
          addToast({ type: 'error', message: 'Failed to fetch data from a source.' });
        }
      });
      
      const uniqueSources = Array.from(new Map(combinedSources.map(s => [s.uri, s])).values());
      setSources(uniqueSources);

      if (combinedPosts.length === 0) {
        addToast({ type: 'warning', message: 'No relevant posts found for the given criteria.' });
        setNarratives([]);
      } else {
        setAnalysisPhase('clustering');
        addToast({ type: 'info', message: `Found ${combinedPosts.length} posts. Clustering narratives...` });
        const initialNarratives = await detectAndClusterNarratives(combinedPosts, `narratives about ${inputs.topic} in ${inputs.country}`);
        
        if (!initialNarratives || initialNarratives.length === 0) {
          addToast({ type: 'warning', message: 'Could not detect distinct narratives.' });
          setNarratives([]);
        } else {
          setNarratives(initialNarratives.map(n => ({ ...n, status: 'pending', posts: combinedPosts.filter(p => n.postIds.includes(p.id)) })));
          
          setAnalysisPhase('enriching');
          addToast({ type: 'info', message: `Detected ${initialNarratives.length} narratives. Starting deep analysis...` });

          const enrichmentPromises = initialNarratives.map(narrative => {
             const narrativePosts = combinedPosts.filter(p => narrative.postIds.includes(p.id));
             return enrichNarrative(narrative, narrativePosts)
              .then(enriched => {
                setNarratives(prev => prev.map(n => n.id === enriched.id ? { ...enriched, posts: narrativePosts, status: 'complete' } : n));
                return enriched;
              })
              .catch(err => {
                console.error(`Failed to enrich narrative ${narrative.id}:`, err);
                setNarratives(prev => prev.map(n => n.id === narrative.id ? { ...n, status: 'error' } : n));
                addToast({type: 'error', message: `Analysis failed for narrative: "${narrative.title.substring(0, 20)}..."`})
                return null;
              });
          });
          
          await Promise.all(enrichmentPromises);
          addToast({ type: 'success', message: 'Analysis complete.' });
        }
      }

    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      addToast({ type: 'error', message: `Analysis failed: ${errorMessage}` });
    } finally {
      setIsLoading(false);
      setAnalysisPhase(null);
    }
  }, [addToast]);
  
  const handleWelcomeAcknowledge = () => {
    setShowWelcome(false);
  };

  const removeToast = (id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  };

  return (
    <>
      <div className={`fixed inset-x-0 top-0 z-50 p-4 flex flex-col items-end space-y-2 pointer-events-none`}>
        {toasts.map(toast => (
          <Toast key={toast.id} data={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
      {showWelcome && <WelcomeModal onAcknowledge={handleWelcomeAcknowledge} />}
      <div className={`flex h-screen bg-background text-text-primary font-sans transition-all duration-300 ${showWelcome ? 'blur-md' : ''}`}>
        <Sidebar onAnalyze={handleAnalysis} isLoading={isLoading} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} theme={theme} setTheme={setTheme} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background-secondary">
            <Dashboard 
              narratives={narratives} 
              sources={sources} 
              isLoading={isLoading} 
              analysisPhase={analysisPhase}
            />
          </main>
        </div>
      </div>
    </>
  );
};

export default App;
