import { Handler } from "@netlify/functions";
import * as genai from "@google/genai";

// Defensively handle different import styles
const GoogleGenAI = genai.GoogleGenAI || (genai as any).default?.GoogleGenAI;

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    const { imageBase64 } = JSON.parse(event.body || "{}");
    let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_actual_gemini_api_key_here') {
      console.error("Missing Gemini API Key in Netlify environment.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GEMINI_API_KEY is not configured on Netlify." }),
      };
    }

    // Ensure API Key has the "AQ." prefix if it's missing
    if (apiKey && !apiKey.startsWith('AQ.')) {
      apiKey = `AQ.${apiKey}`;
    }

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data provided" }),
      };
    }

    // Initialize AI with safety check
    const genAI = new GoogleGenAI(apiKey);
    
    if (!genAI || typeof genAI.getGenerativeModel !== 'function') {
      throw new Error(`SDK Initialization failed: getGenerativeModel is not a function. SDK structure: ${Object.keys(genAI || {}).join(', ')}`);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: "Hãy trích xuất chính xác biển số xe từ hình ảnh này. Chỉ trả về chuỗi biển số (ví dụ: 59A-123.45). Không thêm bất kỳ ghi chú hay văn bản nào khác. Nếu không tìm thấy, trả về 'NOT_FOUND'." }
        ]
      }]
    });

    const plate = result.response.text().trim();
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate }),
    };
  } catch (error: any) {
    console.error("[Netlify Function Error]:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to scan license plate" }),
    };
  }
};
