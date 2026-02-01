"use client";

import { useState } from "react";

export default function AdvancedToggle({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="text-xs text-neutral-400 hover:text-neutral-200"
            >
                {open ? "Hide advanced" : "Show advanced"}
            </button>

            {open && (
                <div className="mt-2 space-y-2">
                    {children}
                </div>
            )}
        </div>
    );
}
