export type Provider = 'gemini' | 'openai';
export type ModelCapability = 'image' | 'text';
export type ImagenMethod = 'generateContent' | 'predict';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: Provider;
  capability: ModelCapability;
  /** How the model generates images on the Gemini API */
  method?: ImagenMethod;
}

export const MODEL_REGISTRY: ModelDefinition[] = [
  // Google — Gemini native image generation (uses generateContent)
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', provider: 'gemini', capability: 'image', method: 'generateContent' },
  // Google — Imagen models (use predict REST endpoint)
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0', provider: 'gemini', capability: 'image', method: 'predict' },
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4.0 Fast', provider: 'gemini', capability: 'image', method: 'predict' },
  // OpenAI — DALL-E
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', capability: 'image' },
  { id: 'dall-e-2', name: 'DALL-E 2', provider: 'openai', capability: 'image' },
];

export function getAvailableModels(configuredProviders: Provider[]): ModelDefinition[] {
  return MODEL_REGISTRY.filter(m => configuredProviders.includes(m.provider));
}

export function getModelDefinition(modelId: string): ModelDefinition | undefined {
  return MODEL_REGISTRY.find(m => m.id === modelId);
}
