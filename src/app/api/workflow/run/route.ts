import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGeminiModel, parseBase64Image } from '@/lib/gemini';
import { createOpenAIClient, generateImageWithOpenAI } from '@/lib/openai';
import { getModelDefinition } from '@/lib/models';

const RunWorkflowSchema = z.object({
  model: z.string(),
  provider: z.enum(['gemini', 'openai']),
  // BYOK only — apiKey is required. There is no system fallback.
  apiKey: z.string().min(1, 'API key is required'),
  systemPrompt: z.string().optional(),
  inputs: z.array(z.object({
    type: z.enum(['text', 'image']),
    value: z.string(),
  })),
});

/**
 * Call the Imagen predict REST API (for imagen-* models that don't support generateContent).
 *
 * Imagen 4 is text-to-image only — image inputs are rejected at the route
 * level before this is reached. The predict response can be:
 *   1. 200 with `predictions[0].bytesBase64Encoded` — happy path.
 *   2. 200 with `predictions[0].raiFilteredReason` — content filtered.
 *   3. 200 with empty `predictions: []` — model returned nothing.
 *   4. non-2xx with `error.message` — request rejected.
 */
async function generateWithImagen(modelId: string, prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        safetyFilterLevel: 'block_only_high',
        personGeneration: 'allow_adult',
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const apiMsg = data?.error?.message || `Imagen API error (${res.status})`;
    throw new Error(apiMsg);
  }

  const prediction = data.predictions?.[0];

  if (!prediction) {
    throw new Error(
      'Imagen returned no prediction. Try a shorter or more concrete prompt, or switch to "Nano Banana 2" which supports image-to-image.',
    );
  }
  if (prediction.raiFilteredReason) {
    throw new Error(
      `Image was blocked by Google's safety filter (${prediction.raiFilteredReason}). Try rephrasing your prompt — avoid named people, sensitive content, or copyrighted characters.`,
    );
  }
  if (!prediction.bytesBase64Encoded) {
    throw new Error(
      'Imagen returned an empty prediction. Try rephrasing your prompt or switch to "Nano Banana 2".',
    );
  }

  return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
}

