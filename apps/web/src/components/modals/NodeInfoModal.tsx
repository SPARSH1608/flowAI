"use client";

import { X, Play, Settings2, FileJson } from "lucide-react";
import { useState, useEffect } from "react";
import ImageGenerationDetailsView from "./ImageGenerationDetailsView";

interface NodeInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onReExecute?: (newData?: any) => void;
    title: string;
}

export default function NodeInfoModal({ isOpen, onClose, data, onReExecute, title }: NodeInfoModalProps) {
    const isTextBased = title.toLowerCase().includes("text") || title.toLowerCase().includes("assistant");
    const isImageGen = title.toLowerCase().includes("image generation");

    const [content, setContent] = useState("");
    const [imageGenData, setImageGenData] = useState<any>(null);

    useEffect(() => {
        if (data) {
            if (isTextBased) {
                setContent(data.text || "");
            } else if (isImageGen) {
                setImageGenData(data);
            } else {
                setContent(JSON.stringify(data, null, 2));
            }
        }
    }, [data, isTextBased, isImageGen, isOpen]);

    if (!isOpen) return null;

    const handleAction = () => {
        if (!onReExecute) return;
        try {
            if (isTextBased) {
                onReExecute({ text: content });
            } else if (isImageGen) {
                onReExecute(imageGenData);
            } else {
                const parsed = JSON.parse(content);
                onReExecute(parsed);
            }
        } catch (e) {
            alert("Invalid JSON content format");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            {}
            <div className="bg-white border border-neutral-200 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {}
                <div className="flex-none px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-700/50 text-neutral-700">
                            <Settings2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-neutral-900 tracking-wide">{title} Details</h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Edit output overrides and execution data</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 rounded-lg text-neutral-500 hover:text-neutral-900 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {}
                {isImageGen ? (
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white">
                        <ImageGenerationDetailsView
                            data={imageGenData}
                            onChange={setImageGenData}
                        />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden p-6 flex flex-col gap-3 bg-white">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                            <FileJson size={14} className="text-blue-500/70" />
                            <span>Data Output (Editable)</span>
                        </div>

                        <div className="flex-1 relative rounded-xl border border-neutral-200 bg-white shadow-inner overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all group">
                            <textarea
                                className={`w-full h-full p-5 bg-transparent outline-none resize-none 
                                    ${isTextBased ? "text-sm text-neutral-700 leading-relaxed font-sans" : "font-mono text-[13px] text-emerald-400/90 leading-relaxed"}
                                `}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                spellCheck={false}
                                placeholder={isTextBased ? "Edit the text response here..." : "Edit JSON data..."}
                            />
                        </div>
                    </div>
                )}

                {}
                <div className="flex-none px-6 py-5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
                    <p className="text-xs text-neutral-500 tracking-wide font-medium">
                        Modifying this data replaces what is sent to the next node.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 bg-transparent hover:bg-white/5 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        {onReExecute && (
                            <button
                                onClick={handleAction}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-neutral-900 rounded-xl text-xs font-semibold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.3)] transform hover:-translate-y-0.5"
                            >
                                <Play size={14} className="fill-current" />
                                {isImageGen ? "Regenerate Image" : "Save & Re-Execute"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
