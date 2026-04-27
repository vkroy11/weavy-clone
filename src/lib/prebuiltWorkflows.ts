export const PRODUCT_LISTING_GENERATOR = {
  nodes: [
    {
      id: 'product-image',
      type: 'imageNode',
      position: { x: 50, y: 150 },
      data: { label: 'Product Photo', value: null },
    },
    {
      id: 'product-details',
      type: 'textNode',
      position: { x: 50, y: 400 },
      data: { label: 'Product Details', value: 'High-quality wireless noise-canceling headphones' },
    },
    {
      id: 'generator',
      type: 'llmNode',
      position: { x: 450, y: 250 },
      data: {
        label: 'Product Hero Image',
        // Leave model unset so LLMNode picks the first available image model
        // for whichever provider the user has a key for. Hardcoding a model id
        // here breaks every time the registry changes.
        systemPrompt:
          'Studio product photography, clean white background, soft directional lighting, subtle reflection beneath the product, premium e-commerce hero look. Centred, square framing, minimal shadow, high detail.',
      },
    },
  ],
  edges: [
    { 
      id: 'e1', 
      source: 'product-image', 
      target: 'generator', 
      animated: true, 
      style: { stroke: '#8b5cf6', strokeWidth: 2 } 
    },
    { 
      id: 'e2', 
      source: 'product-details', 
      target: 'generator', 
      animated: true, 
      style: { stroke: '#8b5cf6', strokeWidth: 2 } 
    },
  ],
};

