"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { createWorkflow, updateWorkflow, deleteWorkflow } from "@/utils/workflow";
import WorkflowModal from "@/components/modals/WorkflowModal";
import LandingPage from "@/components/landing/LandingPage";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";

export default function Page() {
  const { user, token, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <DashboardPage token={token!} />;
}

function DashboardPage({ token }: { token: string }) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  function fetchWorkflows() {
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWorkflows(data);
        } else {
          console.error("Expected array for workflows, got:", data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
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

    const result = await createWorkflow(defaultWorkflow, token);
    if (result.id) {
      router.push(`/workflows/${result.id}`);
    }
  }

  async function handleUpdate(data: { name: string; description?: string }) {
    if (!editingWorkflow) return;

    try {
      const updatePayload = {
        metadata: {
          name: data.name,
          description: data.description,
          updatedAt: Date.now(),
        }
      };

      await updateWorkflow(editingWorkflow.id, updatePayload, token);

      // Update state locally (No GET request needed!)
      setWorkflows(workflows.map(w =>
        w.id === editingWorkflow.id
          ? { ...w, name: data.name, description: data.description, updatedAt: updatePayload.metadata.updatedAt }
          : w
      ));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update workflow metadata", error);
      alert("Failed to update workflow");
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await deleteWorkflow(id, token);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete workflow");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 tracking-tight">
            Workflows
          </h1>
          <div className="flex items-center gap-4">
            <UserMenu />
            <div className="h-4 w-px bg-neutral-200 mx-1" />
            <button
              onClick={() => {
                setEditingWorkflow(null);
                setIsModalOpen(true);
              }}
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>New Workflow</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-neutral-500">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm font-medium">Fetching your workflows...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => router.push(`/workflows/${wf.id}`)}
                className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 hover:border-neutral-300 transition-all cursor-pointer group relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-neutral-100 rounded">
                      <MoreVertical size={16} className="text-neutral-500" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-white border border-neutral-200 rounded-box w-32 mt-2">
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkflow(wf);
                            setIsModalOpen(true);
                          }}
                          className="text-sm hover:bg-neutral-100 text-neutral-700 flex gap-2 items-center w-full px-2 py-1 rounded"
                        >
                          <Edit size={14} /> Edit
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(e) => handleDelete(e, wf.id)}
                          className="text-sm hover:bg-red-50 text-red-600 flex gap-2 items-center w-full px-2 py-1 rounded"
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
              <div className="col-span-full py-20 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
                <p>No workflows found. Create one to get started.</p>
              </div>
            )}
          </div>
        )}

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
