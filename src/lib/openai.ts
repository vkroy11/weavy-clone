import OpenAI from 'openai';

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export async function generateImageWithDallE(
  client: OpenAI,
  model: string,
  prompt: string,
): Promise<string> {
  const response = await client.images.generate({
    model,
    prompt,
    n: 1,
    size: '1024x1024',
    quality: model === 'dall-e-3' ? 'standard' : undefined,
    response_format: 'b64_json',
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('No image data returned from OpenAI');
  }
  return `data:image/png;base64,${b64}`;
}
