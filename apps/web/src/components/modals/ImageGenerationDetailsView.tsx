import { useState } from "react";
import { Type, Palette, Camera, Cpu, Terminal, ChevronDown } from "lucide-react";

interface Props {
    data: any;
    onChange: (newData: any) => void;
}

export default function ImageGenerationDetailsView({ data, onChange }: Props) {
    if (!data) return null;

    const intent = data.intent || {};
    const visualPlan = data.visualPlan || {};
    const config = data.usedConfig || {};

    const updateIntent = (key: string, val: any) => {
        onChange({ ...data, intent: { ...intent, [key]: val } });
    };

    const updateConfig = (key: string, val: any) => {
        onChange({ ...data, usedConfig: { ...config, [key]: val } });
    };

    const updateFinalPrompt = (val: string) => {
        onChange({ ...data, finalPrompt: val });
    };

    const [showPrompt, setShowPrompt] = useState(false);

    return (
        <div className="flex-1 min-h-0 h-full overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#0A0A0A]">
            {/* Card 1: Ad Content */}
            <div className="bg-[#111113] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-blue-500/20">
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
                            className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Main Text</label>
                        <textarea
                            value={intent.primaryText || ""}
                            onChange={(e) => updateIntent("primaryText", e.target.value)}
                            className="w-full h-24 bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none custom-scrollbar leading-relaxed"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Call to Action</label>
                        <input
                            type="text"
                            value={intent.ctaText || ""}
                            onChange={(e) => updateIntent("ctaText", e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Card 2: Visual Style */}
            <div className="bg-[#111113] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-purple-500/20">
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
                            className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Art Style</label>
                        <input
                            type="text"
                            value={intent.artStyle || ""}
                            onChange={(e) => updateIntent("artStyle", e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Lighting</label>
                        <input
                            type="text"
                            value={intent.lighting || ""}
                            onChange={(e) => updateIntent("lighting", e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Design Elements (Read-Only)</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-[#0A0A0A] border border-neutral-800/50 rounded-lg">
                            {(intent.designElements || []).map((el: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] uppercase tracking-wide inline-flex items-center">
                                    {el}
                                </span>
                            ))}
                            {(!intent.designElements || intent.designElements.length === 0) && (
                                <span className="text-xs text-neutral-600">No specific elements extracted.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: Scene & Composition */}
            <div className="bg-[#111113] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-emerald-500/20">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                    <Camera size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scene & Composition</h3>
                </div>
                <div className="p-4 space-y-3">
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
                    <div className="pt-3 border-t border-neutral-800/50 mt-1">
                        <span className="text-[10px] uppercase text-neutral-500 font-semibold block mb-1">Layout Focus</span>
                        <p className="text-sm text-emerald-100/70 leading-relaxed italic">{intent.composition || "Default composition generation."}</p>
                    </div>
                    <div className="pt-3 border-t border-neutral-800/50">
                        <span className="text-[10px] uppercase text-neutral-500 font-semibold block mb-1">Environment</span>
                        <p className="text-sm text-neutral-400 leading-relaxed">{visualPlan.environment || "Not specified."}</p>
                    </div>
                </div>
            </div>

            {/* Card 4: Model Settings */}
            <div className="bg-[#111113] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-orange-500/20">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-[#161618]">
                    <Cpu size={16} className="text-orange-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Model Settings</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Active Model</label>
                            <select
                                value={config.model || "fal-ai/flux-realism"}
                                onChange={(e) => updateConfig("model", e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                            >
                                <option value="fal-ai/flux-realism">Flux Realism</option>
                                <option value="fal-ai/flux-pro/v1.1">Flux Pro 1.1</option>
                                <option value="fal-ai/flux/dev">Flux Dev</option>
                                <option value="fal-ai/nano-banana-pro">Nano Banana Pro</option>
                                <option value="custom">Custom Fal Model</option>
                            </select>
                        </div>
                        {config.model === "custom" && (
                            <div>
                                <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block">Custom Model Path</label>
                                <input
                                    type="text"
                                    value={config.customModel || ""}
                                    onChange={(e) => updateConfig("customModel", e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                        )}
                        <div className={config.model !== "custom" ? "col-span-1" : "col-span-2"}>
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
            </div>

            {/* Card 5: Final Prompt (Advanced) */}
            <div className="bg-[#111113] border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg border-t border-t-neutral-600/50">
                <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#161618] hover:bg-neutral-800/60 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-neutral-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Final Output Prompt</h3>
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
                        <p className="text-[10px] text-neutral-500 mt-3 leading-relaxed">
                            This is the exact string passed to the image generation model. Modifying this overrides the smart fields above during the next execution.
                        </p>
                    </div>
                )}
            </div>

            <div className="h-4" /> {/* Spacer */}
        </div>
    );
}
