"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const genai_1 = require("@google/genai");
class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || "";
        this.genAi = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
    }
    labelContent(content) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const ai = new genai_1.GoogleGenAI({ apiKey: this.apiKey });
            const response = yield ai.models.generateContent({
                model: "gemini-2.0-flash-lite",
                contents: `Label this content for semantic anaylis. positive, negative or neutral. No other text, just the label : ${content},`,
            });
            return ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "";
        });
    }
    labelImage(base64) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ai = new genai_1.GoogleGenAI({ apiKey: this.apiKey });
                const result = yield ai.models.generateContent({
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
                }
                else {
                    throw new Error("No label found");
                }
            }
            catch (error) {
                console.error("Error labeling image:", error);
                throw new Error("Failed to label image");
            }
        });
    }
}
exports.default = new GeminiService();
