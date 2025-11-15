import React, { useState } from 'react';
import { AnalysisInput, Theme } from '../types';
import { COUNTRIES } from '../constants';
import { FilterIcon, LoadingSpinner, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/GeneralIcons';
import { CustomSelect } from './forms/CustomSelect';
import { CustomInput } from './forms/CustomInput';
import { CustomDateInput } from './forms/CustomDateInput';
import { CustomCheckbox } from './forms/CustomCheckbox';
import clsx from 'clsx';

interface SidebarProps {
  onAnalyze: (inputs: AnalysisInput) => void;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAnalyze, isLoading, isOpen, setIsOpen }) => {
  const [country, setCountry] = useState('Moldova');
  const [topic, setTopic] = = useState('elections and Russian influence');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [sources, setSources] = useState({
    twitter: true,
    googleNews: true,
  });

  const handleSourceChange = (name: 'twitter' | 'googleNews') => {
    setSources(prev => ({ ...prev, [name]: !prev[name] }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSources = Object.entries(sources)
      .filter(([, checked]) => checked)
      .map(([name]) => {
        if (name === 'twitter') return 'X / Twitter';
        if (name === 'googleNews') return 'Google News / Search';
        return null;
      })
      .filter((name): name is "Google News / Search" | "X / Twitter" => name !== null);
    
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
    <aside className={clsx(
      "bg-background border-r border-border flex flex-col h-full transition-all duration-300 ease-in-out",
      isOpen ? "w-full md:w-80 lg:w-96 p-6" : "w-0 p-0 overflow-hidden"
    )}>
      <div className="flex items-center justify-between mb-8 min-w-[300px]">
        <div className="flex items-center">
            <FilterIcon className="h-6 w-6 text-text-secondary mr-3" />
            <h2 className="text-xl font-semibold text-text-primary">Analysis Parameters</h2>
        </div>
         <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-text-secondary hover:text-text-primary">
            <ChevronLeftIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-w-[300px]">
        <div className="space-y-6 flex-grow">
          <CustomSelect
            id="country"
            label="Country"
            value={country}
            onChange={setCountry}
            options={COUNTRIES.map(c => ({ value: c, label: c }))}
          />
          <CustomInput
            id="topic"
            label="Topic / Event"
            value={topic}
            onChange={setTopic}
            placeholder="e.g., 'elections'"
          />
          <div>
             <label className="block text-sm font-medium text-text-secondary mb-2">Time Frame</label>
            <div className="flex space-x-2">
                <CustomDateInput value={startDate} onChange={setStartDate} />
                <CustomDateInput value={endDate} onChange={setEndDate} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center">
              Data Sources
            </label>
            <div className="space-y-3">
              <CustomCheckbox id="twitter" label="X / Twitter" checked={sources.twitter} onChange={() => handleSourceChange('twitter')} />
              <CustomCheckbox id="googleNews" label="Google News / Search" checked={sources.googleNews} onChange={() => handleSourceChange('googleNews')} />
            </div>
          </div>
        </div>

        <div className="mt-8">
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-background-disabled disabled:text-text-disabled disabled:cursor-not-allowed transition-all"
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
