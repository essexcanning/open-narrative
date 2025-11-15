
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { WelcomeModal } from './components/WelcomeModal';
import { AnalysisInput, Narrative } from './types';
import { mockFetchPosts } from './services/dataService';
import { detectAndClusterNarratives, enrichNarrative } from './services/geminiService';
import { LoadingSpinner } from './components/icons/GeneralIcons';

const App: React.FC = () => {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  const handleAnalysis = useCallback(async (inputs: AnalysisInput) => {
    setIsLoading(true);
    setError(null);
    setNarratives([]);

    try {
      setLoadingMessage('Fetching and analyzing source data...');
      const posts = mockFetchPosts(inputs);

      setLoadingMessage('Detecting and clustering narratives...');
      const initialNarratives = await detectAndClusterNarratives(posts, ` narratives about ${inputs.topic} in ${inputs.country}`);
      
      if (!initialNarratives || initialNarratives.length === 0) {
        throw new Error("No narratives were detected from the provided data.");
      }
      
      setNarratives(initialNarratives.map(n => ({ ...n, status: 'pending' })));

      setLoadingMessage('Enriching narratives with DMMI analysis and counter-opportunities...');

      const enrichedNarrativePromises = initialNarratives.map(narrative =>
        enrichNarrative(narrative, posts.filter(p => narrative.postIds.includes(p.id)))
          .then(enriched => {
            setNarratives(prev => prev.map(n => n.id === enriched.id ? { ...enriched, status: 'complete' } : n));
            return enriched;
          })
          .catch(err => {
            console.error(`Failed to enrich narrative ${narrative.id}:`, err);
            setNarratives(prev => prev.map(n => n.id === narrative.id ? { ...n, status: 'error' } : n));
            return null;
          })
      );
      
      await Promise.all(enrichedNarrativePromises);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);
  
  const handleWelcomeAcknowledge = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {showWelcome && <WelcomeModal onAcknowledge={handleWelcomeAcknowledge} />}
      <div className={`flex h-screen bg-gray-900 text-gray-100 font-sans ${showWelcome ? 'blur-sm' : ''}`}>
        <Sidebar onAnalyze={handleAnalysis} isLoading={isLoading} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">Narrative Sentinel</h1>
            <p className="text-gray-400 mt-1">Monitoring and countering information operations with AI.</p>
          </header>
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner className="h-16 w-16 text-cyan-500" />
              <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Analysis Failed: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}

          {!isLoading && !error && narratives.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-200">Welcome to the Dashboard</h2>
                    <p className="mt-2 text-gray-400">Use the sidebar to begin your analysis.</p>
                </div>
            </div>
          )}

          {!isLoading && narratives.length > 0 && (
            <Dashboard narratives={narratives} />
          )}
        </main>
      </div>
    </>
  );
};

export default App;
