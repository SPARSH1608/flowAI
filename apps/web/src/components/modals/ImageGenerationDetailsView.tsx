"use client";

import { useState } from "react";
import { Type, Palette, Camera, Cpu, Terminal, ChevronDown } from "lucide-react";

interface Props {
    data: any;
    onChange: (newData: any) => void;
}

export default function ImageGenerationDetailsView({ data, onChange }: Props) {
    if (!data) return null;

    const debugInfo = data.debugInfo || {};
    const intent = debugInfo.intent || data.intent || {};
    const visualPlan = debugInfo.visualPlan || data.visualPlan || {};
    const config = debugInfo.usedConfig || data.config || data.usedConfig || {};

    const updateIntent = (key: string, val: any) => {
        onChange({ ...data, intent: { ...intent, [key]: val } });
    };

    const updateConfig = (key: string, val: any) => {
        // Ensure we update the correct config object
        const newConfig = { ...config, [key]: val };
        onChange({ ...data, usedConfig: newConfig, config: newConfig });
    };

    const updateFinalPrompt = (val: string) => {
        onChange({ ...data, finalPrompt: val });
    };

    const [showPrompt, setShowPrompt] = useState(false);

    const hasExecuted = Object.keys(intent).length > 0 || Object.keys(visualPlan).length > 0 || debugInfo.finalPrompt || data.finalPrompt;

    const SetupView = (
        <div className="bg-[#181922] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-orange-500/20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-orange-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Image Generation Setup</h3>
                </div>
                <span className="text-[10px] text-neutral-500 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">Required</span>
            </div>
            <div className="p-4 space-y-6">
                {/* Model Selection */}
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Active Model</label>
                    <select
                        value={config.model || "fal-ai/flux-realism"}
                        onChange={(e) => updateConfig("model", e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all font-sans"
                    >
                        <option value="fal-ai/flux-realism">Flux Realism (Ads Optimised)</option>
                        <option value="fal-ai/flux-pro/v1.1">Flux Pro 1.1 (High Speed)</option>
                        <option value="fal-ai/flux/dev">Flux Dev</option>
                        <option value="fal-ai/nano-banana-pro">Nano Banana Pro</option>
                        <option value="custom">Custom Fal Model</option>
                    </select>
                </div>

                {/* Base Prompt */}
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Base Prompt / Context</label>
                    <textarea
                        value={config.prompt || ""}
                        onChange={(e) => updateConfig("prompt", e.target.value)}
                        className="w-full h-28 bg-[#0A0A0A] border border-neutral-800 rounded-lg p-3 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none custom-scrollbar leading-relaxed"
                        placeholder="Describe what you want to generate. You can also give instructions like 'put it on a desk' or 'vintage style'..."
                    />
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Width</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={config.width || 1024}
                                onChange={(e) => updateConfig("width", parseInt(e.target.value))}
                                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50 pr-8"
                            />
                            <span className="absolute right-3 top-2.5 text-[10px] text-neutral-600 font-mono">PX</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Height</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={config.height || 768}
                                onChange={(e) => updateConfig("height", parseInt(e.target.value))}
                                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50 pr-8"
                            />
                            <span className="absolute right-3 top-2.5 text-[10px] text-neutral-600 font-mono">PX</span>
                        </div>
                    </div>
                </div>

                {/* Strength / Optional details */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Identity Strength</label>
                        <span className="text-[10px] text-orange-400/80 font-mono bg-orange-500/10 px-1.5 py-0.5 rounded">{config.strength || 0.5}</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="1" step="0.01"
                        value={config.strength ?? 0.5}
                        onChange={(e) => updateConfig("strength", parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
                    />
                </div>
            </div>
        </div>
    );

    const PortsView = (
        <div className="bg-[#181922] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-neutral-800/40">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-neutral-500" />
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Interface Ports</h3>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] text-neutral-400 font-medium">Input Context</span>
                    </div>
                    <span className="text-[9px] text-neutral-600 font-mono uppercase bg-black/20 px-1.5 py-0.5 rounded border border-white/5">text</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="text-[11px] text-neutral-400 font-medium">Reference Images</span>
                    </div>
                    <span className="text-[9px] text-neutral-600 font-mono uppercase bg-black/20 px-1.5 py-0.5 rounded border border-white/5">image[]</span>
                </div>
                <div className="h-px bg-neutral-800/50 my-1" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <span className="text-[11px] text-neutral-300 font-medium tracking-tight">Generated Output</span>
                    </div>
                    <span className="text-[9px] text-emerald-500/60 font-mono uppercase bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">image[]</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 min-h-0 h-full overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#0E0E14]">
            {PortsView}

            {!hasExecuted && (
                <div className="space-y-6">
                    {SetupView}
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-500/20">
                            <Terminal size={18} />
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-300">Ready to Generate</h4>
                        <p className="text-[11px] text-neutral-500 max-w-[200px] mt-1.5 leading-relaxed">
                            Once configured, run the node to see AI-calculated ad intent and visual plans.
                        </p>
                    </div>
                </div>
            )}

            {hasExecuted && (
                <>
                    {/* Setup is still at the top or bottom? User said: "after we execute the image gen node it show all the details we were showing earlier"
                        Usually good to keep setup accessible. Let's show results first, then setup as a collapsed card?
                        Or just Setup at the top. Let's do Results then Setup at the bottom for easy re-triggering?
                        Actually, let's show Setup at the top but maybe more compact, or just the Results.
                        Let's follow "show all the details we were showing earlier" which implies the post-exec view.
                    */}

                    {/* Card 1: Ad Content */}
                    <div className="bg-[#181922] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-blue-500/20">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                            <Type size={16} className="text-blue-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ad Content</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Headline</label>
                                <input
                                    type="text"
                                    value={intent.headline || ""}
                                    onChange={(e) => updateIntent("headline", e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Main Text</label>
                                <textarea
                                    value={intent.primaryText || ""}
                                    onChange={(e) => updateIntent("primaryText", e.target.value)}
                                    className="w-full h-24 bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none custom-scrollbar leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Call to Action</label>
                                <input
                                    type="text"
                                    value={intent.ctaText || ""}
                                    onChange={(e) => updateIntent("ctaText", e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Visual Style */}
                    <div className="bg-[#181922] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-purple-500/20">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                            <Palette size={16} className="text-purple-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Visual Style</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Mood</label>
                                <input
                                    type="text"
                                    value={intent.mood || ""}
                                    onChange={(e) => updateIntent("mood", e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50 transition-all font-sans"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Art Style</label>
                                <input
                                    type="text"
                                    value={intent.artStyle || ""}
                                    onChange={(e) => updateIntent("artStyle", e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50 transition-all font-sans"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Scene & Composition */}
                    <div className="bg-[#181922] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-emerald-500/20">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                            <Camera size={16} className="text-emerald-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scene & Composition</h3>
                        </div>
                        <div className="p-4 space-y-3 font-sans">
                            <div className="flex items-start gap-4">
                                <div className="w-1/3">
                                    <span className="text-[10px] uppercase text-neutral-500 font-semibold">Camera Angle</span>
                                    <p className="text-sm text-neutral-300 mt-1 capitalize">{visualPlan.camera || "Auto"}</p>
                                </div>
                                <div className="w-1/3">
                                    <span className="text-[10px] uppercase text-neutral-500 font-semibold">Framing</span>
                                    <p className="text-sm text-neutral-300 mt-1 capitalize">{visualPlan.framing || "Auto"}</p>
                                </div>
                                <div className="w-1/3">
                                    <span className="text-[10px] uppercase text-neutral-500 font-semibold">Realism</span>
                                    <p className="text-sm text-neutral-300 mt-1 capitalize">{visualPlan.realismLevel || "Auto"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ALWAYS show setup at the bottom for tweaking */}
                    {SetupView}

                    {/* Final Prompt Override */}
                    <div className="bg-[#181922] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-neutral-600/50">
                        <button
                            onClick={() => setShowPrompt(!showPrompt)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#161618] hover:bg-neutral-800/60 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Terminal size={16} className="text-neutral-400" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Final Output Prompt</h3>
                                <span className="bg-neutral-800 text-neutral-400 text-[9px] px-1.5 py-0.5 rounded-md ml-2 border border-neutral-700">Advanced</span>
                            </div>
                            <ChevronDown size={16} className={`text-neutral-500 transition-transform duration-300 ${showPrompt ? "rotate-180" : ""}`} />
                        </button>
                        {showPrompt && (
                            <div className="p-4 border-t border-neutral-800/60 animate-in fade-in slide-in-from-top-2 duration-300 bg-[#0A0A0A]">
                                <textarea
                                    value={data.finalPrompt || ""}
                                    onChange={(e) => updateFinalPrompt(e.target.value)}
                                    className="w-full h-40 bg-[#111113] border border-neutral-800 rounded-lg p-4 text-xs text-neutral-300 font-mono focus:outline-none focus:border-neutral-500/50 resize-y custom-scrollbar leading-relaxed"
                                    placeholder="Directly override the final prompt..."
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="h-4" /> {/* Spacer */}
        </div>
    );
}
