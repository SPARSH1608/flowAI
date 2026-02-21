"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import FloatingSidebar from "@/components/panels/FloatingSidebar";
import TopBar from "@/components/panels/TopBar";
import RightInspector from "@/components/panels/RightInspector";
import { useParams, useRouter } from "next/navigation";
import { fetchWorkflow } from "@/utils/workflow";
import { useAuth } from "@/context/AuthContext";

export default function WorkflowPage() {
    const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
    const params = useParams();
    const { token, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!token) {
            router.push("/auth");
            return;
        }
        if (!params.id) return;

        fetchWorkflow(params.id as string, token)
            .then((data) => {
                const nodes = data.definition?.nodes || [];
                const edges = data.definition?.edges || [];
                let executionResults = data.definition?.executionResults || {};

                if (Object.keys(executionResults).length === 0 && data.executions && data.executions.length > 0) {
                    const sorted = [...data.executions].sort((a: any, b: any) =>
                        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
                    );
                    const latest = sorted[0];
                    if (latest?.result?.nodeOutputs) {
                        console.log("Using latest execution result:", latest.id);
                        executionResults = latest.result.nodeOutputs;
                    }
                }

                setWorkflow({
                    nodes,
                    edges,
                    executionResults,
                    metadata: {
                        name: data.name,
                        description: data.description
                    },
                    executions: data.executions || [],
                });
            })
            .catch((err) => console.error("Failed to load workflow:", err));
    }, [params.id, setWorkflow]);

    return (
        <div className="flex flex-col h-screen bg-[#0E0E14] text-neutral-300 overflow-hidden font-sans">
            <TopBar />

            <main className="flex flex-1 h-[calc(100vh-60px)] relative overflow-hidden">
                <ReactFlowProvider>
                    {/* Left Dock */}
                    <FloatingSidebar />

                    {/* Center Canvas */}
                    <div className="flex-1 relative bg-[#0E0E14] border-x border-white/5">
                        <WorkflowCanvas />
                    </div>

                    {/* Right Inspector Drawer */}
                    <RightInspector />
                </ReactFlowProvider>
            </main>
        </div>
    );
}
