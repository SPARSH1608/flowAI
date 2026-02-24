"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflowStore";
import dynamic from "next/dynamic";
const WorkflowCanvas = dynamic(() => import("@/components/canvas/WorkflowCanvas"), { ssr: false });
import FloatingSidebar from "@/components/panels/FloatingSidebar";
import TopBar from "@/components/panels/TopBar";
import RightInspector from "@/components/panels/RightInspector";
import { useParams, useRouter } from "next/navigation";
import { fetchWorkflow } from "@/utils/workflow";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function WorkflowPage() {
    const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
    const params = useParams();
    const { token, loading } = useAuth();
    const [workflowLoading, setWorkflowLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!token) {
            router.push("/auth");
            return;
        }
        if (!params.id) return;

        setWorkflowLoading(true);
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
            .catch((err) => console.error("Failed to load workflow:", err))
            .finally(() => setWorkflowLoading(false));
    }, [params.id, setWorkflow, loading, token, router]);

    if (loading || workflowLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="text-zinc-900 animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#FAFAFA] text-neutral-900 overflow-hidden font-sans">
            <TopBar />

            <main className="flex flex-1 h-[calc(100vh-60px)] relative overflow-hidden">
                <ReactFlowProvider>
                    {/* Left Dock */}
                    <FloatingSidebar />

                    {/* Center Canvas */}
                    <div className="flex-1 relative bg-[#FAFAFA] border-x border-neutral-200">
                        <WorkflowCanvas />
                    </div>

                    {/* Right Inspector Drawer */}
                    <RightInspector />
                </ReactFlowProvider>
            </main>
        </div>
    );
}
