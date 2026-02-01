"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import TypedPort from "../ports/TypedPort";
import ExternalPort from "../ports/ExternalPort"; // Changed from TypedPort to ExternalPort
import AdvancedToggle from "./AdvancedToggle";

export default function ImageGenerationNode({ data, selected }: NodeProps) {
    const config = data.config;

    return (
        <BaseNode title="Image Generation" status={data.status} selected={selected} id={data.id}>
            {/* Inputs */}
            <ExternalPort direction="in" type="text" position={Position.Left} style={{ top: "30%" }} />
            <ExternalPort direction="in" type="image[]" position={Position.Left} style={{ top: "70%" }} />

            {/* Outputs */}
            <ExternalPort direction="out" type="image[]" position={Position.Right} />

            <div className="space-y-3">
                {/* Prompt Input */}
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">
                        Prompt
                    </label>
                    <textarea
                        className="w-full h-20 bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 text-neutral-200 text-xs focus:outline-none focus:border-neutral-700 resize-none"
                        placeholder="Describe image..."
                        defaultValue={config?.prompt}
                        onChange={(e) => {
                            config.prompt = e.target.value;
                            data.status = "configured";
                        }}
                    />
                </div>
            </div>

            {/* Basic settings */}
            <div className="flex gap-2 text-xs">
                <input
                    type="number"
                    className="w-1/2 bg-neutral-800 border border-neutral-700 rounded p-1"
                    placeholder="Width"
                    value={config.size?.width || ""}
                    onChange={(e) => {
                        config.size = { ...config.size, width: +e.target.value };
                    }}
                />
                <input
                    type="number"
                    className="w-1/2 bg-neutral-800 border border-neutral-700 rounded p-1"
                    placeholder="Height"
                    value={config.size?.height || ""}
                    onChange={(e) => {
                        config.size = { ...config.size, height: +e.target.value };
                    }}
                />
            </div>

            {/* Advanced */}
            <AdvancedToggle>
                <input
                    type="number"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                    placeholder="CFG Scale"
                    value={config.cfgScale || ""}
                    onChange={(e) => (config.cfgScale = +e.target.value)}
                />

                <input
                    type="number"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                    placeholder="Steps"
                    value={config.steps || ""}
                    onChange={(e) => (config.steps = +e.target.value)}
                />
            </AdvancedToggle>
        </BaseNode>
    );
}
