
import React from 'react';
import { SimulationResult } from '../types';
import { ShieldExclamationIcon, ShieldCheckIcon, AlertIcon } from './icons/GeneralIcons';
import clsx from 'clsx';

interface WargameSimulationProps {
    result: SimulationResult;
}

export const WargameSimulation: React.FC<WargameSimulationProps> = ({ result }) => {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-background-secondary/30 p-4 rounded-lg border border-border">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-2">Simulated Outcome</h3>
                <p className="text-lg font-medium text-text-primary">{result.finalOutcome}</p>
            </div>

            <div className="space-y-6">
                {result.turns.map((turn, i) => (
                    <div key={i} className="relative pl-8 border-l-2 border-border/50">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-text-secondary"></div>
                        
                        <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Round {turn.round}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Adversary Move */}
                            <div className="bg-critical/5 border border-critical/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2 text-critical">
                                    <ShieldExclamationIcon className="h-5 w-5" />
                                    <span className="font-bold text-sm">Adversary Reaction</span>
                                </div>
                                <p className="text-sm text-text-primary font-medium mb-2">{turn.adversaryReaction.action}</p>
                                <div className="text-xs text-text-secondary">
                                    <span className="font-semibold">Likely TTP Switch:</span> {turn.adversaryReaction.likelyTTP}
                                </div>
                            </div>

                            {/* Impact */}
                            <div className="bg-background-card border border-border rounded-lg p-4 flex flex-col justify-center">
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase">Public Perception</span>
                                    <p className="text-sm text-text-primary leading-tight mt-1">{turn.publicPerception}</p>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase">Projected Risk:</span>
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded text-xs font-bold",
                                        turn.projectedRiskChange > 0 ? "bg-critical/10 text-critical" : "bg-success/10 text-success"
                                    )}>
                                        {turn.projectedRiskChange > 0 ? '+' : ''}{turn.projectedRiskChange}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Strategic Adjustment Recommended</h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            {result.strategicAdjustment}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
