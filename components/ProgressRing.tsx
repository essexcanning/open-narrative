import React from 'react';
import { CheckIcon, AlertIcon, LoadingSpinner } from './icons/GeneralIcons';
import { Narrative } from '../types';
import clsx from 'clsx';

interface ProgressRingProps {
    status: Narrative['status'];
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ status }) => {
    const size = 32;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    const config = {
        pending: {
            icon: <LoadingSpinner className="h-5 w-5 text-primary" />,
            color: 'text-primary'
        },
        complete: {
            icon: <CheckIcon className="h-5 w-5 text-success" />,
            color: 'text-success'
        },
        error: {
            icon: <AlertIcon className="h-5 w-5 text-critical" />,
            color: 'text-critical'
        }
    };

    const { icon, color } = config[status];

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="absolute" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-border"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={clsx("transition-all duration-500", color)}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={status === 'complete' ? 0 : circumference}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            {icon}
        </div>
    );
};
