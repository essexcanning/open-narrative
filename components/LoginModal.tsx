import React from 'react';
import { User } from '../types';
import { ShieldCheckIcon } from './icons/GeneralIcons';

interface LoginModalProps {
    users: User[];
    onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLogin }) => {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 dark">
            <div className="bg-background-card rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border transform transition-all animate-fade-in-up">
                <div className="text-center">
                    <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-primary mb-2">OpenNarrative</h2>
                    <p className="text-text-secondary">Select a profile to begin your session.</p>
                </div>
                <div className="mt-8 space-y-3">
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => onLogin(user)}
                            className="w-full flex items-center space-x-4 p-4 rounded-lg bg-background-secondary hover:bg-background-hover border border-border hover:border-primary/50 transition-all duration-200"
                        >
                            <div className="w-10 h-10 rounded-full bg-background-hover border border-border flex items-center justify-center text-sm font-semibold text-text-secondary">
                                {user.initials}
                            </div>
                            <span className="font-semibold text-text-primary">{user.name}</span>
                        </button>
                    ))}
                </div>
                 <p className="text-center text-xs text-text-disabled mt-8">
                    This is a simulated login for demonstration purposes.
                </p>
            </div>
        </div>
    );
};