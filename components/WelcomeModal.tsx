
import React from 'react';

interface WelcomeModalProps {
    onAcknowledge: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onAcknowledge }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-8 border border-cyan-500/30 m-4">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Welcome to Narrative Sentinel</h2>
                <div className="text-gray-300 space-y-4">
                    <p>
                        This tool is designed for a critical and ethical purpose: to help defend democratic processes and information integrity.
                        It is intended for monitoring, analyzing, and countering harmful information operations like disinformation and foreign interference.
                    </p>
                    <p className="font-semibold text-yellow-300">
                        Ethical Use Mandate:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>
                            <span className="font-bold">Defensive Use Only:</span> This tool must <span className="underline">never</span> be used for offensive manipulation, censorship, or suppressing legitimate speech.
                        </li>
                        <li>
                            <span className="font-bold">Transparency and Proportionality:</span> Any proposed countermeasures should be transparent, proportionate to the threat, and aligned with democratic principles and human rights.
                        </li>
                        <li>
                            <span className="font-bold">Protect Privacy:</span> Analysis should focus on narratives and coordinated behavior, not on individuals' private data or beliefs.
                        </li>
                    </ul>
                    <p>
                        By proceeding, you acknowledge and agree to use Narrative Sentinel responsibly and exclusively for its intended defensive mission.
                    </p>
                </div>
                <div className="mt-8 text-right">
                    <button
                        onClick={onAcknowledge}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Acknowledge and Proceed
                    </button>
                </div>
            </div>
        </div>
    );
};
