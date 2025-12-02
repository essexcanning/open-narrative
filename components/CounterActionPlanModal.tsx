import React, { useState, useEffect } from 'react';
import { Narrative, CounterOpportunity } from '../types';
import { generateCounterActionPlan } from '../services/geminiService';
import { XIcon, LoadingSpinner, BrainCircuitIcon, AlertIcon } from './icons/GeneralIcons';
import { PlanRenderer } from './PlanRenderer';

interface CounterActionPlanModalProps {
    narrative: Narrative;
    counter: CounterOpportunity;
    onClose: () => void;
}

export const CounterActionPlanModal: React.FC<CounterActionPlanModalProps> = ({ narrative, counter, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [plan, setPlan] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const generatedPlan = await generateCounterActionPlan(narrative, counter);
                setPlan(generatedPlan);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlan();
    }, [narrative, counter]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[30rem] text-center">
                    <BrainCircuitIcon className="h-10 w-10 text-primary animate-pulse" />
                    <p className="mt-4 text-lg font-semibold text-text-primary">Engaging Deep Thinking Mode...</p>
                    <p className="mt-1 text-text-secondary">Generating a detailed action plan. This may take a moment.</p>
                </div>
            );
        }
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center min-h-[30rem] text-center">
                    <AlertIcon className="h-8 w-8 text-critical" />
                    <p className="mt-4 font-semibold text-text-primary">Failed to Generate Plan</p>
                    <p className="mt-1 text-sm text-text-secondary">{error}</p>
                </div>
            );
        }
        return (
            <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                 <PlanRenderer text={plan} />
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div 
                className="bg-background-card rounded-2xl shadow-2xl max-w-3xl w-full border border-border transform transition-all animate-fade-in-up flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex items-start justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                            <BrainCircuitIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Action Plan: {counter.tactic}</h2>
                            <p className="text-sm text-text-secondary">Generated with Deep Thinking Mode</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-background-hover">
                        <XIcon className="h-5 w-5" />
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