export async function POST(req: NextRequest) {
  let requestedModel = '';

  try {
    const body = await req.json();
    const parsed = RunWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      const missingKey = parsed.error.issues.some(
        (i) => i.path.join('.') === 'apiKey',
      );
      const message = missingKey
        ? 'API key is required. Open Settings and save a Gemini or OpenAI key.'
        : `Invalid request: ${parsed.error.issues.map((i) => i.message).join('; ')}`;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { model, provider, apiKey, systemPrompt, inputs } = parsed.data;
    requestedModel = model;

    const modelDef = getModelDefinition(model);
    if (!modelDef) {
      return NextResponse.json(
        { error: `Unknown model "${model}". The model registry may have changed — pick a model from the dropdown.` },
        { status: 400 },
      );
    }

    // Modality check — done once for every provider so the user gets the same
    // error regardless of where the model lives. This is what catches the
    // "I wired an image to Imagen and got a weird answer" foot-gun.
    const imageInputs = inputs.filter((i) => i.type === 'image' && i.value);
    if (imageInputs.length > 0 && !modelDef.acceptsImageInput) {
      return NextResponse.json(
        {
          error: `${modelDef.name} is text-to-image only — it can't read your image input. Switch the LLM node to "Nano Banana 2" or another model that accepts image inputs, or disconnect the image node.`,
        },
        { status: 400 },
      );
    }

    // --- OpenAI Provider ---
    if (provider === 'openai') {
      const client = createOpenAIClient(apiKey);
      const textPrompt = [
        systemPrompt ? `INSTRUCTIONS: ${systemPrompt}` : '',
        ...inputs.map((i) => (i.type === 'text' ? i.value : '')).filter(Boolean),
      ].filter(Boolean).join('\n\n');

      if (!textPrompt) {
        return NextResponse.json(
          { error: 'OpenAI image generation needs a text prompt. Connect a text node with your prompt to this LLM node.' },
          { status: 400 },
        );
      }

      const dataUrl = await generateImageWithOpenAI(
        client,
        model,
        textPrompt,
        imageInputs.map((i) => i.value),
      );
      return NextResponse.json({ value: dataUrl });
    }

    // --- Gemini Provider ---
    const geminiKey = apiKey;

    // Imagen models use the predict REST endpoint
    if (modelDef.method === 'predict') {
      const prompt = [
        systemPrompt ? `INSTRUCTIONS: ${systemPrompt}` : '',
        ...inputs.map((i) => (i.type === 'text' ? i.value : '')).filter(Boolean),
      ].filter(Boolean).join('\n\n');

      if (!prompt) {
        return NextResponse.json({ error: 'No text input provided for image generation' }, { status: 400 });
      }

      const dataUrl = await generateWithImagen(model, prompt, geminiKey);
      return NextResponse.json({ value: dataUrl });
    }

    // Gemini multi-modal image models (Nano Banana family) use generateContent
    if (modelDef.capability === 'image') {
      const genAI = await import('@google/generative-ai');
      const client = new genAI.GoogleGenerativeAI(geminiKey);
      const geminiModel = client.getGenerativeModel({
        model: model.startsWith('models/') ? model : `models/${model}`,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        } as any,
      });

      // Multi-modal parts: text inputs → text parts, images → inlineData parts.
      // Concatenating images into the prompt as text is what previously caused
      // the "model never saw my image" symptom.
      //
      // The leading IMAGE_DIRECTIVE forces image output even when the user's
      // systemPrompt is text-shaped (e.g. "you are an e-commerce copywriter").
      // Without it, Nano Banana cheerfully returns prose because the prompt
      // looked like a text task.
      const IMAGE_DIRECTIVE =
        'Generate an image based on the inputs below. Respond with the image only — do not return any text, captions, or commentary. The output must be a single image.';

      const userParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
      for (const input of inputs) {
        if (input.type === 'text' && input.value) {
          userParts.push({ text: input.value });
        } else if (input.type === 'image' && input.value) {
          const img = parseBase64Image(input.value);
          if (img) userParts.push(img);
        }
      }

      if (userParts.length === 0) {
        return NextResponse.json(
          { error: 'No input provided. Connect a text or image node to this LLM node.' },
          { status: 400 },
        );
      }

      const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
        { text: IMAGE_DIRECTIVE },
      ];
      if (systemPrompt) {
        parts.push({ text: `Style and content guidance:\n${systemPrompt}` });
      }
      parts.push(...userParts);

      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: parts as any }],
      });
      const response = await result.response;

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find((p) => p.inlineData);

      if (!imagePart || !imagePart.inlineData) {
        const textReply = candidate?.content?.parts
          ?.map((p) => (typeof p.text === 'string' ? p.text : ''))
          .filter(Boolean)
          .join(' ')
          .trim();
        const finishReason = candidate?.finishReason;

        if (finishReason && finishReason !== 'STOP') {
          throw new Error(
            `${modelDef.name} did not return an image (finishReason: ${finishReason})${textReply ? `: ${textReply}` : ''}. Try rephrasing your prompt.`,
          );
        }
        if (textReply) {
          throw new Error(`${modelDef.name} replied with text instead of an image: "${textReply}". Adjust your prompt to ask for an image directly.`);
        }
        throw new Error(`${modelDef.name} returned no image and no text. The prompt may have been rejected — try rephrasing.`);
      }

      return NextResponse.json({
        value: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      });
    }

    // Text generation (non-image Gemini models — currently no entries in the
    // registry, but kept here for future text-LLM nodes).
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
        if (imageData) parts.push(imageData);
      }
    }

    if (parts.length === 0) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const result = await geminiModel.generateContent({ contents: [{ role: 'user', parts }] });
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ output: text });
  } catch (error: any) {
    console.error('API Error:', error);

    let message = error.message || 'Unknown error';
    if (message.includes('404')) {
      message = `Model "${requestedModel}" not found. Your API key may not have access in your region. Try a different model.`;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
