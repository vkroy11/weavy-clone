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
        label: 'eBay Listing Generator', 
        model: 'gemini-1.5-flash',
        systemPrompt: 'You are an expert e-commerce copywriter. Create a compelling eBay listing including a title, key features, and a persuasive description based on the provided inputs.'
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

