
import React, { useState, useRef } from 'react';
import { Narrative, CounterOpportunity } from '../types';
import { ArrowLeftIcon, LinkIcon, MegaphoneIcon, UserPlusIcon, LoadingSpinner, DownloadIcon, TagIcon, BrainCircuitIcon, ChatIcon } from './icons/GeneralIcons';
import { BriefingModal } from './BriefingModal';
import { CounterActionPlanModal } from './CounterActionPlanModal';
import { AnalystCopilot } from './AnalystCopilot';
import { Sparkline } from './Sparkline';
import { DMMIMatrixCube } from './DMMIMatrixCube';
import clsx from 'clsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NarrativeDetailProps {
    narrative: Narrative;
    onBack: () => void;
    onAssignToTaskforce: (narrative: Narrative) => Promise<void>;
    onAssignToCampaign: (narrativeId: string, campaignName: string) => void;
}

const getRiskConfig = (score: number, classification?: string) => {
    if (classification === 'Disinformation' || classification === 'Malinformation' || score >= 8) {
        return { dot: 'bg-critical', label: 'text-critical', bg: 'bg-critical/10 border-critical/20' };
    }
    if (classification === 'Misinformation' || score >= 5) {
        return { dot: 'bg-warning', label: 'text-warning', bg: 'bg-warning/10 border-warning/20' };
    }
    return { dot: 'bg-success', label: 'text-success', bg: 'bg-success/10 border-success/20' };
};

const DetailCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-background-card rounded-xl border border-border overflow-hidden flex flex-col h-full shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-background-secondary/20">
            <h3 className="text-base font-bold text-text-primary truncate">{title}</h3>
        </div>
        <div className="p-5 flex-grow min-w-0">{children}</div>
    </div>
);

