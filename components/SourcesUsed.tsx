import React, { useState } from 'react';
import { SearchSource } from '../types';
import { ChevronDownIcon, LinkIcon } from './icons/GeneralIcons';
import clsx from 'clsx';

export const SourcesUsed: React.FC<{ sources: SearchSource[] }> = ({ sources }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (sources.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 bg-background rounded-lg border border-border">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-lg"
            >
                <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-text-primary">Sources Consulted ({sources.length})</h3>
                </div>
                <ChevronDownIcon className={clsx('h-5 w-5 text-text-secondary transition-transform', isExpanded && 'rotate-180')} />
            </button>
            <div className={clsx('overflow-hidden transition-all duration-300 ease-in-out', isExpanded ? 'max-h-96' : 'max-h-0')}>
                <div className="p-4 border-t border-border overflow-y-auto max-h-80">
                    <ul className="space-y-2">
                        {sources.map((source, index) => (
                            <li key={index} className="flex items-start">
                                <LinkIcon className="h-4 w-4 text-primary mt-1 mr-3 flex-shrink-0" />
                                <a
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-text-secondary hover:text-primary hover:underline break-all"
                                    title={source.uri}
                                >
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
