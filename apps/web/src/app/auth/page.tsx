"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Zap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AuthContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "login";
    const [isLogin, setIsLogin] = useState(mode === "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login: authLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/signup";
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Authentication failed");
            }

            authLogin(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6 selection:bg-indigo-500/30">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tighter text-white mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                            <Zap size={22} className="fill-current" />
                        </div>
                        FlowAI
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {isLogin ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-neutral-500 mt-2">
                        {isLogin ? "Sign in to continue your work" : "Get started with next-gen ad workflows"}
                    </p>
                </div>

                <div className="bg-[#121217] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 transition-all outline-none"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-neutral-600 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Password</label>
                                {isLogin && <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest">Forgot?</button>}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-neutral-600 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium animate-in fade-in zoom-in">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                <>
                                    {isLogin ? "Sign In" : "Get Started"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-8 border-t border-white/5">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span className="text-indigo-400 font-bold hover:underline">
                                {isLogin ? "Create one" : "Sign in"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
