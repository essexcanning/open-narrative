import React, { useState } from 'react';
import { Narrative, Post } from '../types';
import { ShareIcon, DownloadIcon, LinkIcon } from './icons/GeneralIcons';
import { ProgressRing } from './ProgressRing';
import { Sparkline } from './Sparkline';
import clsx from 'clsx';

interface NarrativeCardProps {
  narrative: Narrative;
}

const getRiskConfig = (score: number, classification?: string) => {
    if (classification === 'Disinformation' || classification === 'Malinformation' || score >= 8) {
        return {
            dot: 'bg-critical',
            label: 'text-critical',
            border: 'border-critical/30',
            bg: 'bg-critical/5 dark:bg-critical/10',
            text: 'text-critical'
        };
    }
    if (classification === 'Misinformation' || score >= 5) {
        return {
            dot: 'bg-warning',
            label: 'text-warning',
            border: 'border-warning/30',
            bg: 'bg-warning/5 dark:bg-warning/10',
            text: 'text-warning'
        };
    }
    return {
        dot: 'bg-success',
        label: 'text-success',
        border: 'border-success/30',
        bg: 'bg-success/5 dark:bg-success/10',
        text: 'text-success'
    };
};

type Tab = 'DMMI Report' | 'Origin' | 'Counters' | 'Raw Posts';

export const NarrativeCard: React.FC<NarrativeCardProps> = ({ narrative }) => {
    const [activeTab, setActiveTab] = useState<Tab>('DMMI Report');
    const riskConfig = getRiskConfig(narrative.riskScore, narrative.dmmiReport?.classification);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'DMMI Report':
                return narrative.dmmiReport ? (
                     <div className="space-y-3 text-sm">
                        <p>{narrative.dmmiReport.rationale}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border">
                            <div><span className="font-semibold text-text-secondary">Intent:</span> {narrative.dmmiReport.intent}</div>
                            <div><span className="font-semibold text-text-secondary">Veracity:</span> {narrative.dmmiReport.veracity}</div>
                            <div className="col-span-2"><span className="font-semibold text-text-secondary">Success Probability:</span> {narrative.dmmiReport.successProbability}%</div>
                        </div>
                    </div>
                ) : null;
            case 'Origin':
                return narrative.originReport ? (
                    <div className="space-y-3 text-sm">
                        <p><span className="font-semibold text-text-secondary">Attribution:</span> {narrative.originReport.attribution} ({narrative.originReport.confidence} confidence)</p>
                        <p className="text-text-secondary">{narrative.originReport.evidence}</p>
                    </div>
                ) : null;
            case 'Counters':
                return narrative.counterOpportunities ? (
                    <div className="space-y-3">
                    {narrative.counterOpportunities.map((opp, i) => (
                        <div key={i} className="text-sm bg-background p-3 rounded-lg border border-border">
                            <p className="font-semibold text-text-primary">{opp.strategy}: <span className="font-normal">{opp.title}</span></p>
                            <p className="text-xs text-text-secondary mt-1">{opp.description}</p>
                        </div>
                    ))}
                    </div>
                ) : null;
             case 'Raw Posts':
                return narrative.posts && narrative.posts.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {narrative.posts.map((post: Post) => (
                            <div key={post.id} className="text-xs bg-background p-2 rounded border border-border">
                                <p className="text-text-secondary truncate"><span className="font-semibold text-text-primary">{post.author}</span> - {post.content}</p>
                                <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-1">
                                    <LinkIcon className="h-3 w-3" /> Source
                                </a>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-text-secondary">No raw post data available.</p>;
            default: return null;
        }
    }

    return (
        <div className={clsx("rounded-xl border bg-background-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col", riskConfig.border)}>
            <div className="p-5">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={clsx("h-2 w-2 rounded-full", riskConfig.dot)}></span>
                            <span className={clsx("text-xs font-semibold uppercase tracking-wider", riskConfig.label)}>
                                {narrative.dmmiReport?.classification || `Risk Level ${narrative.riskScore}`}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary">{narrative.title}</h3>
                    </div>
                     <ProgressRing status={narrative.status} />
                </div>
                <p className="text-sm text-text-secondary mt-2 h-10">{narrative.summary.substring(0, 120)}{narrative.summary.length > 120 ? '...' : ''}</p>
                 {narrative.trendData && (
                    <div className="mt-4 h-12">
                        <Sparkline data={narrative.trendData.map(d => d.volume)} />
                    </div>
                )}
            </div>
            
            {narrative.status === 'complete' && (
                <div className="border-t border-border mt-auto">
                    <div className="px-5 pt-4">
                        <div className="border-b border-border flex space-x-4">
                            {(['DMMI Report', 'Origin', 'Counters', 'Raw Posts'] as Tab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === tab 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-text-secondary hover:text-text-primary'
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 min-h-[150px]">
                        {renderTabContent()}
                    </div>
                    <div className="flex justify-end items-center gap-2 p-3 bg-background/50 border-t border-border rounded-b-xl">
                        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors"><ShareIcon className="h-4 w-4" /></button>
                        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors"><DownloadIcon className="h-4 w-4" /></button>
                    </div>
                </div>
            )}
        </div>
    );
};
