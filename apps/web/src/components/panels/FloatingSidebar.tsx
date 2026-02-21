"use client";

import { useState } from "react";
import {
    Search,
    Type,
    Image as ImageIcon,
    Video,
    Wand2,
    Maximize2,
    Camera,
    ChevronDown,
    Upload,
    ImagePlus,
    Play,
    Settings,
    MessageSquare,
    Scissors,
    Images,
    Clock,
} from "lucide-react";
import { addNode } from "@/components/canvas/CanvasContextMenu";
import { NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import MediaLibrary from "./MediaLibrary";

export default function FloatingSidebar() {
    const [activeTab, setActiveTab] = useState<"add" | "media" | "settings" | "history" | null>(null);
    const toggleDeleteMode = useWorkflowStore((s) => s.toggleDeleteMode);
    const deleteMode = useWorkflowStore((s) => s.deleteMode);
    const executions = useWorkflowStore((s) => s.executions);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);

    return (
        <div className="fixed left-4 top-20 z-50 flex h-[calc(100vh-6rem)] gap-2">
            <div className="flex w-12 flex-col items-center gap-4 rounded-full bg-[#111113]/90 backdrop-blur-xl py-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/5">
                <button
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 ${activeTab === "add" ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'}`}
                    onClick={() => setActiveTab(activeTab === "add" ? null : "add")}
                >
                    <Play size={18} fill="currentColor" />
                </button>

                <div className="flex flex-col gap-2 w-full items-center">
                    <RailButton active={activeTab === "media"} onClick={() => setActiveTab(activeTab === "media" ? null : "media")}>
                        <Images size={20} />
                    </RailButton>
                    <RailButton active={activeTab === "history"} onClick={() => setActiveTab(activeTab === "history" ? null : "history")}>
                        <Clock size={20} />
                    </RailButton>
                    <RailButton active={deleteMode} onClick={toggleDeleteMode}>
                        <Scissors size={20} />
                    </RailButton>
                    <RailButton active={false} onClick={() => { }}>
                        <MessageSquare size={20} />
                    </RailButton>
                </div>

                <div className="mt-auto flex flex-col gap-2 w-full items-center">
                    <RailButton active={false} onClick={() => { }}>
                        <Settings size={20} />
                    </RailButton>
                </div>
            </div>

            {activeTab === "add" && (
                <div className="flex w-64 flex-col gap-4 rounded-3xl bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-md border border-neutral-800/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            className="w-full rounded-xl bg-black/40 border border-white/5 py-2 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <MenuButton icon={<Upload size={16} />} label="Upload" onClick={() => { addNode("IMAGE_NODE", { x: 500, y: 300 }); setActiveTab(null); }} />
                        <MenuButton icon={<ImagePlus size={16} />} label="Media" onClick={() => { addNode("IMAGE_NODE", { x: 500, y: 300 }); setActiveTab(null); }} />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                        <div className="mb-4">
                            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                Nodes
                            </h3>
                            <div className="flex flex-col gap-1">
                                <NodeButton type="TEXT_NODE" icon={<Type size={16} />} label="Text" color="text-green-500" onClose={() => { setActiveTab(null) as any }} />
                                <NodeButton type="IMAGE_GENERATION_NODE" icon={<ImageIcon size={16} />} label="Image Generator" color="text-blue-500" onClose={() => { setActiveTab(null) as any }} />
                                <NodeButton type="VIDEO_GENERATION_NODE" icon={<Video size={16} />} label="Video Generator" color="text-purple-500" onClose={() => { setActiveTab(null) as any }} />
                                <NodeButton type="ASSISTANT_NODE" icon={<Wand2 size={16} />} label="Assistant" color="text-emerald-500" onClose={() => { setActiveTab(null) as any }} />
                                <NodeButton type="IMAGE_PROCESSING_NODE" icon={<Maximize2 size={16} />} label="Image Upscaler" color="text-orange-500" onClose={() => { setActiveTab(null) as any }} />
                                <NodeButton type="EXPORT_NODE" icon={<Camera size={16} />} label="Camera Angle" color="text-pink-500" onClose={() => { setActiveTab(null) as any }} />
                            </div>
                        </div>

                        <div>
                            <button className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-300">
                                <span>Utilities</span>
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "media" && (
                <div className="flex w-64 flex-col gap-4 rounded-2xl bg-[#111113]/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl border border-white/5 animate-in slide-in-from-left-2 duration-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search media..."
                            className="w-full rounded-xl bg-black/40 border border-white/5 py-2 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
                        />
                    </div>

                    <MediaLibrary onImageSelect={(imageData) => {
                        addNode("IMAGE_NODE", { x: 500, y: 300 }, { config: imageData });
                        setActiveTab(null);
                    }} />
                </div>
            )}

            {activeTab === "history" && (
                <div className="flex w-72 flex-col gap-4 rounded-2xl bg-[#111113]/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl border border-white/5 animate-in slide-in-from-left-2 duration-200 h-full overflow-hidden">
                    <div className="flex items-center gap-2 px-1">
                        <Clock className="text-indigo-400" size={16} />
                        <h3 className="text-sm font-semibold text-white tracking-wide">Execution History</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                        {executions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
                                <div className="w-12 h-12 rounded-full border border-neutral-800 bg-black/40 flex items-center justify-center text-neutral-500 mb-2">
                                    <Clock size={20} />
                                </div>
                                <h4 className="text-sm font-semibold text-neutral-300">No past executions yet.</h4>
                                <p className="text-xs text-neutral-500 max-w-[200px] leading-relaxed">
                                    Run a node to see your execution history appear here.
                                </p>
                            </div>
                        ) : (
                            executions.map((exec, idx) => (
                                <button
                                    key={exec.id}
                                    onClick={() => {
                                        if (exec.result?.nodeOutputs) {
                                            setExecutionResults(exec.result.nodeOutputs);
                                            setActiveTab(null);
                                        }
                                    }}
                                    className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[10px] uppercase text-neutral-500 font-bold group-hover:text-indigo-400 transition-colors">
                                            Run #{executions.length - idx}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${exec.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                            exec.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                'bg-orange-500/10 text-orange-400'
                                            }`}>
                                            {exec.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-neutral-300">
                                        {new Date(exec.completedAt || exec.startedAt).toLocaleString()}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function RailButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${active ? "bg-white/10 text-white shadow-inner border border-white/5" : "text-neutral-500 hover:bg-white/5 hover:text-white"
                }`}
        >
            {children}
        </button>
    );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5">
            <span className="text-neutral-500">{icon}</span>
            {label}
        </button>
    )
}

function NodeButton({ type, icon, label, color, onClose }: { type: NodeType; icon: React.ReactNode; label: string; color: string; onClose: () => void }) {
    return (
        <button
            onClick={() => {
                addNode(type, { x: 500, y: 300 });
                onClose();
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-400 transition-all hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5"
        >
            <span className={`rounded-lg bg-black/40 border border-white/5 p-1.5 transition-colors group-hover:bg-white/5 ${color}`}>
                {icon}
            </span>
            {label}
        </button>
    );
}
