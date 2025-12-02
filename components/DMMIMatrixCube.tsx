
import React from 'react';
import clsx from 'clsx';
import { InfoIcon } from './icons/GeneralIcons';

interface DMMIMatrixCubeProps {
    veracity: number;
    harm: number;
    probability: number;
    riskScore: number;
    classification: string;
}

const AxisBar: React.FC<{ label: string; value: number; colorClass: string; description: string; lowLabel: string; highLabel: string }> = ({ label, value, colorClass, description, lowLabel, highLabel }) => (
    <div className="mb-4 last:mb-0 w-full">
        <div className="flex justify-between items-end mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">{label}</span>
                <div className="group relative flex-shrink-0">
                    <InfoIcon className="h-3.5 w-3.5 text-text-secondary cursor-help opacity-60 hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-background-card border border-border rounded-md shadow-lg text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 break-words whitespace-normal">
                        {description}
                    </div>
                </div>
            </div>
            <span className="text-sm font-bold text-text-primary flex-shrink-0 font-mono">{value}/10</span>
        </div>
        <div className="h-2.5 w-full bg-background-secondary rounded-full overflow-hidden border border-border/50">
            <div 
                className={clsx("h-full transition-all duration-1000 ease-out rounded-full", colorClass)} 
                style={{ width: `${value * 10}%` }}
            />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-text-disabled uppercase tracking-wider font-medium">
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
        </div>
    </div>
);

const IsometricCube: React.FC<{ w: number; h: number; d: number; color: string }> = ({ w, h, d, color }) => {
    const scale = 10; 
    const minSize = 25; 

    const width = Math.max(minSize, w * scale);
    const height = Math.max(minSize, h * scale);
    const depth = Math.max(minSize, d * scale);

    const faceBase = "absolute border border-white/40 flex items-center justify-center transition-all duration-700 ease-out backface-hidden";
    const faceColor = clsx(color, "opacity-90 shadow-sm");

    return (
        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '800px' }}>
            <div 
                className="relative transition-transform duration-700 ease-out"
                style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(-25deg) rotateY(45deg)',
                    width: 0, 
                    height: 0 
                }}
            >
                {/* Front Face */}
                <div className={clsx(faceBase, faceColor)} style={{ width: `${width}px`, height: `${height}px`, transform: `translateX(-50%) translateY(-50%) translateZ(${depth / 2}px)` }}>
                    <span className="text-[9px] font-bold text-white/90 select-none tracking-wider uppercase">Front</span>
                </div>
                {/* Back Face */}
                <div className={clsx(faceBase, faceColor)} style={{ width: `${width}px`, height: `${height}px`, transform: `translateX(-50%) translateY(-50%) rotateY(180deg) translateZ(${depth / 2}px)` }} />
                {/* Right Face */}
                <div className={clsx(faceBase, faceColor, "brightness-75")} style={{ width: `${depth}px`, height: `${height}px`, transform: `translateX(-50%) translateY(-50%) rotateY(90deg) translateZ(${width / 2}px)` }} />
                {/* Left Face */}
                <div className={clsx(faceBase, faceColor, "brightness-75")} style={{ width: `${depth}px`, height: `${height}px`, transform: `translateX(-50%) translateY(-50%) rotateY(-90deg) translateZ(${width / 2}px)` }} />
                {/* Top Face */}
                <div className={clsx(faceBase, faceColor, "brightness-110")} style={{ width: `${width}px`, height: `${depth}px`, transform: `translateX(-50%) translateY(-50%) rotateX(90deg) translateZ(${height / 2}px)` }} />
                {/* Bottom Face */}
                <div className={clsx(faceBase, faceColor, "brightness-50")} style={{ width: `${width}px`, height: `${depth}px`, transform: `translateX(-50%) translateY(-50%) rotateX(-90deg) translateZ(${height / 2}px)` }} />
            </div>
        </div>
    );
};

export const DMMIMatrixCube: React.FC<DMMIMatrixCubeProps> = ({ veracity, harm, probability, riskScore, classification }) => {
    const cubeColor = riskScore >= 8 ? 'bg-critical' : riskScore >= 5 ? 'bg-warning' : 'bg-success';
    const veracityColor = 'bg-blue-500';
    const harmColor = harm < 4 ? 'bg-success' : harm < 7 ? 'bg-warning' : 'bg-critical';
    const probColor = probability < 4 ? 'bg-success' : probability < 7 ? 'bg-warning' : 'bg-critical';

    return (
        <div className="bg-background rounded-xl border border-border overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background-secondary/30">
                <div>
                    <h3 className="text-base font-bold text-text-primary">DMMI Matrix Cube</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide mt-0.5">Risk = Severity × Probability</p>
                </div>
                <div className={clsx(
                    "px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm",
                    riskScore >= 8 ? "bg-critical/10 text-critical border-critical/20" :
                    riskScore >= 5 ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-success/10 text-success border-success/20"
                )}>
                    Risk: {riskScore.toFixed(1)}
                </div>
            </div>

            <div className="p-5 flex flex-col gap-6">
                {/* Visualization Area */}
                <div className="w-full bg-background-secondary/50 rounded-lg border border-border/50 h-[220px] relative overflow-hidden flex items-center justify-center">
                    <IsometricCube w={veracity} h={harm} d={probability} color={cubeColor} />
                    
                    {/* Legend Overlay */}
                    <div className="absolute bottom-2 right-2 flex flex-col gap-1 text-[9px] font-mono text-text-secondary bg-background/90 p-2 rounded border border-border/50 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span>W: Veracity ({veracity})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={clsx("w-1.5 h-1.5 rounded-full", harm > 6 ? "bg-critical" : "bg-warning")}></div>
                            <span>H: Harm ({harm})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={clsx("w-1.5 h-1.5 rounded-full", probability > 6 ? "bg-critical" : "bg-warning")}></div>
                            <span>D: Prob ({probability})</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Area */}
                <div className="flex flex-col gap-1">
                    <AxisBar 
                        label="Veracity (Width)" 
                        value={veracity} 
                        colorClass={veracityColor}
                        description="Truthfulness: 0 (Total Lie) to 10 (Verified Fact)."
                        lowLabel="False"
                        highLabel="True"
                    />
                    <AxisBar 
                        label="Intention to Harm (Height)" 
                        value={harm} 
                        colorClass={harmColor}
                        description="Intent: 0 (Benign) to 10 (Severe/Existential Threat)."
                        lowLabel="Benign"
                        highLabel="Severe"
                    />
                    <AxisBar 
                        label="Probability (Depth)" 
                        value={probability} 
                        colorClass={probColor}
                        description="Likelihood: 0 (Unlikely) to 10 (Viral/Certain)."
                        lowLabel="Unlikely"
                        highLabel="Certain"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-background-secondary/30 border-t border-border flex justify-between items-center text-sm">
                <span className="text-text-secondary font-medium">Classification</span>
                <span className="font-bold text-text-primary">{classification}</span>
            </div>
        </div>
    );
};
