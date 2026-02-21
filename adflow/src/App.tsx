/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Wand2, Zap, Layers, ArrowRight, Image as ImageIcon, Code2, Palette, Search, Workflow, Instagram, Twitter, Youtube } from "lucide-react";

const col1Images = [
  "https://picsum.photos/seed/ad1/400/600",
  "https://picsum.photos/seed/ad2/400/600",
  "https://picsum.photos/seed/ad3/400/600",
  "https://picsum.photos/seed/ad4/400/600",
];
const col2Images = [
  "https://picsum.photos/seed/ad5/400/600",
  "https://picsum.photos/seed/ad6/400/600",
  "https://picsum.photos/seed/ad7/400/600",
  "https://picsum.photos/seed/ad8/400/600",
];
const col3Images = [
  "https://picsum.photos/seed/ad9/400/600",
  "https://picsum.photos/seed/ad10/400/600",
  "https://picsum.photos/seed/ad11/400/600",
  "https://picsum.photos/seed/ad12/400/600",
];
const col4Images = [
  "https://picsum.photos/seed/ad13/400/600",
  "https://picsum.photos/seed/ad14/400/600",
  "https://picsum.photos/seed/ad15/400/600",
  "https://picsum.photos/seed/ad16/400/600",
];

const OrbitNode = ({ url, angle, radius, size, reverseContainer = false, blur = false }: any) => {
  const counterSpinClass = reverseContainer ? 'animate-spin-slow' : 'animate-spin-slow-reverse';
  
  return (
    <div 
      className="absolute top-1/2 left-1/2"
      style={{
        transform: `rotate(${angle}deg) translateX(${radius}px)`,
        width: size,
        height: size * 1.3,
        marginTop: -(size * 1.3) / 2,
        marginLeft: -size / 2,
      }}
    >
      <div className={`w-full h-full ${counterSpinClass}`}>
        <div className={`w-full h-full rounded-3xl overflow-hidden border-[6px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white ${blur ? 'blur-[3px] scale-90 opacity-80' : ''}`}>
          <img src={url} alt="Generated Ad" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
};

const CardVisual1 = () => (
  <div className="mt-6 flex-1 bg-white/80 rounded-2xl border border-blue-100 p-4 flex flex-col gap-3 overflow-hidden relative shadow-sm">
    <div className="flex gap-1.5 mb-1">
      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
    </div>
    <div className="space-y-2">
      <div className="w-3/4 h-2 bg-blue-100 rounded-full"></div>
      <div className="w-1/2 h-2 bg-blue-50 rounded-full"></div>
      <div className="w-5/6 h-2 bg-blue-50 rounded-full"></div>
    </div>
    <div className="mt-auto pt-4">
      <div className="w-full bg-blue-500 text-white rounded-xl p-3 text-xs font-medium flex items-center justify-between shadow-md">
        <span>Prompt: "Summer sale ad"</span>
        <Wand2 className="w-3 h-3" />
      </div>
    </div>
  </div>
);

const CardVisual2 = () => (
  <div className="mt-6 flex-1 relative flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-2xl opacity-20 blur-xl"></div>
    <div className="relative w-full h-full bg-white/80 rounded-2xl border border-purple-100 p-3 flex gap-3 shadow-sm">
      <div className="w-1/3 h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl border border-purple-50"></div>
      <div className="w-2/3 flex flex-col gap-3">
        <div className="w-full h-1/2 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl border border-pink-50"></div>
        <div className="w-full h-1/2 flex gap-3">
           <div className="w-1/2 h-full bg-blue-50 rounded-xl border border-blue-100/50"></div>
           <div className="w-1/2 h-full bg-green-50 rounded-xl border border-green-100/50"></div>
        </div>
      </div>
    </div>
  </div>
);

const CardVisual3 = () => (
  <div className="mt-4 flex items-end gap-2 h-16 justify-center">
    <div className="w-8 bg-green-100 rounded-t-md h-1/3"></div>
    <div className="w-8 bg-green-200 rounded-t-md h-1/2"></div>
    <div className="w-8 bg-green-300 rounded-t-md h-3/4"></div>
    <div className="w-8 bg-green-500 rounded-t-md h-full relative shadow-sm">
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border-2 border-green-500 flex items-center justify-center">
        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
      </div>
    </div>
  </div>
);

const CardVisual4 = () => (
  <div className="mt-6 flex-1 flex flex-col justify-center relative">
    {/* Before */}
    <div className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-orange-100 opacity-60 grayscale scale-95 origin-bottom">
      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center"><Layers className="w-4 h-4 text-gray-400" /></div>
      <div className="flex-1">
        <div className="w-1/2 h-1.5 bg-gray-300 rounded-full mb-1.5"></div>
        <div className="w-1/3 h-1.5 bg-gray-200 rounded-full"></div>
      </div>
      <span className="text-[9px] font-bold text-gray-500 tracking-wider">BEFORE</span>
    </div>
    
    {/* Arrow */}
    <div className="flex justify-center -my-3 relative z-10">
      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center border-[3px] border-white shadow-md">
        <ArrowRight className="w-4 h-4 text-white rotate-90" />
      </div>
    </div>
    
    {/* After */}
    <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-orange-200 shadow-[0_8px_20px_rgba(249,115,22,0.15)] relative z-20 scale-105 origin-top">
      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-orange-500" /></div>
      <div className="flex-1">
        <div className="w-2/3 h-2 bg-orange-200 rounded-full mb-2"></div>
        <div className="w-1/2 h-2 bg-orange-100 rounded-full"></div>
      </div>
      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">AFTER</span>
    </div>
  </div>
);

const CardVisual5 = () => (
  <div className="mt-4 flex justify-center items-center h-16">
    <div className="flex -space-x-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 border-2 border-white z-30 shadow-sm flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 border-2 border-white z-20 shadow-sm"></div>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 border-2 border-white z-10 shadow-sm"></div>
    </div>
  </div>
);

const CardVisual6 = () => (
  <div className="mt-6 flex-1 bg-white/80 rounded-2xl border border-yellow-100 p-5 flex flex-col justify-center relative overflow-hidden shadow-sm">
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.6)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Generating</span>
        <span className="text-xs font-bold text-yellow-600">100%</span>
      </div>
      <div className="w-full h-2.5 bg-yellow-100 rounded-full overflow-hidden">
        <div className="w-full h-full bg-yellow-400 rounded-full"></div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="w-1/3 h-12 bg-yellow-50 rounded-lg border border-yellow-100/50"></div>
        <div className="w-1/3 h-12 bg-yellow-50 rounded-lg border border-yellow-100/50"></div>
        <div className="w-1/3 h-12 bg-yellow-50 rounded-lg border border-yellow-100/50"></div>
      </div>
    </div>
  </div>
);

