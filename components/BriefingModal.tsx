import React, { useState, useEffect } from 'react';
import { Narrative } from '../types';
import { generateAllianceBrief } from '../services/geminiService';
import { XIcon, LoadingSpinner, MegaphoneIcon, ClipboardIcon, CheckIcon, AlertIcon } from './icons/GeneralIcons';
import clsx from 'clsx';

interface BriefingModalProps {
    narrative: Narrative;
    onClose: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({ narrative, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [brief, setBrief] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copyButtonText, setCopyButtonText] = useState('Copy');
    const [copyButtonIcon, setCopyButtonIcon] = useState(<ClipboardIcon className="h-4 w-4" />);

    useEffect(() => {
        const fetchBrief = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const generatedBrief = await generateAllianceBrief(narrative);
                setBrief(generatedBrief);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrief();
    }, [narrative]);

    const handleCopy = () => {
        navigator.clipboard.writeText(brief).then(() => {
            setCopyButtonText('Copied!');
            setCopyButtonIcon(<CheckIcon className="h-4 w-4 text-success" />);
            setTimeout(() => {
                setCopyButtonText('Copy');
                setCopyButtonIcon(<ClipboardIcon className="h-4 w-4" />);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyButtonText('Copy Failed');
            setTimeout(() => {
                 setCopyButtonText('Copy');
                 setCopyButtonIcon(<ClipboardIcon className="h-4 w-4" />);
            }, 2000);
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <LoadingSpinner className="h-8 w-8 text-primary" />
                    <p className="mt-4 text-text-secondary">Generating mission brief...</p>
                </div>
            );
        }
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertIcon className="h-8 w-8 text-critical" />
                    <p className="mt-4 font-semibold text-text-primary">Failed to Generate Brief</p>
                    <p className="mt-1 text-sm text-text-secondary">{error}</p>
                </div>
            )
        }
        return (
            <textarea
                readOnly
                value={brief}
                className="w-full h-80 bg-background-secondary border border-border rounded-md p-3 text-sm text-text-secondary font-mono focus:ring-primary focus:border-primary"
            />
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-background-card rounded-2xl shadow-2xl max-w-2xl w-full border border-border transform transition-all animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <MegaphoneIcon className="h-6 w-6 text-primary" />
                        <h2 className="text-lg font-semibold text-text-primary">Signal Alliance Mission Brief</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-background-hover">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="relative">
                        {renderContent()}
                        {!isLoading && !error && (
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 z-10 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md text-text-primary bg-background-card hover:bg-background-hover border border-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Copy to Clipboard"
                            >
                                {copyButtonIcon}
                                {copyButtonText}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex justify-end items-center gap-4 p-4 bg-background/50 border-t border-border rounded-b-xl">
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
