import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGeminiModel, parseBase64Image } from '@/lib/gemini';
import { createOpenAIClient, generateImageWithDallE } from '@/lib/openai';
import { getModelDefinition } from '@/lib/models';

const RunWorkflowSchema = z.object({
  model: z.string(),
  provider: z.enum(['gemini', 'openai']),
  apiKey: z.string().optional(),
  systemPrompt: z.string().optional(),
  inputs: z.array(z.object({
    type: z.enum(['text', 'image']),
    value: z.string(),
  })),
});

/**
 * Call the Imagen predict REST API (for imagen-* models that don't support generateContent).
 */
async function generateWithImagen(modelId: string, prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `Imagen API error (${res.status})`);
  }

  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new Error('No image returned from Imagen model.');
  }

  return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
}

export async function POST(req: NextRequest) {
  let requestedModel = '';

  try {
    const body = await req.json();
    const { model, provider, apiKey, systemPrompt, inputs } = RunWorkflowSchema.parse(body);
    requestedModel = model;

    // --- OpenAI Provider ---
    if (provider === 'openai') {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        return NextResponse.json(
          { error: 'OpenAI API key is not configured. Add it in Settings.' },
          { status: 400 }
        );
      }

      const client = createOpenAIClient(key);
      const prompt = [
        systemPrompt ? `INSTRUCTIONS: ${systemPrompt}` : '',
        ...inputs.map(i => i.type === 'text' ? i.value : '').filter(Boolean),
      ].filter(Boolean).join('\n\n');

      if (!prompt) {
        return NextResponse.json({ error: 'No text input provided for image generation' }, { status: 400 });
      }

      const dataUrl = await generateImageWithDallE(client, model, prompt);
      return NextResponse.json({ value: dataUrl });
    }

    // --- Gemini Provider ---
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Add it in Settings or set GEMINI_API_KEY in .env' },
        { status: 500 }
      );
    }

    const modelDef = getModelDefinition(model);

    // Imagen models use the predict REST endpoint
    if (modelDef?.method === 'predict') {
      const prompt = [
        systemPrompt ? `INSTRUCTIONS: ${systemPrompt}` : '',
        ...inputs.map(i => i.type === 'text' ? i.value : '').filter(Boolean),
      ].filter(Boolean).join('\n\n');

      if (!prompt) {
        return NextResponse.json({ error: 'No text input provided for image generation' }, { status: 400 });
      }

      const dataUrl = await generateWithImagen(model, prompt, geminiKey);
      return NextResponse.json({ value: dataUrl });
    }

    // Gemini image models use generateContent with responseModalities
    const isImageModel = model.includes('image') || model.includes('imagen');

    if (isImageModel) {
      const genAI = await import('@google/generative-ai');
      const client = new genAI.GoogleGenerativeAI(geminiKey);
      const geminiModel = client.getGenerativeModel({
        model: model.startsWith('models/') ? model : `models/${model}`,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        } as any,
      });

      const prompt = [
        systemPrompt ? `INSTRUCTIONS: ${systemPrompt}` : '',
        ...inputs.map(i => i.value)
      ].filter(Boolean).join('\n\n');

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

      if (!imagePart || !imagePart.inlineData) {
        const blobPart = candidate?.content?.parts?.find(p => (p as any).blob);
        if (blobPart && (blobPart as any).blob) {
          return NextResponse.json({
            value: `data:${(blobPart as any).blob.mimeType};base64,${(blobPart as any).blob.data}`
          });
        }
        throw new Error('No image was generated. The model may not support image generation or your prompt was rejected.');
      }

      return NextResponse.json({
        value: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      });
    }

    // Text generation (non-image Gemini models)
    const geminiModel = getGeminiModel(model, systemPrompt, geminiKey);
    const parts: any[] = [];

    if (systemPrompt) {
      parts.push({ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\n---\n\n` });
    }

    for (const input of inputs) {
      if (input.type === 'text') {
        parts.push({ text: input.value });
      } else if (input.type === 'image') {
        const imageData = parseBase64Image(input.value);
        if (imageData) {
          parts.push(imageData);
        }
      }
    }

    if (parts.length === 0) {
      return NextResponse.json(
        { error: 'No input provided' },
        { status: 400 }
      );
    }

    const result = await geminiModel.generateContent({ contents: [{ role: 'user', parts }] });
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ output: text });
  } catch (error: any) {
    console.error('API Error:', error);

    let message = error.message || 'Unknown error';
    if (message.includes('404')) {
      message = `Model "${requestedModel}" not found. It may not be available in your region or your API key may not have access. Try a different model.`;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
