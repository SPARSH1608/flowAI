"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-neutral-100 transition-all outline-none"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-[10px] font-bold border border-white/10 shadow-lg shrink-0">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 z-[100] p-2 bg-white border border-neutral-200 rounded-2xl w-56 shadow-2xl overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/10 mb-2">
                            <p className="text-xs font-bold text-neutral-900 truncate">{user?.name || "User"}</p>
                            <p className="text-[10px] text-neutral-500 truncate mt-0.5">{user?.email}</p>
                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
                                <LogOut size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Log Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
