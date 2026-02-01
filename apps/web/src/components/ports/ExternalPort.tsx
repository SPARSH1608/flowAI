"use client";

import { Handle, Position } from "reactflow";
import { PortDataType } from "@/types/ports";
import {
    Type,
    Image as ImageIcon,
    Video,
    Wand2,
    Maximize2,
    MonitorPlay,
    Mic,
    FileText,
} from "lucide-react";

interface ExternalPortProps {
    direction: "in" | "out";
    type: PortDataType;
    position: Position;
    style?: React.CSSProperties;
}

const PORT_ICONS: Record<PortDataType, React.ReactNode> = {
    text: <Type size={10} />,
    image: <ImageIcon size={10} />,
    "image[]": <ImageIcon size={10} />,
    prompt: <FileText size={10} />,
    video: <Video size={10} />,
    audio: <Mic size={10} />,
};

// Muted/Dull Colors for Icons & Edges
const PORT_THEME: Record<PortDataType, { bg: string; border: string; icon: string }> = {
    text: { bg: "bg-[#1c221e]", border: "border-[#2d4a36]", icon: "text-[#6FB98F]" },
    image: { bg: "bg-[#1c2026]", border: "border-[#2d3a4d]", icon: "text-[#6C96C4]" },
    "image[]": { bg: "bg-[#1c2026]", border: "border-[#2d3a4d]", icon: "text-[#6C96C4]" },
    prompt: { bg: "bg-[#202020]", border: "border-[#333333]", icon: "text-[#8F8F8F]" },
    video: { bg: "bg-[#221c26]", border: "border-[#3e2d4d]", icon: "text-[#9D7CBF]" },
    audio: { bg: "bg-[#261c20]", border: "border-[#4d2d36]", icon: "text-[#C77D98]" },
};

export default function ExternalPort({
    direction,
    type,
    position,
    style = {},
}: ExternalPortProps) {
    const id = `${direction}:${type}`;
    const isInput = direction === "in";
    const theme = PORT_THEME[type];

    return (
        <div
            className="absolute flex items-center justify-center group/port"
            style={{
                [isInput ? "left" : "right"]: "-42px", // Push even further outside
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 50,
                ...style,
            }}
        >
            {/* Invisible Handle for ReactFlow connections */}
            <Handle
                id={id}
                type={isInput ? "target" : "source"}
                position={position}
                className="!bg-transparent !border-0 z-50 !rounded-full opacity-0 cursor-crosshair"
                style={{
                    width: '24px',
                    height: '24px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Visible Icon Circle - Smaller and Minimal */}
            <div
                className={`
            flex items-center justify-center
            w-6 h-6
            rounded-full
            bg-[#131313]
            border border-[#2A2A2A]
            ${theme.icon}
            shadow-sm
            transition-all duration-200
            scale-90 opacity-70
            group-hover/port:scale-100 group-hover/port:opacity-100 group-hover/port:border-opacity-100
            z-10
            pointer-events-none
          `}
            >
                {PORT_ICONS[type]}
            </div>

            {/* Hover Tooltip (Config/Type Name) */}
            <div
                className={`
            absolute
            top-1/2 -translate-y-1/2
            ${isInput ? "right-10 origin-right" : "left-10 origin-left"}
            px-2 py-1.5
            bg-[#1A1A1A] border border-neutral-800
            rounded-md
            shadow-xl
            flex items-center gap-2
            opacity-0 scale-90
            group-hover/port:opacity-100 group-hover/port:scale-100
            pointer-events-none
            transition-all duration-200
            z-[60]
          `}
            >
                <span className={`${theme.icon} opacity-80`}>{PORT_ICONS[type]}</span>
                <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-wide whitespace-nowrap">
                    {type}
                </span>
            </div>
        </div>
    );
}