export const NarrativeDetail: React.FC<NarrativeDetailProps> = ({ narrative, onBack, onAssignToTaskforce, onAssignToCampaign }) => {
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
    const [selectedCounter, setSelectedCounter] = useState<CounterOpportunity | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showCopilot, setShowCopilot] = useState(false);
    const riskConfig = getRiskConfig(narrative.riskScore, narrative.dmmiReport?.classification);
    const exportRef = useRef<HTMLDivElement>(null);

    const handleAssign = async () => {
        setIsAssigning(true);
        try {
            await onAssignToTaskforce(narrative);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleAssignCampaign = () => {
        const campaignName = window.prompt("Enter a name for the campaign:", narrative.campaign || "");
        if (campaignName && campaignName.trim() !== "") {
            onAssignToCampaign(narrative.id, campaignName.trim());
        }
    };

    const handleExportPdf = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        try {
            const element = exportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb',
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            const fileName = `${narrative.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}-report.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error("Failed to export PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
        {isBriefingModalOpen && <BriefingModal narrative={narrative} onClose={() => setIsBriefingModalOpen(false)} />}
        {selectedCounter && (
            <CounterActionPlanModal 
                narrative={narrative}
                counter={selectedCounter}
                onClose={() => setSelectedCounter(null)}
            />
        )}
        {showCopilot && (
            <AnalystCopilot 
                narrative={narrative} 
                onClose={() => setShowCopilot(false)} 
            />
        )}

        <div ref={exportRef} className="w-full max-w-7xl mx-auto pb-12">
            <div className="animate-fade-in-up space-y-8">
                
                {/* Navigation & Header */}
                <div className="space-y-4">
                    <button onClick={onBack} className="group flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight break-words">{narrative.title}</h1>
                            {narrative.campaign && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background-hover text-text-secondary text-sm border border-border max-w-full">
                                    <TagIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium truncate">{narrative.campaign}</span>
                                </div>
                            )}
                        </div>
                        <div className={clsx("flex items-center gap-2 flex-shrink-0 self-start px-4 py-2 rounded-full border shadow-sm", riskConfig.bg, riskConfig.label)}>
                            <span className={clsx("h-2.5 w-2.5 rounded-full flex-shrink-0", riskConfig.dot)}></span>
                            <span className="font-bold text-sm whitespace-nowrap">{narrative.dmmiReport?.classification || `Risk Level ${narrative.riskScore}`}</span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Analysis (Takes 2/3 width) */}
                    <div className="lg:col-span-2 space-y-8 min-w-0">
                        
                        <DetailCard title="Narrative Summary">
                            <p className="text-text-secondary leading-relaxed text-base whitespace-pre-wrap break-words">
                                {narrative.summary}
                            </p>
                        </DetailCard>

                        {/* Stacked Risk Analysis Cards */}
                        {narrative.dmmiReport && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    DMMI Risk Analysis
                                    <div className="h-px flex-grow bg-border"></div>
                                </h3>
                                <DMMIMatrixCube 
                                    veracity={narrative.dmmiReport.veracityScore || 0}
                                    harm={narrative.dmmiReport.harmScore || 0}
                                    probability={narrative.dmmiReport.probabilityScore || 0}
                                    riskScore={narrative.dmmiReport.matrixRiskScore || narrative.riskScore}
                                    classification={narrative.dmmiReport.classification}
                                />
                                <div className="bg-background-secondary/30 p-5 rounded-xl border border-border">
                                    <h4 className="text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Analyst Rationale</h4>
                                    <p className="text-sm text-text-secondary leading-relaxed break-words">{narrative.dmmiReport.rationale}</p>
                                </div>
                            </div>
                        )}

                        {narrative.disarmAnalysis && (
                            <DetailCard title="DISARM Framework Analysis">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-background-secondary/30 border border-border">
                                            <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Phase</span>
                                            <span className="text-lg font-bold text-text-primary">{narrative.disarmAnalysis.phase}</span>
                                        </div>
                                        <div className="p-4 rounded-lg bg-background-secondary/30 border border-border">
                                            <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Confidence</span>
                                            <span className={clsx(
                                                "text-lg font-bold",
                                                narrative.disarmAnalysis.confidence === 'High' ? 'text-success' : 
                                                narrative.disarmAnalysis.confidence === 'Medium' ? 'text-warning' : 'text-text-secondary'
                                            )}>{narrative.disarmAnalysis.confidence}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Tactics & Techniques</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {narrative.disarmAnalysis.tactics.map((t, i) => (
                                                <span key={`tac-${i}`} className="bg-primary/5 text-primary text-sm font-medium px-3 py-1.5 rounded-md border border-primary/10 break-words whitespace-normal shadow-sm">
                                                    {t}
                                                </span>
                                            ))}
                                            {narrative.disarmAnalysis.techniques.map((t, i) => (
                                                <span key={`tech-${i}`} className="bg-background text-text-secondary text-sm font-medium px-3 py-1.5 rounded-md border border-border break-words whitespace-normal">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </DetailCard>
                        )}

                        {narrative.posts && narrative.posts.length > 0 && (
                            <DetailCard title={`Associated Posts (${narrative.posts.length})`}>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {narrative.posts.map((post) => (
                                        <div key={post.id} className="p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <span className="font-semibold text-text-primary text-sm">{post.author}</span>
                                                <span className="text-xs text-text-disabled whitespace-nowrap">{post.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-text-secondary leading-relaxed break-words whitespace-pre-wrap">{post.content}</p>
                                            <div className="mt-3 pt-3 border-t border-border/50">
                                                <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                                    <LinkIcon className="h-3 w-3" /> View Source
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DetailCard>
                        )}
                    </div>

                    {/* Right Column: Actions & Copilot (Takes 1/3 width) */}
                    <div className="space-y-6 min-w-0">
                        
                        {/* Interactive Copilot CTA */}
                        <div className="rounded-xl bg-gradient-to-b from-primary to-primary-hover p-[1px] shadow-lg">
                            <div className="bg-background-card rounded-[11px] p-5 h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <BrainCircuitIcon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-text-primary">Copilot</h3>
                                </div>
                                <p className="text-sm text-text-secondary mb-5 leading-relaxed">
                                    Use the AI to dig deeper into this narrative, find logical fallacies, or draft counter-messaging.
                                </p>
                                <button 
                                    onClick={() => setShowCopilot(true)}
                                    className="w-full flex items-center justify-center gap-2 font-semibold text-sm px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary-hover transition-all shadow-md"
                                >
                                    <ChatIcon className="h-4 w-4" />
                                    Launch Investigation
                                </button>
                            </div>
                        </div>

                        {/* Trend Analysis */}
                        {narrative.trendData && (
                            <DetailCard title="14-Day Trend">
                                <div className="h-32 w-full pt-2">
                                    <Sparkline data={narrative.trendData.map(d => d.volume)} />
                                </div>
                            </DetailCard>
                        )}

                        {/* Counter Opportunities */}
                        {narrative.counterOpportunities && (
                            <DetailCard title="Counter-Opportunities">
                                <div className="space-y-3">
                                    {narrative.counterOpportunities.map((opp, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setSelectedCounter(opp)}
                                            className="w-full text-left p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-background-hover transition-all group shadow-sm"
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                <span className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors break-words">{opp.tactic}</span>
                                                <BrainCircuitIcon className="h-4 w-4 text-text-disabled group-hover:text-primary flex-shrink-0 mt-0.5"/>
                                            </div>
                                            <p className="text-xs text-text-secondary leading-relaxed break-words">{opp.rationale}</p>
                                        </button>
                                    ))}
                                </div>
                            </DetailCard>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-background-card rounded-xl border border-border p-5 shadow-sm">
                            <h3 className="font-bold text-base text-text-primary mb-4">Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleAssignCampaign}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-background hover:bg-background-hover text-text-primary border border-border transition-colors"
                                >
                                    <TagIcon className="h-4 w-4" /> Assign to Campaign
                                </button>
                                <button 
                                    onClick={() => setIsBriefingModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-background hover:bg-background-hover text-text-primary border border-border transition-colors"
                                >
                                    <MegaphoneIcon className="h-4 w-4" /> Brief Alliance
                                </button>
                                <button 
                                    onClick={handleAssign}
                                    disabled={isAssigning}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-background hover:bg-background-hover text-text-primary border border-border transition-colors disabled:opacity-50"
                                >
                                    {isAssigning ? <LoadingSpinner className="h-4 w-4" /> : <UserPlusIcon className="h-4 w-4" />}
                                    {isAssigning ? 'Assigning...' : 'Assign to Taskforce'}
                                </button>
                                <button 
                                    onClick={handleExportPdf}
                                    disabled={isExporting}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-background hover:bg-background-hover text-text-primary border border-border transition-colors disabled:opacity-50"
                                >
                                    {isExporting ? <LoadingSpinner className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
                                    {isExporting ? 'Exporting...' : 'Export as PDF'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        </>
    );
};
