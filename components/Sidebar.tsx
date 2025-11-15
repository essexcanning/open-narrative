
import React, { useState } from 'react';
import { AnalysisInput } from '../types';
import { COUNTRIES } from '../constants';
import { FilterIcon, GlobeIcon, SearchIcon, CalendarIcon, CheckIcon, LoadingSpinner } from './icons/GeneralIcons';

interface SidebarProps {
  onAnalyze: (inputs: AnalysisInput) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAnalyze, isLoading }) => {
  const [country, setCountry] = useState('Moldova');
  const [topic, setTopic] = useState('elections and Russian influence');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [sources, setSources] = useState({
    twitter: true,
    googleNews: true,
  });

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSources({ ...sources, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSources = Object.entries(sources)
      .filter(([, checked]) => checked)
      .map(([name]) => name === 'twitter' ? 'X/Twitter' : 'Google News');
    
    if (selectedSources.length === 0) {
      alert("Please select at least one data source.");
      return;
    }

    onAnalyze({
      country,
      topic,
      timeFrame: { start: startDate, end: endDate },
      sources: selectedSources,
    });
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-700/50 p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center mb-8">
        <FilterIcon className="h-6 w-6 text-cyan-400 mr-3" />
        <h2 className="text-xl font-bold text-white">Analysis Parameters</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <div className="space-y-6 flex-grow">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <GlobeIcon className="h-4 w-4 mr-2" /> Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <SearchIcon className="h-4 w-4 mr-2" /> Topic / Event
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'elections'"
              className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
               <CalendarIcon className="h-4 w-4 mr-2" /> Time Frame
            </label>
            <div className="flex space-x-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"/>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"/>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <CheckIcon className="h-4 w-4 mr-2" /> Data Sources
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input id="twitter" name="twitter" type="checkbox" checked={sources.twitter} onChange={handleSourceChange} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500" />
                <label htmlFor="twitter" className="ml-3 block text-sm text-gray-300">X / Twitter</label>
              </div>
              <div className="flex items-center">
                <input id="google-news" name="googleNews" type="checkbox" checked={sources.googleNews} onChange={handleSourceChange} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500" />
                <label htmlFor="google-news" className="ml-3 block text-sm text-gray-300">Google News / Search</label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner className="h-5 w-5 mr-2" />
                        Analyzing...
                    </>
                ) : 'Run Analysis'}
            </button>
        </div>
      </form>
    </aside>
  );
};
