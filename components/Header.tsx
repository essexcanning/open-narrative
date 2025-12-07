
import React, { useState, useEffect, useRef } from 'react';
import { Theme, User } from '../types';
import { SunIcon, MoonIcon, MenuIcon, ChevronLeftIcon, LogoutIcon } from './icons/GeneralIcons';
import clsx from 'clsx';

interface HeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    currentUser: User | null;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen, theme, setTheme, currentUser, onLogout }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60); // Update every minute
        
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="flex-shrink-0 bg-background-secondary border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="p-2 rounded-md text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors"
                    aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isSidebarOpen ? <ChevronLeftIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                    OpenNarrative
                </h1>
                <span className="hidden sm:inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    Hackathon Build
                </span>
            </div>
            <div className="flex items-center gap-4">
                 <span className="text-sm text-text-secondary hidden md:inline">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-8 h-8 rounded-full bg-background-hover border border-border flex items-center justify-center text-sm font-semibold text-text-secondary hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden"
                    >
                        {currentUser?.photoUrl ? (
                            <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                            currentUser?.initials || '??'
                        )}
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-background-card rounded-md shadow-lg border border-border z-10 animate-fade-in-up" style={{animationDuration: '0.2s'}}>
                            <div className="p-3 border-b border-border">
                                <p className="text-sm font-semibold text-text-primary truncate">{currentUser?.name}</p>
                                <p className="text-xs text-text-secondary truncate">{currentUser?.email}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-background-hover hover:text-text-primary rounded-md transition-colors">
                                    <LogoutIcon className="h-5 w-5"/>
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};