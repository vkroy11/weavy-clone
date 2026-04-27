import { z } from 'zod';

/**
 * Workflow schemas shared by save/load API routes and the client.
 *
 * The `data` field on each node is intentionally `z.record(z.unknown())` — node
 * implementations carry arbitrary keys (text values, image data URLs, model
 * outputs) and a stricter shape would either accept too little or churn every
 * time a node gets a new field. For everything else, the structure is real.
 */
export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.unknown()).optional(),
  // ReactFlow attaches some extras when serialising; allow them through.
  width: z.number().optional(),
  height: z.number().optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
  positionAbsolute: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  style: z.record(z.string(), z.unknown()).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const SaveWorkflowSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, 'clientId is required'),
  name: z.string().min(1).max(120),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export const DeleteWorkflowSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
});

export type SavedWorkflow = z.infer<typeof SaveWorkflowSchema>;
