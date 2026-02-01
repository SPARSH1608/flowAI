# AI Ads - Frontend Workflow Documentation

This document provides a comprehensive overview of the **Frontend Workflow Editor** implementation, including its architecture, state management, and component breakdown.

## 🏗 System Architecture

The workflow editor is built using **Next.js**, **React Flow**, and **Zustand**. It provides a canvas-based interface where users can drag-and-drop nodes, connect them via typed ports, and configure properties to build AI generation pipelines.

### Key Components

1.  **WorkflowCanvas (`src/components/canvas/WorkflowCanvas.tsx`)**
    *   The core component that renders the React Flow instance.
    *   Handles default canvas behaviors: pan, zoom, background grid, and MiniMap.
    *   Manages user interactions: node selection, connection creation, and deletion events.
    *   Implements the "Delete Mode" (scissors tool) logic.

2.  **FloatingSidebar (`src/components/panels/FloatingSidebar.tsx`)**
    *   A dock-style sidebar for accessing tools.
    *   **Play Button**: Opens the "Add Node" panel.
    *   **Scissors Button**: Toggles the global "Delete Mode".
    *   Contains the node palette for dragging new nodes onto the canvas (Text, Image Gen, Assistant, etc.).

3.  **WorkflowStore (`src/store/workflowStore.ts`)**
    *   A global Zustand store that persists the graph state to `localStorage`.
    *   **State**:
        *   `nodes`: Array of all active nodes with their position and config data.
        *   `edges`: Array of connections between nodes.
        *   `deleteMode`: Boolean flag for the scissors tool.
    *   **Actions**: `addNode`, `deleteNode`, `deleteEdge`, `hydrate` (load from storage).

---

## 🧩 Nodes & Components

All nodes serve as wrapper components around `BaseNode`, maintaining a consistent visual style (dark theme, rounded corners, "premium" look).

### 1. Base Components

*   **BaseNode (`src/components/nodes/BaseNode.tsx`)**
    *   The container for all specific nodes.
    *   Handles selection state (blue border/glow).
    *   Provides common UI elements: Header with title & icon, Status Badge, Resizer handle.
    *   Displays a floating toolbar when selected (Delete button, Play button).

*   **ExternalPort (`src/components/ports/ExternalPort.tsx`)**
    *   Custom connection handle component.
    *   **Visuals**: Renders completely outside the node body as a small, minimal "socket" circle.
    *   **Interactivity**: Shows a tooltip on hover with the port type name.
    *   **Types**: Supports different visual themes for `text` (Green), `image` (Blue), `video` (Purple), etc.

### 2. Node Types

The following nodes are currently registered and implemented:

| Node Type | Component | Description | Inputs | Outputs |
| :--- | :--- | :--- | :--- | :--- |
| **TEXT_NODE** | `TextNode` | Basic text input block. | - | `text` |
| **IMAGE_NODE** | `ImageNode` | Displays an uploaded or generated image. | - | `image` |
| **IMAGE_GENERATION_NODE** | `ImageGenerationNode` | Configures AI image generation (Prompt, Size, Steps). | `text` (Prompt)<br>`image[]` (Ref) | `image[]` |
| **ASSISTANT_NODE** | `AssistantNode` | LLM-powered chat or instruction block. | `text`<br>`image[]` | `text` |

### 3. Edges

*   **DeletableEdge (`src/components/edges/DeletableEdge.tsx`)**
    *   The default edge type.
    *   Renders a connection line with dynamic colors based on the source port type (e.g., Green line for text connections).
    *   Shows a clickable `X` button when selected to easily remove connections.

---

## 🖌 UX Fundamentals

### Visual Style
*   **Theme**: Deep Dark Mode (`bg-[#0a0a0a]`).
*   **Palette**: Muted, professional colors ("Dull" aesthetic).
    *   Text: `#52796F`
    *   Image: `#5C7C99`
    *   Video: `#7B6496`
*   **Typography**: Clean, uppercase labels with tracking for a technical feel.

### Interaction Modes
1.  **Standard Mode**:
    *   Drag nodes to move.
    *   Drag from ports to connect.
    *   Click to select (shows toolbar).
2.  **Delete Mode (Scissors)**:
    *   Activated via the Sidebar.
    *   Cursor changes to a red scissors icon.
    *   Clicking ANY node or edge instantly deletes it.
    *   Automatically turns off after one use to prevent accidents.

---

## 🛠 Adding New Nodes

To add a new node type:

1.  **Create Component**: Create a new file in `src/components/nodes/` (e.g., `MyNewNode.tsx`).
2.  **Use BaseNode**: Wrap your content in `<BaseNode>`.
3.  **Add Ports**: Use `<ExternalPort>` for inputs (Left) and outputs (Right).
4.  **Register**: Import and add it to `nodeTypes` in `src/components/nodes/index.ts`.
5.  **Define Type**: Add the type string key to `NodeType` in `src/types/workflow.ts`.
6.  **Add to Sidebar**: Create a `<NodeButton>` entry in `FloatingSidebar.tsx`.
