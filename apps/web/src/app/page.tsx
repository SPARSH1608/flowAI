"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, MoreVertical, Edit, Trash2 } from "lucide-react";
import { createWorkflow, updateWorkflow, deleteWorkflow } from "@/utils/workflow";
import WorkflowModal from "@/components/modals/WorkflowModal";

export default function DashboardPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  function fetchWorkflows() {
    fetch("http://localhost:3002/workflows")
      .then((res) => res.json())
      .then((data) => setWorkflows(data))
      .catch((err) => console.error(err));
  }

  async function handleCreate(data: { name: string; description?: string }) {
    const defaultWorkflow = {
      version: "v1",
      metadata: {
        name: data.name,
        description: data.description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      canvas: { nodes: [], edges: [] },
      executionResults: {},
    };

    const result = await createWorkflow(defaultWorkflow);
    if (result.id) {
      router.push(`/workflows/${result.id}`);
    }
  }

  async function handleUpdate(data: { name: string; description?: string }) {
    if (!editingWorkflow) return;

    try {
      const fullWorkflowRes = await fetch(`http://localhost:3002/workflows/${editingWorkflow.id}`);
      const fullWorkflow = await fullWorkflowRes.json();

      fullWorkflow.metadata.name = data.name;
      fullWorkflow.metadata.description = data.description;
      fullWorkflow.metadata.updatedAt = Date.now();

      await updateWorkflow(editingWorkflow.id, fullWorkflow);
      fetchWorkflows();
    } catch (error) {
      console.error("Failed to update workflow metadata", error);
      alert("Failed to update workflow");
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await deleteWorkflow(id);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete workflow");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Workflows
          </h1>
          <button
            onClick={() => {
              setEditingWorkflow(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Plus size={18} />
            New Workflow
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => router.push(`/workflows/${wf.id}`)}
              className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-neutral-600 transition-all cursor-pointer group relative"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-neutral-800 rounded">
                    <MoreVertical size={16} className="text-neutral-400" />
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-neutral-900 border border-neutral-800 rounded-box w-32 mt-2">
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorkflow(wf);
                          setIsModalOpen(true);
                        }}
                        className="text-sm hover:bg-neutral-800 text-neutral-300 flex gap-2 items-center w-full px-2 py-1 rounded"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={(e) => handleDelete(e, wf.id)}
                        className="text-sm hover:bg-red-900/30 text-red-400 flex gap-2 items-center w-full px-2 py-1 rounded"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors pr-6">
                {wf.name}
              </h3>
              <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                {wf.description || "No description"}
              </p>
              <div className="flex items-center text-xs text-neutral-600 gap-2">
                <span>{new Date(wf.updatedAt).toLocaleDateString()}</span>
                <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="col-span-full py-20 text-center text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800 border-dashed">
              <p>No workflows found. Create one to get started.</p>
            </div>
          )}
        </div>

        <WorkflowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={editingWorkflow ? handleUpdate : handleCreate}
          initialData={editingWorkflow ? { name: editingWorkflow.name, description: editingWorkflow.description } : undefined}
          title={editingWorkflow ? "Edit Workflow" : "Create Workflow"}
        />
      </div>
    </div>
  );
}
