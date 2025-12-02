import React from 'react';

interface PlanRendererProps {
    text: string;
}

export const PlanRenderer: React.FC<PlanRendererProps> = ({ text }) => {
    const elements: React.ReactNode[] = [];
    if (!text) return null;

    const lines = text.split('\n');
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const endList = () => {
        if (inList) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 pl-4">
                    {listItems}
                </ul>
            );
            listItems = [];
            inList = false;
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            endList();
            elements.push(<h4 key={`h-${index}`} className="text-base font-semibold text-text-primary pt-4 first:pt-0 break-words">{trimmedLine.replace(/\*\*/g, '')}</h4>);
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || /^\d+\.\s/.test(trimmedLine)) {
            if (!inList) {
                inList = true;
            }
            const content = /^\d+\.\s/.test(trimmedLine) 
                ? trimmedLine.replace(/^\d+\.\s/, '') 
                : trimmedLine.substring(2);
                
            listItems.push(<li key={`li-${index}`} className="break-words whitespace-normal">{content}</li>);

        } else {
            endList();
            if (trimmedLine) {
                 elements.push(<p key={`p-${index}`} className="break-words whitespace-normal">{trimmedLine}</p>);
            }
        }
    });

    endList();

    return <div className="space-y-3 text-sm text-text-secondary leading-relaxed break-words">{elements}</div>;
};