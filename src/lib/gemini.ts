import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiModel = (modelId: string, systemInstruction?: string, apiKey?: string) => {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(key);

  // Ensure the modelId has the 'models/' prefix if it's missing
  const fullModelId = modelId.startsWith('models/') ? modelId : `models/${modelId}`;

  return genAI.getGenerativeModel({
    model: fullModelId,
    systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined
  });
};

export const parseBase64Image = (base64String: string) => {
  const match = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  return {
    inlineData: {
      data: match[2],
      mimeType: match[1],
    },
  };
};
