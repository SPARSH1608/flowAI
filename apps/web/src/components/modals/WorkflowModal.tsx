"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface WorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description?: string }) => Promise<void>;
    initialData?: { name: string; description?: string };
    title: string;
}

export default function WorkflowModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
}: WorkflowModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setDescription(initialData.description || "");
        } else if (isOpen) {
            setName("");
            setDescription("");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({ name, description });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to submit");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/10 backdrop-blur-sm">
            <div className="bg-white border border-neutral-200 rounded-xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                            placeholder="My Awesome Workflow"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] shadow-sm"
                            placeholder="What does this workflow do?"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {initialData ? "Save Changes" : "Create Workflow"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
