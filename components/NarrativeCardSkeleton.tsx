import React from 'react';

export const NarrativeCardSkeleton: React.FC = () => {
    return (
        <div className="rounded-xl border border-border bg-background-card shadow-sm p-5 animate-pulse">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="h-3 w-2/5 bg-background-hover rounded-full mb-3"></div>
                    <div className="h-5 w-4/5 bg-background-hover rounded-full"></div>
                </div>
                <div className="h-8 w-8 bg-background-hover rounded-full"></div>
            </div>
            <div className="mt-3 h-4 w-full bg-background-hover rounded-full"></div>
            <div className="mt-1 h-4 w-3/4 bg-background-hover rounded-full"></div>
            <div className="mt-4 h-12 w-full bg-background-hover rounded-lg"></div>
        </div>
    );
};
