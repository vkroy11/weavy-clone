import OpenAI, { toFile } from 'openai';

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

/**
 * Strip the `data:image/...;base64,` prefix and return raw bytes + mime type.
 * Matches the same data-URL shape produced by ImageNode's FileReader.
 */
function dataUrlToBytes(dataUrl: string): { bytes: Buffer; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], bytes: Buffer.from(match[2], 'base64') };
}

/**
 * Generate or edit an image with the gpt-image-1 family.
 *
 * - No `imageInputs` → calls `images.generate` (text-to-image).
 * - With `imageInputs` → calls `images.edit` (image-to-image / image-with-references).
 *
 * The legacy DALL·E-only options (`response_format`, `quality: 'standard'`) are
 * dropped — gpt-image-1 returns base64 by default and uses different quality
 * enums, so passing the old shape causes 400s.
 */
export async function generateImageWithOpenAI(
  client: OpenAI,
  model: string,
  prompt: string,
  imageInputs: string[] = [],
): Promise<string> {
  if (imageInputs.length === 0) {
    const response = await client.images.generate({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
    });
    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('OpenAI returned no image. Try rephrasing the prompt.');
    }
    return `data:image/png;base64,${b64}`;
  }

  // Image-to-image: feed each wired image into the edits endpoint as a
  // multipart-friendly File object. The first image is the primary; any
  // extras become additional context references.
  const fileBag = await Promise.all(
    imageInputs.map(async (dataUrl, i) => {
      const decoded = dataUrlToBytes(dataUrl);
      if (!decoded) {
        throw new Error(`Image input #${i + 1} has an unrecognised data URL.`);
      }
      const ext = decoded.mimeType.split('/')[1]?.split('+')[0] || 'png';
      return toFile(decoded.bytes, `input-${i + 1}.${ext}`, { type: decoded.mimeType });
    }),
  );

  const response = await client.images.edit({
    model,
    prompt,
    n: 1,
    size: '1024x1024',
    image: fileBag.length === 1 ? fileBag[0] : fileBag,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI returned no image. Try rephrasing the prompt.');
  }
  return `data:image/png;base64,${b64}`;
}