const cardData: Record<number, any> = {
  1: { title: "No Coding Skills", desc: "Forget about HTML, CSS, or complex scripts. Just type what you want and let the AI build it.", icon: <Code2 className="w-6 h-6 text-blue-500" />, span: "row-span-2", bg: "bg-blue-50/50", visual: <CardVisual1 /> },
  2: { title: "Zero Design Knowledge", desc: "Our AI understands color theory, typography, and layout so you don't have to.", icon: <Palette className="w-6 h-6 text-purple-500" />, span: "row-span-2", bg: "bg-purple-50/50", visual: <CardVisual2 /> },
  3: { title: "No Researching", desc: "Winning ad formulas ready to deploy.", icon: <Search className="w-6 h-6 text-green-500" />, span: "row-span-1", bg: "bg-green-50/50", visual: <CardVisual3 /> },
  4: { title: "Simple Workflows", desc: "From idea to published ad in three simple clicks. No convoluted processes.", icon: <Workflow className="w-6 h-6 text-orange-500" />, span: "row-span-2", bg: "bg-orange-50/50", visual: <CardVisual4 /> },
  5: { title: "Your Creativity", desc: "Bring your wildest ideas to life.", icon: <Sparkles className="w-6 h-6 text-pink-500" />, span: "row-span-1", bg: "bg-pink-50/50", visual: <CardVisual5 /> },
  6: { title: "Instant Results", desc: "See your ads materialize instantly as you type. Real-time generation at its finest.", icon: <Zap className="w-6 h-6 text-yellow-500" />, span: "row-span-2", bg: "bg-yellow-50/50", visual: <CardVisual6 /> },
};

