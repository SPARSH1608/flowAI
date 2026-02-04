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
} from "lucide-react";
import { addNode } from "@/components/canvas/CanvasContextMenu";
import { NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import MediaLibrary from "./MediaLibrary";

export default function FloatingSidebar() {
    const [activeTab, setActiveTab] = useState<"add" | "media" | "settings" | null>(null);
    const toggleDeleteMode = useWorkflowStore((s) => s.toggleDeleteMode);
    const deleteMode = useWorkflowStore((s) => s.deleteMode);

    return (
        <div className="fixed left-4 top-20 z-50 flex h-[calc(100vh-6rem)] gap-2">
            <div className="flex w-12 flex-col items-center gap-4 rounded-full bg-neutral-900 py-4 shadow-xl border border-neutral-800/50">
                <button
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 ${activeTab === "add" ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                    onClick={() => setActiveTab(activeTab === "add" ? null : "add")}
                >
                    <Play size={18} fill="currentColor" />
                </button>

                <div className="flex flex-col gap-2 w-full items-center">
                    <RailButton active={activeTab === "media"} onClick={() => setActiveTab(activeTab === "media" ? null : "media")}>
                        <Images size={20} />
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
                            placeholder="Search"
                            className="w-full rounded-xl bg-neutral-800 py-2 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
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
                <div className="flex w-64 flex-col gap-4 rounded-3xl bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-md border border-neutral-800/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search media"
                            className="w-full rounded-xl bg-neutral-800 py-2 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                        />
                    </div>

                    <MediaLibrary onImageSelect={(imageData) => {
                        addNode("IMAGE_NODE", { x: 500, y: 300 }, { config: imageData });
                        setActiveTab(null);
                    }} />
                </div>
            )}
        </div>
    );
}

function RailButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                }`}
        >
            {children}
        </button>
    );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
            <span className="text-neutral-400">{icon}</span>
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
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
        >
            <span className={`rounded bg-neutral-800 p-1.5 transition-colors group-hover:bg-neutral-700 ${color}`}>
                {icon}
            </span>
            {label}
        </button>
    );
}
