
import React, { useState, useEffect } from 'react';
import { Narrative, CounterOpportunity, SimulationResult } from '../types';
import { generateCounterActionPlan, runWargameSimulation } from '../services/geminiService';
import { XIcon, LoadingSpinner, BrainCircuitIcon, AlertIcon, FlameIcon, ClipboardIcon } from './icons/GeneralIcons';
import { PlanRenderer } from './PlanRenderer';
import { WargameSimulation } from './WargameSimulation';
import clsx from 'clsx';

interface CounterActionPlanModalProps {
    narrative: Narrative;
    counter: CounterOpportunity;
    onClose: () => void;
}

type ModalTab = 'plan' | 'wargame';

export const CounterActionPlanModal: React.FC<CounterActionPlanModalProps> = ({ narrative, counter, onClose }) => {
    const [activeTab, setActiveTab] = useState<ModalTab>('plan');
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const [isLoadingSim, setIsLoadingSim] = useState(false);
    
    const [plan, setPlan] = useState('');
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch Plan on mount
    useEffect(() => {
        const fetchPlan = async () => {
            setIsLoadingPlan(true);
            setError(null);
            try {
                const generatedPlan = await generateCounterActionPlan(narrative, counter);
                setPlan(generatedPlan);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoadingPlan(false);
            }
        };

        fetchPlan();
    }, [narrative, counter]);

    const handleRunSimulation = async () => {
        if (!plan) return;
        setActiveTab('wargame');
        if (simulation) return; // Already ran

        setIsLoadingSim(true);
        try {
            const result = await runWargameSimulation(narrative, counter, plan);
            setSimulation(result);
        } catch (err) {
            setError("Failed to run wargame simulation.");
        } finally {
            setIsLoadingSim(false);
        }
    };

    const renderPlan = () => {
        if (isLoadingPlan) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[20rem] text-center">
                    <BrainCircuitIcon className="h-10 w-10 text-primary animate-pulse" />
                    <p className="mt-4 text-lg font-semibold text-text-primary">Engaging Deep Thinking Mode...</p>
                    <p className="mt-1 text-text-secondary">Generating a detailed action plan.</p>
                </div>
            );
        }
        return <PlanRenderer text={plan} />;
    };

    const renderWargame = () => {
        if (isLoadingSim) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[20rem] text-center">
                    <FlameIcon className="h-10 w-10 text-critical animate-pulse" />
                    <p className="mt-4 text-lg font-semibold text-text-primary">Simulating Adversary Response...</p>
                    <p className="mt-1 text-text-secondary">The Red Team AI is analyzing your plan for weaknesses.</p>
                </div>
            );
        }
        if (simulation) {
            return <WargameSimulation result={simulation} />;
        }
        return null;
    };

    const renderContent = () => {
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center min-h-[20rem] text-center">
                    <AlertIcon className="h-8 w-8 text-critical" />
                    <p className="mt-4 font-semibold text-text-primary">Operation Failed</p>
                    <p className="mt-1 text-sm text-text-secondary">{error}</p>
                </div>
            );
        }
        return (
            <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 custom-scrollbar">
                 {activeTab === 'plan' ? renderPlan() : renderWargame()}
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div 
                className="bg-background-card rounded-2xl shadow-2xl max-w-3xl w-full border border-border transform transition-all animate-fade-in-up flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex items-start justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                            <BrainCircuitIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Strategic Response: {counter.tactic}</h2>
                            <p className="text-sm text-text-secondary">AI-Assisted Operational Planning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-background-hover">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border px-4">
                    <button 
                        onClick={() => setActiveTab('plan')}
                        className={clsx(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'plan' ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                        )}
                    >
                        Action Plan
                    </button>
                    <button 
                         onClick={handleRunSimulation}
                         disabled={isLoadingPlan || !plan}
                         className={clsx(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            activeTab === 'wargame' ? "border-critical text-critical" : "border-transparent text-text-secondary hover:text-critical",
                            (isLoadingPlan || !plan) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <FlameIcon className="h-4 w-4" />
                        Red Team Simulation
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-hidden">
                    {renderContent()}
                </div>
                
                <div className="flex-shrink-0 flex justify-end items-center gap-4 p-4 bg-background/50 border-t border-border rounded-b-xl">
                     <button
                        onClick={onClose}
                        className="text-sm font-medium px-4 py-2 rounded-md text-text-primary bg-background-hover hover:opacity-80"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
