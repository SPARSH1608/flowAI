"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import FloatingSidebar from "@/components/panels/FloatingSidebar";
import TopBar from "@/components/panels/TopBar";
import { useParams } from "next/navigation";
import { fetchWorkflow } from "@/utils/workflow";

export default function WorkflowPage() {
    const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
    const params = useParams();

    useEffect(() => {
        if (!params.id) return;

        fetchWorkflow(params.id as string)
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
                    }
                });
            })
            .catch((err) => console.error("Failed to load workflow:", err));
    }, [params.id, setWorkflow]);

    return (
        <div className="flex flex-col h-screen bg-black">
            <TopBar />
            <main className="relative flex-1 overflow-hidden">
                <FloatingSidebar />
                <ReactFlowProvider>
                    <WorkflowCanvas />
                </ReactFlowProvider>
            </main>
        </div>
    );
}
