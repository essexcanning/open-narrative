import React, { useEffect, useState } from 'react';
import { CheckIcon, InfoIcon, AlertIcon, XIcon } from './icons/GeneralIcons';
import clsx from 'clsx';

export interface ToastData {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
}

interface ToastProps {
    data: ToastData;
    onClose: () => void;
}

const toastConfig = {
    success: { icon: CheckIcon, bar: 'bg-success' },
    info: { icon: InfoIcon, bar: 'bg-primary' },
    warning: { icon: AlertIcon, bar: 'bg-warning' },
    error: { icon: AlertIcon, bar: 'bg-critical' },
};

export const Toast: React.FC<ToastProps> = ({ data, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 300); // Wait for exit animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const Icon = toastConfig[data.type].icon;

    return (
        <div className={clsx(
            "flex items-start w-full max-w-sm p-4 rounded-lg shadow-lg pointer-events-auto transition-all duration-300 ease-in-out bg-background-card border border-border",
            isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
        )}>
            <div className={clsx("w-1 self-stretch rounded-full mr-4", toastConfig[data.type].bar)}></div>
            <div className="flex-shrink-0 pt-0.5">
                <Icon className={clsx("h-5 w-5", toastConfig[data.type].bar.replace('bg-', 'text-'))} />
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-text-primary">{data.message}</p>
            </div>
            <button onClick={handleClose} className="ml-4 p-1 rounded-full text-text-secondary hover:bg-background-hover">
                <XIcon className="h-4 w-4" />
            </button>
        </div>
    );
};