export default function App() {
  const [cardOrder, setCardOrder] = useState([1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCardOrder(prev => {
        const newOrder = [...prev];
        for (let i = newOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
        }
        return newOrder;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden font-sans">
      {/* Dotted background */}
      <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto md:px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">AdFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Models</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Workflows</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="#" className="text-gray-600 hover:text-gray-900 hidden md:block transition-colors">Sign in</a>
          <button className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors bg-white shadow-sm text-gray-900">
            Get demo
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 md:px-8 md:pt-24 flex flex-col items-center justify-center text-center min-h-[85vh]">
        
        {/* Center Icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center mb-10 border border-white"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight text-gray-900 max-w-5xl leading-[1.1]"
        >
          Design, generate, and scale <br />
          <span className="text-gray-400">ads in one click</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
        >
          Empowering creators, founders, and teams to build stunning ad creatives without the hustle. No code, multi-modal, and real-time execution.
        </motion.p>

        {/* CTA */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 flex items-center gap-2">
            Start generating free
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Floating Elements */}
        
        {/* Top Left: Sticky Note */}
        <motion.div 
          initial={{ x: -50, y: -20, opacity: 0, rotate: -5 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: -6 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="absolute top-10 left-4 md:top-24 md:left-12 lg:left-24 w-56 md:w-64 bg-[#fef08a] p-5 md:p-6 rounded-sm shadow-md hidden sm:block"
          style={{ boxShadow: "2px 4px 16px rgba(0,0,0,0.1)" }}
        >
          {/* Pin */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-600 z-10">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-400 -z-10"></div>
          </div>
          
          <p className="font-['Caveat',_cursive] text-xl md:text-2xl text-gray-800 leading-tight">
            "Try the new cinematic model for the summer campaign! It's insane."
          </p>
          
          {/* Floating icon over sticky */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-white to-gray-50 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border border-white"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </motion.div>
        </motion.div>

        {/* Top Right: Models Card */}
        <motion.div 
          initial={{ x: 50, y: -20, opacity: 0, rotate: 5 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: 4 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute top-10 right-4 md:top-20 md:right-12 lg:right-24 hidden lg:block"
        >
          <div className="relative">
            {/* Folder Tab */}
            <div className="absolute -top-8 left-0 w-32 h-10 bg-white/90 backdrop-blur-md rounded-t-2xl border-t border-l border-r border-white/50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"></div>
            
            {/* Main Card */}
            <div className="relative w-72 bg-white/90 backdrop-blur-md p-5 rounded-b-3xl rounded-tr-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 text-left">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-semibold text-gray-900">Active Models</h3>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Real-time</span>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Flux Pro</p>
                    <p className="text-xs text-gray-500 truncate">Photorealism</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-gray-400">Status</span>
                    <div className="flex items-center gap-1 bg-green-100 px-1.5 py-0.5 rounded text-[10px] text-green-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Live
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/80 border border-gray-100 opacity-60">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">SDXL Turbo</p>
                    <p className="text-xs text-gray-500 truncate">Fast generation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating icon */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -left-8 top-12 w-16 h-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border border-white z-20"
            >
              <Zap className="w-7 h-7 text-yellow-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Left: Workflow Card */}
        <motion.div 
          initial={{ x: -50, y: 20, opacity: 0, rotate: -2 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: -3 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="absolute bottom-10 left-4 md:bottom-20 md:left-12 lg:left-24 hidden lg:block"
        >
          <div className="relative">
            {/* Folder Tab */}
            <div className="absolute -top-8 left-0 w-36 h-10 bg-white/90 backdrop-blur-md rounded-t-2xl border-t border-l border-r border-white/50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"></div>
            
            <div className="relative w-80 bg-white/90 backdrop-blur-md p-6 rounded-b-3xl rounded-tr-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 text-left">
              <h3 className="font-semibold text-gray-900 mb-5 relative z-10">Generation Progress</h3>
              <div className="space-y-5 relative z-10">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">1</span>
                      Analyzing Prompt
                    </span>
                    <span className="text-gray-500 font-medium">100%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">2</span>
                      Applying Style
                    </span>
                    <span className="text-gray-500 font-medium">85%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[85%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">3</span>
                      Rendering Ad
                    </span>
                    <span className="text-gray-500 font-medium">40%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[40%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Right: Integrations Card */}
        <motion.div 
          initial={{ x: 50, y: 20, opacity: 0, rotate: 3 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: 5 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="absolute bottom-10 right-4 md:bottom-24 md:right-12 lg:right-32 hidden lg:block"
        >
          <div className="relative">
            {/* Folder Tab */}
            <div className="absolute -top-8 left-0 w-40 h-10 bg-white/90 backdrop-blur-md rounded-t-2xl border-t border-l border-r border-white/50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"></div>
            
            <div className="relative w-72 bg-white/90 backdrop-blur-md p-6 rounded-b-3xl rounded-tr-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 text-left">
              <h3 className="font-semibold text-gray-900 mb-5 relative z-10">100+ Integrations</h3>
              <div className="flex gap-4 relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-gray-50 flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
                  {/* Faux Meta Icon */}
                  <svg className="w-8 h-8 text-[#0668E1]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-gray-50 flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
                  {/* Faux Google Icon */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-gray-50 flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
                  {/* Faux TikTok Icon */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.32 6.32 6.32 0 0 0 6.27-6.32V10.5a8.3 8.3 0 0 0 5.46 2.05V9.1a5.24 5.24 0 0 1-3.41-2.41Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Showcase Section - Orbiting */}
      <section className="relative w-full h-[700px] md:h-[900px] bg-[#f8f9fa] overflow-hidden flex items-center justify-center">
        
        {/* Left Orbit */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-1/4 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full animate-spin-slow pointer-events-none">
           <OrbitNode url={col1Images[0]} angle={0} radius={380} size={160} />
           <OrbitNode url={col1Images[1]} angle={72} radius={320} size={140} blur />
           <OrbitNode url={col1Images[2]} angle={144} radius={420} size={180} />
           <OrbitNode url={col1Images[3]} angle={216} radius={340} size={150} blur />
           <OrbitNode url={col2Images[0]} angle={288} radius={400} size={170} />
        </div>

        {/* Right Orbit */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-1/4 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full animate-spin-slow-reverse pointer-events-none">
           <OrbitNode url={col3Images[0]} angle={36} radius={380} size={160} reverseContainer />
           <OrbitNode url={col3Images[1]} angle={108} radius={320} size={140} blur reverseContainer />
           <OrbitNode url={col3Images[2]} angle={180} radius={420} size={180} reverseContainer />
           <OrbitNode url={col3Images[3]} angle={252} radius={340} size={150} blur reverseContainer />
           <OrbitNode url={col4Images[0]} angle={324} radius={400} size={170} reverseContainer />
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center max-w-xl px-6 bg-[#f8f9fa]/80 backdrop-blur-xl py-12 rounded-3xl shadow-[0_0_60px_rgba(248,249,250,0.9)] border border-white/50">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center justify-center mx-auto mb-8">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            AdFlow <br /> solutions
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
            Streamline ad creation in one centralized platform, enhancing team transparency and execution speed.
          </p>
          <button className="px-8 py-3.5 bg-[#9b6dff] text-white rounded-full font-medium text-lg hover:bg-[#8b5aef] transition-colors shadow-lg shadow-purple-500/25">
            Learn more
          </button>
        </div>
      </section>

      {/* Built For Everyone Section - Animated Masonry */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Built for everyone
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed">
              No coding skills. No design knowledge. No researching. Simple workflows and your creativity is all you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[200px] grid-flow-dense max-w-6xl mx-auto">
            {cardOrder.map(id => {
              const card = cardData[id];
              return (
                <motion.div
                  layout
                  key={id}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className={`p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col ${card.span} ${card.bg}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{card.desc}</p>
                  {card.visual}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="px-6 md:px-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto bg-white rounded-[40px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative pt-16 md:pt-24 px-8 md:px-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 relative z-10 mb-32 md:mb-48">
            {/* Left Col */}
            <div className="lg:col-span-4">
              <p className="text-xl font-medium text-gray-900 leading-snug max-w-sm">
                AdFlow is the AI ad generation platform that builds high-converting creatives—all in one place.
              </p>
            </div>
            
            {/* Middle Links */}
            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Models</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Workflows</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Generation</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Editing</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Analytics</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Pricing</h4>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              </div>
            </div>

            {/* Right Col */}
            <div className="lg:col-span-3 lg:text-right">
              <h4 className="font-semibold text-gray-900 mb-4">Follow us</h4>
              <div className="flex items-center lg:justify-end gap-3">
                <a href="#" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Huge Blurred Text */}
          <div className="absolute bottom-0 left-0 w-full translate-y-1/3 flex justify-center pointer-events-none">
            <h1 className="text-[22vw] font-bold text-blue-500/60 blur-2xl select-none tracking-tighter leading-none">
              AdFlow
            </h1>
          </div>
        </div>
      </footer>
    </div>
  );
}
