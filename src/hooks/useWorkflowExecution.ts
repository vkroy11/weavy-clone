import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useApiTokenStore } from '@/store/useApiTokenStore';
import { getModelDefinition } from '@/lib/models';
import { Node } from 'reactflow';

/**
 * Read whatever an upstream node currently exposes as its "output" and shape
 * it into an input for the downstream node. Image data URLs are kept as
 * images, everything else falls back to text. This is what makes
 * image-to-image chains work: an upstream LLM that generated an image stores
 * a `data:image/...` URL in `data.value`, and we forward it as an image input.
 */
function inputFromSource(
  sourceNode: Node,
): { type: 'text' | 'image'; value: string } | null {
  if (sourceNode.type === 'textNode' && typeof sourceNode.data?.value === 'string') {
    return sourceNode.data.value
      ? { type: 'text', value: sourceNode.data.value }
      : null;
  }
  if (sourceNode.type === 'imageNode' && typeof sourceNode.data?.value === 'string') {
    return sourceNode.data.value
      ? { type: 'image', value: sourceNode.data.value }
      : null;
  }
  if (sourceNode.type === 'llmNode') {
    const value = sourceNode.data?.value;
    const output = sourceNode.data?.output;
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      return { type: 'image', value };
    }
    if (typeof output === 'string' && output.length) {
      return { type: 'text', value: output };
    }
  }
  return null;
}

function nodeLabel(node: Node): string {
  const label = node.data?.label;
  if (typeof label === 'string' && label.trim()) return label;
  return node.id;
}

/**
 * Per-node execution. Each LLM node has its own Run button that calls this
 * hook's `runNode(id)`. Only that node executes — upstream LLMs are NOT
 * auto-run. If an upstream LLM hasn't been run yet, the click is rejected on
 * the clicked node with a clear error pointing the user at the right next
 * step.
 */
export const useWorkflowExecution = () => {
  const runNode = async (nodeId: string) => {
    const { nodes, edges, updateNodeData } = useWorkflowStore.getState();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Don't double-run: the node UI also disables the button while
    // data.loading is true, but a stale click could race the disabled flip.
    if (node.data?.loading) return;

    // Stale-upstream guard: if any incoming edge points at an LLM source that
    // has neither a generated image (data.value) nor a text output, refuse.
    const incoming = edges.filter((e) => e.target === nodeId);
    const staleUpstream: string[] = [];
    const usableInputs: { type: 'text' | 'image'; value: string }[] = [];
    for (const edge of incoming) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) continue;
      if (sourceNode.type === 'llmNode') {
        const v = sourceNode.data?.value;
        const o = sourceNode.data?.output;
        const hasImage = typeof v === 'string' && v.startsWith('data:image/');
        const hasText = typeof o === 'string' && o.length > 0;
        if (!hasImage && !hasText) {
          staleUpstream.push(nodeLabel(sourceNode));
          continue;
        }
      }
      const input = inputFromSource(sourceNode);
      if (input) usableInputs.push(input);
    }

    if (staleUpstream.length > 0) {
      const list = staleUpstream.map((s) => `"${s}"`).join(', ');
      const msg =
        staleUpstream.length === 1
          ? `Upstream LLM ${list} has no output yet. Run that node first.`
          : `Upstream LLMs ${list} have no output yet. Run those nodes first.`;
      updateNodeData(nodeId, {
        error: msg,
        loading: false,
        value: null,
        output: null,
      });
      return;
    }

    if (usableInputs.length === 0) {
      updateNodeData(nodeId, {
        error: `Node "${nodeLabel(node)}" has no usable inputs. Connect a text, image, or upstream LLM node and make sure it has content.`,
        loading: false,
        value: null,
        output: null,
      });
      return;
    }

    updateNodeData(nodeId, {
      loading: true,
      error: null,
      value: null,
      output: null,
    });

    try {
      // Default the model defensively (LLMNode also self-syncs to availableModels[0]).
      const modelId =
        (node.data?.model as string) || 'gemini-3.1-flash-image-preview';
      const modelDef = getModelDefinition(modelId);
      const provider = modelDef?.provider || 'gemini';
      const apiKey = useApiTokenStore.getState().getToken(provider);

      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          provider,
          apiKey,
          systemPrompt: node.data?.systemPrompt,
          inputs: usableInputs,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute node');
      }

      useWorkflowStore.getState().updateNodeData(nodeId, {
        value: result.value,
        output: result.output,
        loading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      useWorkflowStore.getState().updateNodeData(nodeId, {
        error: message,
        loading: false,
      });
    }
  };

  return { runNode };
};
