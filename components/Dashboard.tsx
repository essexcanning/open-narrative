
import React, { useState } from 'react';
import { Narrative } from '../types';
import { NarrativeCard } from './NarrativeCard';
import { SortAscendingIcon, SortDescendingIcon } from './icons/GeneralIcons';

interface DashboardProps {
  narratives: Narrative[];
}

type SortKey = 'riskScore' | 'title';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({ narratives }) => {
    const [sortKey, setSortKey] = useState<SortKey>('riskScore');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const sortedNarratives = [...narratives].sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        if (sortKey === 'riskScore') {
            aValue = a.riskScore || 0;
            bValue = b.riskScore || 0;
        } else {
            aValue = a.title || '';
            bValue = b.title || '';
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const SortIcon = sortDirection === 'asc' ? SortAscendingIcon : SortDescendingIcon;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200">{narratives.length} Narratives Detected</h3>
                <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-400">Sort by:</span>
                    <button
                        onClick={() => handleSort('riskScore')}
                        className={`flex items-center space-x-1 p-1 rounded ${sortKey === 'riskScore' ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
                    >
                        <span>Risk</span>
                        {sortKey === 'riskScore' && <SortIcon className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => handleSort('title')}
                        className={`flex items-center space-x-1 p-1 rounded ${sortKey === 'title' ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
                    >
                        <span>Title</span>
                        {sortKey === 'title' && <SortIcon className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedNarratives.map(narrative => (
                    <NarrativeCard key={narrative.id} narrative={narrative} />
                ))}
            </div>
        </div>
    );
};
