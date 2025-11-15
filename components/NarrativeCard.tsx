
import React, { useState } from 'react';
import { Narrative, DMMIReport, OriginReport, CounterOpportunity } from '../types';
import { ChevronDownIcon, ChevronUpIcon, LoadingSpinner } from './icons/GeneralIcons';

interface NarrativeCardProps {
  narrative: Narrative;
}

const getRiskColor = (score: number) => {
  if (score >= 8) return 'border-red-500 bg-red-900/20';
  if (score >= 5) return 'border-orange-500 bg-orange-900/20';
  return 'border-yellow-500 bg-yellow-900/20';
};

const getDMMIColor = (classification: DMMIReport['classification']) => {
    switch(classification) {
        case 'Disinformation': return 'text-red-400';
        case 'Misinformation': return 'text-orange-400';
        case 'Malinformation': return 'text-yellow-400';
        case 'Information': return 'text-green-400';
        default: return 'text-gray-400';
    }
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="font-semibold text-cyan-400 mb-2">{title}</h4>
        {children}
    </div>
);


export const NarrativeCard: React.FC<NarrativeCardProps> = ({ narrative }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`border-l-4 rounded-r-lg shadow-lg transition-all duration-300 ${getRiskColor(narrative.riskScore)} bg-gray-800/80`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-100 pr-4 flex-1">{narrative.title}</h3>
                    <div className="flex flex-col items-end">
                       <span className={`text-2xl font-black ${getRiskColor(narrative.riskScore).split(' ')[0].replace('border', 'text')}`}>{narrative.riskScore}</span>
                       <span className="text-xs text-gray-400">Risk Score</span>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{narrative.summary}</p>

                {narrative.status === 'pending' && (
                    <div className="flex items-center text-sm text-cyan-400 mt-4">
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Analyzing...
                    </div>
                )}
                
                {narrative.status === 'error' && (
                     <div className="mt-4 text-sm text-red-400">Analysis failed for this narrative.</div>
                )}


                {narrative.status === 'complete' && narrative.dmmiReport && (
                    <div className="mt-4 text-sm font-semibold">
                        <span className="text-gray-300">Classification: </span>
                        <span className={getDMMIColor(narrative.dmmiReport.classification)}>{narrative.dmmiReport.classification}</span>
                    </div>
                )}
            </div>

            {narrative.status === 'complete' && (
                <>
                    <div className={`px-5 pb-5 overflow-hidden transition-max-height duration-500 ease-in-out ${isExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                        {narrative.dmmiReport && (
                            <DetailSection title="DMMI Analysis">
                                <p className="text-sm text-gray-300">{narrative.dmmiReport.rationale}</p>
                                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                    <span><strong>Intent:</strong> {narrative.dmmiReport.intent}</span>
                                    <span><strong>Veracity:</strong> {narrative.dmmiReport.veracity}</span>
                                    <span><strong>Success Probability:</strong> {narrative.dmmiReport.successProbability}%</span>
                                </div>
                            </DetailSection>
                        )}
                        {narrative.originReport && (
                            <DetailSection title="Origin Attribution">
                                <p className="text-sm text-gray-300">
                                    <strong>Attribution:</strong> {narrative.originReport.attribution} ({narrative.originReport.confidence} confidence)
                                </p>
                                <p className="text-sm text-gray-400 mt-1">{narrative.originReport.evidence}</p>
                            </DetailSection>
                        )}
                        {narrative.counterOpportunities && (
                            <DetailSection title="Counter-Opportunities">
                                <div className="space-y-3">
                                {narrative.counterOpportunities.map((opp, index) => (
                                    <div key={index} className="text-sm bg-gray-900/50 p-3 rounded-md">
                                        <p className="font-semibold text-gray-200">{opp.strategy}: <span className="font-normal">{opp.title}</span></p>
                                        <p className="text-xs text-gray-400 mt-1">{opp.description}</p>
                                    </div>
                                ))}
                                </div>
                            </DetailSection>
                        )}
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full text-center py-2 bg-gray-700/50 hover:bg-gray-700 transition-colors text-xs font-medium text-gray-300 rounded-b-md flex items-center justify-center"
                    >
                        {isExpanded ? 'Show Less' : 'Show Details'}
                        {isExpanded ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />}
                    </button>
                 </>
            )}

        </div>
    );
};
