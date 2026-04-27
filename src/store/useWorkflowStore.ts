import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

function defaultName(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `Workflow ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type WorkflowState = {
  // Canvas
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;

  // Session metadata (the "current workflow" being auto-saved)
  currentWorkflowId: string | null;
  currentWorkflowName: string;
  saveState: SaveState;
  lastSavedAt: number | null;
  saveError: string | null;
  setCurrentWorkflowId: (id: string | null) => void;
  setCurrentWorkflowName: (name: string) => void;
  setSaveState: (state: SaveState, opts?: { error?: string | null; savedAt?: number }) => void;

  // High-level operations
  loadWorkflow: (workflow: { id: string; name: string; nodes: Node[]; edges: Edge[] }) => void;
  newWorkflow: () => void;

  // History for Undo/Redo
  past: { nodes: Node[]; edges: Edge[] }[];
  future: { nodes: Node[]; edges: Edge[] }[];
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],

  currentWorkflowId: null,
  currentWorkflowName: defaultName(),
  saveState: 'idle',
  lastSavedAt: null,
  saveError: null,

  setCurrentWorkflowId: (id) => set({ currentWorkflowId: id }),
  setCurrentWorkflowName: (name) => set({ currentWorkflowName: name, saveState: 'dirty' }),
  setSaveState: (state, opts) =>
    set({
      saveState: state,
      saveError: opts?.error ?? null,
      lastSavedAt: opts?.savedAt ?? get().lastSavedAt,
    }),

  loadWorkflow: ({ id, name, nodes, edges }) =>
    set({
      currentWorkflowId: id,
      currentWorkflowName: name,
      nodes,
      edges,
      past: [],
      future: [],
      saveState: 'saved',
      lastSavedAt: Date.now(),
      saveError: null,
    }),

  newWorkflow: () =>
    set({
      currentWorkflowId: null,
      currentWorkflowName: defaultName(),
      nodes: [],
      edges: [],
      past: [],
      future: [],
      saveState: 'idle',
      lastSavedAt: null,
      saveError: null,
    }),

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    set({
      past: [
        ...past,
        {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        },
      ].slice(-20),
      future: [],
    });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future],
      saveState: 'dirty',
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: newFuture,
      saveState: 'dirty',
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const next = applyNodeChanges(changes, get().nodes);
    // Treat as dirty only when something materially changed (position drag,
    // add, remove, dimensions). Simple selection toggles still mark dirty
    // because reactflow includes a 'select' change with each click — that's
    // fine for our debounced auto-save.
    set({ nodes: next, saveState: 'dirty' });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      saveState: 'dirty',
    });
  },

  onConnect: (connection: Connection) => {
    get().takeSnapshot();
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
          type: 'default',
        },
        get().edges,
      ),
      saveState: 'dirty',
    });
  },

  setNodes: (nodes: Node[]) => set({ nodes, saveState: 'dirty' }),
  setEdges: (edges: Edge[]) => set({ edges, saveState: 'dirty' }),

  addNode: (node: Node) => {
    get().takeSnapshot();
    set({ nodes: [...get().nodes, node], saveState: 'dirty' });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
      saveState: 'dirty',
    });
  },
}));
