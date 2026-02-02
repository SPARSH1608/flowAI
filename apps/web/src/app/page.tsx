"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import FloatingSidebar from "@/components/panels/FloatingSidebar";

import TopBar from "@/components/panels/TopBar";

export default function Page() {
  const hydrate = useWorkflowStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
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
