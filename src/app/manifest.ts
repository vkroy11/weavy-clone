import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Weavy — Visual AI Workflow Builder',
    short_name: 'Weavy',
    description:
      'Drag nodes. Connect them. Run AI workflows. Build text + image pipelines on a visual canvas powered by Gemini and OpenAI.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
