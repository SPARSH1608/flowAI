"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
    Type, Palette, Camera, Cpu, Terminal, ChevronDown,
    CheckCircle2, Circle, Loader2, Eye, Sparkles, Layers,
    Image as ImageIcon, Zap
} from "lucide-react";

interface Props {
    data: any;
    logs?: string[];
    onChange: (newData: any) => void;
}


function parseSSELogs(logs: string[]) {
    const parsed: Record<string, any> = {};
    const rawLogs: string[] = [];

    for (const log of logs) {
        const match = log.match(/^\[SSE:(\w+)\]\s*(.*)/s);
        if (match) {
            const [, type, payload] = match;
            try {
                parsed[type!] = JSON.parse(payload!);
            } catch {
                parsed[type!] = payload;
            }
        } else {
            rawLogs.push(log);
        }
    }

    return { parsed, rawLogs };
}


function getPipelineSteps(logs: string[]) {
    const steps = [
        { id: "vision", label: "Vision Analysis", icon: Eye, color: "text-cyan-500", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
        { id: "intent", label: "Extracting Ad Intent", icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "visual", label: "Visual Planning", icon: Camera, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "creative", label: "Ad Creative Design", icon: Layers, color: "text-pink-500", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
        { id: "compile", label: "Compiling Prompt", icon: Terminal, color: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "generate", label: "Generating Image", icon: ImageIcon, color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    ];

    const sseMap: Record<string, string> = {
        vision_analysis: "vision",
        intent: "intent",
        visual_plan: "visual",
        ad_creative: "creative",
        final_prompt: "compile",
        generation_complete: "generate",
    };

    const completedSteps = new Set<string>();
    let activeStep: string | null = null;

    for (const log of logs) {
        const match = log.match(/^\[SSE:(\w+)\]/);
        if (match && sseMap[match[1]!]) {
            completedSteps.add(sseMap[match[1]!]!);
        }
        if (log.includes("generation_start")) activeStep = "generate";
        
        if (log.includes("Node complete") || log.includes("Execution complete") || log.includes("Generated")) {
            completedSteps.add("generate");
        }
    }

    
    if (!activeStep) {
        for (const step of steps) {
            if (!completedSteps.has(step.id)) {
                if (logs.length > 0) activeStep = step.id;
                break;
            }
        }
    }
    if (completedSteps.has("generate")) activeStep = null;

    return steps.map(s => ({
        ...s,
        completed: completedSteps.has(s.id),
        active: s.id === activeStep,
    }));
}

export default function ImageGenerationDetailsView({ data, logs = [], onChange }: Props) {
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showRawLogs, setShowRawLogs] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        if (logs.length > 0) {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const { parsed: sseData, rawLogs } = useMemo(() => parseSSELogs(logs), [logs]);
    const pipelineSteps = useMemo(() => getPipelineSteps(logs), [logs]);

    if (!data) return null;

    const debugInfo = data.debugInfo || {};
    const intent = sseData.intent || debugInfo.intent || data.intent || {};
    const visualPlan = sseData.visual_plan || debugInfo.visualPlan || data.visualPlan || {};
    const visionAnalysis = sseData.vision_analysis || debugInfo.referenceImageAnalysis || {};
    const adCreative = sseData.ad_creative || debugInfo.adCreativePlan || {};
    const finalPrompt = sseData.final_prompt || debugInfo.finalPrompt || data.finalPrompt || "";
    const generationInfo = sseData.generation_start || {};
    const config = debugInfo.usedConfig || data.config || data.usedConfig || {};

    const updateIntent = (key: string, val: any) => {
        onChange({ ...data, intent: { ...intent, [key]: val } });
    };

    const updateVisualPlan = (key: string, val: any) => {
        const newPlan = { ...visualPlan, [key]: val };
        onChange({ ...data, visualPlan: newPlan });
    };

    const updateConfig = (key: string, val: any) => {
        const newConfig = { ...config, [key]: val };
        onChange({ ...data, usedConfig: newConfig, config: newConfig });
    };

    const updateFinalPrompt = (val: string) => {
        onChange({ ...data, finalPrompt: val });
    };

    const hasExecuted = Object.keys(intent).length > 0 || Object.keys(visualPlan).length > 0 || finalPrompt;

    
    const hasFinishedBackend = !!(data.debugInfo?.finalPrompt || Object.keys(data.debugInfo || {}).length > 2);

    const isProcessing = logs.length > 0 && !hasFinishedBackend && !pipelineSteps.every(s => s.completed || (!s.active));
    const allDone = hasFinishedBackend || pipelineSteps.filter(s => s.completed).length === pipelineSteps.length;

    
    const SetupView = (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-orange-500" />
                    <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Generation Config</h3>
                </div>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Model</label>
                    <select
                        value={config.model || "fal-ai/flux-realism"}
                        onChange={(e) => updateConfig("model", e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    >
                        <option value="fal-ai/flux-realism">Flux Realism (Ads Optimised)</option>
                        <option value="fal-ai/flux-pro/v1.1">Flux Pro 1.1 (High Speed)</option>
                        <option value="fal-ai/flux/dev">Flux Dev</option>
                        <option value="nano-banana-pro">Nano Banana Pro</option>
                        <option value="custom">Custom Fal Model...</option>
                    </select>
                </div>
                {config.model === "custom" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Custom Model Name</label>
                        <input
                            type="text"
                            value={config.customModel || ""}
                            onChange={(e) => updateConfig("customModel", e.target.value)}
                            placeholder="e.g. fal-ai/auraflow"
                            className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                        />
                    </div>
                )}
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Base Prompt</label>
                    <textarea
                        value={config.prompt || ""}
                        onChange={(e) => updateConfig("prompt", e.target.value)}
                        className="w-full h-24 bg-white border border-neutral-200 rounded-lg p-3 text-sm text-neutral-700 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none custom-scrollbar leading-relaxed"
                        placeholder="Describe what you want to generate..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Width</label>
                        <input type="number" value={config.width || 1024} onChange={(e) => updateConfig("width", parseInt(e.target.value))}
                            className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-sm text-neutral-700 focus:outline-none focus:border-orange-500/50" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Height</label>
                        <input type="number" value={config.height || 768} onChange={(e) => updateConfig("height", parseInt(e.target.value))}
                            className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-sm text-neutral-700 focus:outline-none focus:border-orange-500/50" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold">Identity Strength</label>
                        <span className="text-[10px] text-orange-500 font-mono bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">{config.strength || 0.5}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={config.strength ?? 0.5}
                        onChange={(e) => updateConfig("strength", parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                </div>
            </div>
        </div>
    );

    
    const TimelineView = logs.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-indigo-500" />
                    <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Processing Pipeline</h3>
                    {!allDone && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Processing
                        </span>
                    )}
                    {allDone && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-semibold uppercase tracking-wider">
                            <CheckCircle2 size={10} />
                            Complete
                        </span>
                    )}
                </div>
                <button onClick={() => setShowRawLogs(!showRawLogs)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded border border-transparent hover:border-neutral-200 transition-colors">
                    {showRawLogs ? "Hide Logs" : "Raw Logs"}
                </button>
            </div>

            <div className="p-4">
                {!showRawLogs ? (
                    <div className="flex flex-col gap-0 relative">
                        <div className="absolute left-[11px] top-4 bottom-4 w-px bg-neutral-100" />
                        {pipelineSteps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.id} className={`relative flex gap-3 py-2 px-2 rounded-lg transition-all duration-300 ${step.active ? step.bgColor + " border " + step.borderColor : ""}`}>
                                    <div className="flex-none flex items-center justify-center w-6 h-6 bg-white z-10 rounded-full">
                                        {step.completed ? (
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        ) : step.active ? (
                                            <Loader2 size={14} className={step.color + " animate-spin"} />
                                        ) : (
                                            <Circle size={14} className="text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon size={12} className={step.completed ? "text-neutral-500" : step.active ? step.color : "text-neutral-300"} />
                                        <span className={`text-xs font-medium ${step.active ? "text-neutral-800" : step.completed ? "text-neutral-600" : "text-neutral-400"}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 max-h-48 overflow-y-auto custom-scrollbar">
                        {logs.map((log, idx) => (
                            <div key={idx} className="font-mono text-[10px] text-neutral-600 leading-relaxed truncate hover:whitespace-normal py-0.5">
                                <span className="text-neutral-400 mr-2">{'>'}</span>{log.substring(0, 200)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    
    const VisionCard = Object.keys(visionAnalysis).length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-cyan-50/30">
                <Eye size={14} className="text-cyan-500" />
                <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Vision Analysis</h3>
                <span className="ml-auto text-[9px] text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 font-semibold uppercase">{visionAnalysis.type || "unknown"}</span>
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">Description</label>
                    <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">{visionAnalysis.description || "N/A"}</p>
                </div>
                {visionAnalysis.brandDetails && (
                    <div className="grid grid-cols-2 gap-3">
                        {visionAnalysis.brandDetails.brandName && (
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">Brand</label>
                                <p className="text-xs text-neutral-700 font-medium">{visionAnalysis.brandDetails.brandName}</p>
                            </div>
                        )}
                        {visionAnalysis.brandDetails.colors && (
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">Colors</label>
                                <div className="flex gap-1.5">
                                    {visionAnalysis.brandDetails.colors.map((c: string, i: number) => (
                                        <span key={i} className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {visionAnalysis.personDetails && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">Appearance</label>
                            <p className="text-xs text-neutral-700">{visionAnalysis.personDetails.appearance}</p>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">Expression</label>
                            <p className="text-xs text-neutral-700">{visionAnalysis.personDetails.expression}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    
    const IntentCard = Object.keys(intent).length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-blue-50/30">
                <Sparkles size={14} className="text-blue-500" />
                <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Ad Intent</h3>
                {intent.adType && <span className="ml-auto text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold uppercase">{intent.adType}</span>}
            </div>
            <div className="p-4 space-y-4">
                {}
                <div className="grid grid-cols-1 gap-3">
                    <EditableField label="Subject" value={intent.subject} onChange={(v) => updateIntent("subject", v)} />
                    <EditableField label="Scenario" value={intent.scenario} onChange={(v) => updateIntent("scenario", v)} />
                </div>

                {}
                <div className="grid grid-cols-3 gap-3">
                    <EditableField label="Mood" value={intent.mood} onChange={(v) => updateIntent("mood", v)} />
                    <EditableField label="Brand Tone" value={intent.brandTone} onChange={(v) => updateIntent("brandTone", v)} />
                    <EditableField label="Art Style" value={intent.artStyle} onChange={(v) => updateIntent("artStyle", v)} />
                </div>

                {}
                <div className="grid grid-cols-3 gap-3">
                    <EditableField label="Audience" value={intent.audience} onChange={(v) => updateIntent("audience", v)} />
                    <EditableField label="Lighting" value={intent.lighting} onChange={(v) => updateIntent("lighting", v)} />
                    <EditableField label="Composition" value={intent.composition} onChange={(v) => updateIntent("composition", v)} />
                </div>

                {}
                <div className="border-t border-neutral-100 pt-3 space-y-3">
                    <EditableField label="Headline" value={intent.headline} onChange={(v) => updateIntent("headline", v)} highlight />
                    <EditableField label="Primary Text" value={intent.primaryText} onChange={(v) => updateIntent("primaryText", v)} multiline />
                    <EditableField label="Call to Action" value={intent.ctaText} onChange={(v) => updateIntent("ctaText", v)} highlight />
                </div>

                {}
                {intent.designElements && intent.designElements.length > 0 && (
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-2 block">Design Elements</label>
                        <div className="flex flex-wrap gap-1.5">
                            {intent.designElements.map((el: string, i: number) => (
                                <span key={i} className="text-[10px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-medium">{el}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    
    const VisualPlanCard = Object.keys(visualPlan).length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-purple-50/30">
                <Camera size={14} className="text-purple-500" />
                <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Visual Plan</h3>
                {visualPlan.realismLevel && <span className="ml-auto text-[9px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-semibold uppercase">{visualPlan.realismLevel}</span>}
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
                <EditableField label="Camera Angle" value={visualPlan.camera} onChange={(v) => updateVisualPlan("camera", v)} />
                <EditableField label="Framing" value={visualPlan.framing} onChange={(v) => updateVisualPlan("framing", v)} />
                <EditableField label="Lighting" value={visualPlan.lighting} onChange={(v) => updateVisualPlan("lighting", v)} />
                <EditableField label="Environment" value={visualPlan.environment} onChange={(v) => updateVisualPlan("environment", v)} />
            </div>
        </div>
    );

    
    const AdCreativeCard = Object.keys(adCreative).length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-pink-50/30">
                <Layers size={14} className="text-pink-500" />
                <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Ad Creative Plan</h3>
            </div>
            <div className="p-4 space-y-3">
                {adCreative.layout && (
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">Layout</label>
                        <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">{adCreative.layout}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    {adCreative.headline && <ReadOnlyField label="Headline" value={adCreative.headline} />}
                    {adCreative.tagline && <ReadOnlyField label="Tagline" value={adCreative.tagline} />}
                    {adCreative.ctaText && <ReadOnlyField label="CTA" value={adCreative.ctaText} />}
                    {adCreative.heroElement && <ReadOnlyField label="Hero Element" value={adCreative.heroElement} />}
                </div>
                {adCreative.typographyStyle && <ReadOnlyField label="Typography" value={adCreative.typographyStyle} />}
                {adCreative.colorPalette && adCreative.colorPalette.length > 0 && (
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-2 block">Color Palette</label>
                        <div className="flex gap-2">
                            {adCreative.colorPalette.map((color: string, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200">
                                    <div className="w-4 h-4 rounded-full border border-neutral-300" style={{ backgroundColor: color }} />
                                    <span className="text-[10px] text-neutral-600 font-mono">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    
    const FinalPromptCard = finalPrompt && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button onClick={() => setShowPrompt(!showPrompt)}
                className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-500" />
                    <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Final Compiled Prompt</h3>
                    <span className="text-[9px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 font-semibold">
                        {typeof finalPrompt === "string" ? finalPrompt.length : 0} chars
                    </span>
                </div>
                <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${showPrompt ? "rotate-180" : ""}`} />
            </button>
            {showPrompt && (
                <div className="p-4 border-t border-neutral-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <textarea
                        value={typeof finalPrompt === "string" ? finalPrompt : ""}
                        onChange={(e) => updateFinalPrompt(e.target.value)}
                        className="w-full h-40 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs text-neutral-700 font-mono focus:outline-none focus:border-emerald-500/50 resize-y custom-scrollbar leading-relaxed"
                        placeholder="The final prompt sent to the image model..."
                    />
                </div>
            )}
        </div>
    );

    
    const GenerationInfoCard = Object.keys(generationInfo).length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-orange-50/30">
                <ImageIcon size={14} className="text-orange-500" />
                <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Generation Details</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
                <ReadOnlyField label="Model" value={generationInfo.model} />
                <ReadOnlyField label="Size" value={`${generationInfo.width}×${generationInfo.height}`} />
                <ReadOnlyField label="Reference Images" value={generationInfo.hasReferenceImages ? "Yes" : "No"} />
            </div>
        </div>
    );

    return (
        <div className="flex-1 min-h-0 h-full overflow-y-auto custom-scrollbar p-6 bg-[#FAFAFA] w-full">
            {!hasExecuted ? (
                <div className="space-y-4">
                    {SetupView}
                    {TimelineView}
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-200">
                            <Sparkles size={18} />
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-700">Ready to Generate</h4>
                        <p className="text-[11px] text-neutral-500 max-w-[220px] mt-1.5 leading-relaxed">
                            Run the node to see AI-powered intent extraction, visual planning, and ad creative details.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 pb-6">
                    {}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            {SetupView}
                        </div>
                        <div className="space-y-4">
                            {TimelineView}
                            {GenerationInfoCard}
                        </div>
                    </div>

                    {}
                    {VisionCard}
                    {IntentCard}
                    {VisualPlanCard}
                    {AdCreativeCard}
                    {FinalPromptCard}
                </div>
            )}
            <div ref={logsEndRef} className="h-4" />
        </div>
    );
}



function EditableField({ label, value, onChange, multiline, highlight }: {
    label: string; value?: string; onChange: (val: string) => void; multiline?: boolean; highlight?: boolean;
}) {
    if (!value && value !== "") return null;
    const baseClass = `w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all ${highlight ? "font-semibold text-neutral-900" : ""}`;

    return (
        <div>
            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">{label}</label>
            {multiline ? (
                <textarea value={value || ""} onChange={(e) => onChange(e.target.value)}
                    className={baseClass + " h-16 resize-none custom-scrollbar leading-relaxed"} />
            ) : (
                <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)}
                    className={baseClass} />
            )}
        </div>
    );
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div>
            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">{label}</label>
            <p className="text-xs text-neutral-700 capitalize">{value}</p>
        </div>
    );
}
