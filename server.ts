import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Logging middleware to debug requests
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.url}`);
    }
    next();
  });

  // Health check/Status route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route for License Plate Scanning
  app.post("/api/scan-plate", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      // Support both GEMINI_API_KEY and VITE_GEMINI_API_KEY for compatibility
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!apiKey || apiKey === 'your_actual_gemini_api_key_here') {
        console.error("Missing Gemini API Key in environment.");
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      if (!imageBase64) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const genAI = new GoogleGenAI(apiKey);
      // Use a more widely compatible model alias if needed, but 2.0-flash is great
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: "Hãy trích xuất chính xác biển số xe từ hình ảnh này. Chỉ trả về chuỗi biển số (ví dụ: 59A-123.45). Không thêm bất kỳ ghi chú hay văn bản nào khác. Nếu không tìm thấy, trả về 'NOT_FOUND'." }
          ]
        }]
      });

      const plate = result.response.text().trim();
      console.log(`[API Success] Scanned plate: ${plate}`);
      res.json({ plate });
    } catch (error: any) {
      console.error("[API Error] Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to scan license plate" });
    }
  });

  // Vite middleware for development (MUST be after API routes)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
