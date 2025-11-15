import React, { useState } from 'react';
import { ShieldCheckIcon } from './icons/GeneralIcons';

interface WelcomeModalProps {
    onAcknowledge: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onAcknowledge }) => {
    const [isAcknowledged, setIsAcknowledged] = useState(false);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <div className="bg-background-card rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-border transform transition-all animate-fade-in-up">
                <div className="text-center">
                    <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to OpenNarrative</h2>
                    <p className="text-text-secondary">A mission-critical tool for defending information integrity.</p>
                </div>
                <div className="text-left text-text-secondary space-y-4 mt-6 text-sm">
                    <p>
                        This tool is designed exclusively for defensive purposes: to help monitor, analyze, and counter harmful information operations like disinformation and foreign interference.
                    </p>
                    <p className="font-semibold text-warning">
                        Ethical Use Mandate:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong>Defensive Use Only:</strong> Never use this tool for offensive manipulation, censorship, or suppressing legitimate speech.
                        </li>
                        <li>
                            <strong>Transparency and Proportionality:</strong> Ensure any proposed countermeasures are transparent, proportionate, and aligned with democratic principles.
                        </li>
                        <li>
                            <strong>Protect Privacy:</strong> Focus on narratives and coordinated behavior, not individuals' private data.
                        </li>
                    </ul>
                </div>
                 <div className="mt-8">
                    <label htmlFor="acknowledge" className="flex items-center space-x-3 cursor-pointer">
                        <input
                            id="acknowledge"
                            name="acknowledge"
                            type="checkbox"
                            checked={isAcknowledged}
                            onChange={() => setIsAcknowledged(!isAcknowledged)}
                            className="h-5 w-5 rounded border-border bg-background-secondary text-primary focus:ring-primary focus:ring-offset-background-card"
                        />
                        <span className="text-sm font-medium text-text-primary">I understand and agree to use this tool responsibly and defensively.</span>
                    </label>
                </div>
                <div className="mt-6">
                    <button
                        onClick={onAcknowledge}
                        disabled={!isAcknowledged}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-background-disabled disabled:text-text-disabled disabled:cursor-not-allowed"
                    >
                        Enter
                    </button>
                </div>
            </div>
        </div>
    );
};