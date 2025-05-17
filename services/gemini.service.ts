import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private readonly apiKey: string;
  private readonly genAi: any;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.genAi = new GoogleGenerativeAI(this.apiKey);
  }

  async labelContent(content: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `Label this content for semantic anaylis. positive, negative or neutral. No other text, just the label : ${content},`,
    });

    return response.text?.trim() || "";
  }

  async labelImage(base64: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: [
          {
            inlineData: {
              data: base64,
              mimeType: "image/jpeg",
            },
          },
          {
            text: "Label this image for search by image. Please mind the brand name. No Yapping. If it has no brand, just give me common name. Return only the label that can be used for product search. This is for a computer ecommerce website. If it is a set of products, please give me pc gaming or office pc. If it is a single product, please label like gaming mouse or office monitor. If you detect the brand only return the brand name. No other text, just the label.",
          },
        ],
      });

      const text = result.text;

      if (text) {
        return text.trim();
      } else {
        throw new Error("No label found");
      }
    } catch (error) {
      console.error("Error labeling image:", error);
      throw new Error("Failed to label image");
    }
  }
}

export default new GeminiService();
