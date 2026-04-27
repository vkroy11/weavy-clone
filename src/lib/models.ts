export type Provider = 'gemini' | 'openai';
export type ModelCapability = 'image' | 'text';
export type ImagenMethod = 'generateContent' | 'predict';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: Provider;
  capability: ModelCapability;
  /** Whether this model accepts an image as input (image-to-image). */
  acceptsImageInput: boolean;
  /** How the model generates images on the Gemini API. Defaults to generateContent. */
  method?: ImagenMethod;
  /** Optional short tag shown next to the model name (e.g. "Recommended", "Fast"). */
  tag?: string;
}

/**
 * Verified against Google AI and OpenAI docs on 2026-04-27.
 *
 * Notable removals:
 *  - `gemini-2.5-flash-image` — superseded by 3.1 Flash Image; some keys can't reach it.
 *  - `dall-e-3` / `dall-e-2` — OpenAI shutdown is 2026-05-12.
 *
 * Imagen 4 is GA today but Google has announced a deprecation path toward the
 * Gemini "Nano Banana" family. Keeping it for now since it's still callable.
 */
export const MODEL_REGISTRY: ModelDefinition[] = [
  // Google — Gemini native image generation (Nano Banana family)
  {
    id: 'gemini-3.1-flash-image-preview',
    name: 'Nano Banana 2 (Gemini 3.1 Flash Image)',
    provider: 'gemini',
    capability: 'image',
    method: 'generateContent',
    acceptsImageInput: true,
    tag: 'Recommended',
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana Pro (Gemini 3 Pro Image)',
    provider: 'gemini',
    capability: 'image',
    method: 'generateContent',
    acceptsImageInput: true,
    tag: 'Pro',
  },
  // Google — Imagen 4 (text-to-image only, REST predict endpoint)
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4',
    provider: 'gemini',
    capability: 'image',
    method: 'predict',
    acceptsImageInput: false,
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4 Fast',
    provider: 'gemini',
    capability: 'image',
    method: 'predict',
    acceptsImageInput: false,
    tag: 'Fast',
  },
  // OpenAI — current image generation API (gpt-image-1 family)
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    provider: 'openai',
    capability: 'image',
    acceptsImageInput: true,
  },
  {
    id: 'gpt-image-1-mini',
    name: 'GPT Image 1 Mini',
    provider: 'openai',
    capability: 'image',
    acceptsImageInput: true,
    tag: 'Cheap',
  },
];

export function getAvailableModels(configuredProviders: Provider[]): ModelDefinition[] {
  return MODEL_REGISTRY.filter(m => configuredProviders.includes(m.provider));
}

export function getModelDefinition(modelId: string): ModelDefinition | undefined {
  return MODEL_REGISTRY.find(m => m.id === modelId);
}
