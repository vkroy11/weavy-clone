import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useApiTokenStore } from '@/store/useApiTokenStore';
import { getModelDefinition } from '@/lib/models';
import { Node } from 'reactflow';

export const useWorkflowExecution = () => {
  const { nodes, edges, updateNodeData } = useWorkflowStore();
  const { getToken } = useApiTokenStore();

  const runWorkflow = async () => {
    const llmNodes = nodes.filter((n) => n.type === 'llmNode');

    for (const node of llmNodes) {
      await executeLLMNode(node);
    }
  };

  const executeLLMNode = async (node: Node) => {
    updateNodeData(node.id, { loading: true, error: null, output: null, value: null });

    try {
      const incomingEdges = edges.filter((e) => e.target === node.id);
      const inputs: { type: 'text' | 'image'; value: string }[] = [];

      for (const edge of incomingEdges) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (!sourceNode) continue;

        if (sourceNode.type === 'textNode' && sourceNode.data.value) {
          inputs.push({ type: 'text', value: sourceNode.data.value });
        } else if (sourceNode.type === 'imageNode' && sourceNode.data.value) {
          inputs.push({ type: 'image', value: sourceNode.data.value });
        } else if (sourceNode.type === 'llmNode' && sourceNode.data.output) {
          inputs.push({ type: 'text', value: sourceNode.data.output });
        }
      }

      if (inputs.length === 0) {
        throw new Error('No input data found from connected nodes');
      }

      const modelId = node.data.model || 'imagen-4.0-generate-001';
      const modelDef = getModelDefinition(modelId);
      const provider = modelDef?.provider || 'gemini';
      const apiKey = getToken(provider);

      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          provider,
          apiKey,
          systemPrompt: node.data.systemPrompt,
          inputs,
        }),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute node');
      }

      updateNodeData(node.id, {
        value: result.value,
        output: result.output,
        loading: false
      });
    } catch (error: any) {
      updateNodeData(node.id, { error: error.message, loading: false });
    }
  };

  return { runWorkflow };
};
