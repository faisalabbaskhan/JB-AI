import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI, LiveServerMessage, Modality, GenerateVideosOperation } from "@google/genai";
import crypto from "crypto";
import multer from "multer";
import { WebSocketServer } from "ws";
import http from "http";
import { createClient } from "@supabase/supabase-js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let supabaseAdmin: any = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function parseGenAIError(error: any): string {
  const msg = error?.message || String(error);
  if (error?.status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("too_many_requests")) {
    return "Quota or rate limit exceeded. If you are using premium models (Pro, Veo, Lyria), please ensure your API key has billing enabled.";
  }
  if (msg.includes("high demand") || msg.includes("overloaded") || error?.status === 503) {
    return "The AI model is currently experiencing high demand. Please try again in a few moments or switch to a different model.";
  }
  return msg;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json({ limit: '50mb' }));

  // --- Database Simulation ---
  const dbPath = path.join(process.cwd(), "db.json");
  const defaultDb = { users: [], reviews: [] };
  const readDb = () => {
    try {
      if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(defaultDb));
      return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch (e) {
      return defaultDb;
    }
  };
  const writeDb = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  // Default User creation for ease of use
  let db = readDb();
  if (db.users.length === 0) {
    db.users.push({
      id: crypto.randomUUID(),
      name: "Demo User",
      email: "test@jbai.com",
      password: "password123", // Storing plain text just for simulation
      credits: 999999,
      plan: "Pro",
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    writeDb(db);
  }

  // --- Gemini API Setup ---
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }
  } catch (e) {
    console.error("Gemini init error", e);
  }

  // --- API Routes ---
  
  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password } = req.body;
    const db = readDb();
    if (db.users.find((u: any) => u.email === email)) return res.status(400).json({ error: "Email exists" });
    const newUser = { id: crypto.randomUUID(), name, email, password, credits: 10, plan: "Free", isAdmin: false, createdAt: new Date().toISOString() };
    db.users.push(newUser);
    writeDb(db);
    res.json({ user: newUser });
  });

  // User fetch
  app.get("/api/users/:id", (req, res) => {
    const db = readDb();
    const user = db.users.find((u: any) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ user });
  });

  app.get("/api/admin/users", async (req, res) => {
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error("Supabase error:", error);
          return res.status(500).json({ error: error.message });
        }
        res.json({ users: data || [] });
      } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch from Supabase" });
      }
    } else {
      const db = readDb();
      res.json({ users: db.users || [] });
    }
  });

  app.post("/api/billing/upgrade", (req, res) => {
    const { userId, plan } = req.body;
    const db = readDb();
    const idx = db.users.findIndex((u: any) => u.id === userId);
    if (idx < 0) return res.status(404).json({ error: "Not found" });
    db.users[idx].plan = plan;
    db.users[idx].credits = plan === "Free" ? 10 : 999999;
    writeDb(db);
    res.json({ user: db.users[idx] });
  });

  // Reviews
  app.get("/api/reviews", (req, res) => {
    const db = readDb();
    res.json({ reviews: db.reviews || [] });
  });

  app.post("/api/reviews", (req, res) => {
    const { name, text, rating } = req.body;
    const db = readDb();
    if (!db.reviews) db.reviews = [];
    const newReview = { id: crypto.randomUUID(), name, text, rating, date: new Date().toISOString() };
    db.reviews.push(newReview);
    writeDb(db);
    res.json({ review: newReview });
  });

  // AI Tools Route processing images
  app.post("/api/ai/process", upload.single('image'), async (req, res) => {
    const { userId, tool, prompt, aspectRatio, quality, imageSize } = req.body;
    const file = req.file;
    const db = readDb();
    const userIdx = db.users.findIndex((u: any) => u.id === userId);
    
    if (userIdx < 0) return res.status(401).json({ error: "Unauthorized" });
    if (db.users[userIdx].credits <= 0 && db.users[userIdx].plan === "Free") {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    if (!ai) return res.status(500).json({ error: "AI not configured" });

    try {
      let resultBase64 = "";
      
      const modelToUse = quality === 'pro' ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image';
      
      if (tool === "generator") {
        let imageConfig: any = {};
        if (aspectRatio) imageConfig.aspect_ratio = aspectRatio;
        if (imageSize && quality === "pro") imageConfig.image_size = imageSize; // 1K, 2K, 4K

        const interaction = await ai.interactions.create({
          model: modelToUse,
          input: prompt || "A futuristic AI concept",
          response_modalities: ['image'],
          generation_config: { image_config: imageConfig }
        });
        
        for (const step of interaction.steps) {
          if (step.type === 'model_output') {
             const imgPart = step.content?.find(c => c.type === 'image');
             if (imgPart && imgPart.data) {
                resultBase64 = imgPart.data;
             }
          }
        }
      } else if (file) {
        const imgB64 = file.buffer.toString('base64');
        const mimeType = file.mimetype;

        let editPrompt = "Process this image.";
        switch (tool) {
          case "background-remover": editPrompt = "Remove the background of this image, making it pure white or transparent."; break;
          case "enhancer": editPrompt = "Enhance the quality, details, and lighting of this image."; break;
          case "upscaler": editPrompt = "Upscale and sharpen this image to be higher quality."; break;
          case "object-remover": editPrompt = `Remove the unwanted object or person as requested: ${prompt || "clean up the image"}`; break;
          case "restoration": editPrompt = "Restore this old photo, fix scratches, and improve clarity and color."; break;
        }

        const interaction = await ai.interactions.create({
          model: modelToUse,
          input: [
             { type: "image", data: imgB64, mime_type: mimeType },
             { type: "text", text: editPrompt }
          ]
        });

        for (const step of interaction.steps) {
          if (step.type === 'model_output') {
             const imgPart = step.content?.find(c => c.type === 'image');
             if (imgPart && imgPart.data) {
                resultBase64 = imgPart.data;
             }
          }
        }
      } else {
        return res.status(400).json({ error: "Missing image or prompt" });
      }

      if (!resultBase64) throw new Error("No image generated");

      // Decrement credits
      if (db.users[userIdx].plan === "Free") {
        db.users[userIdx].credits -= 1;
        writeDb(db);
      }

      res.json({ 
        success: true, 
        image: `data:image/jpeg;base64,${resultBase64}`,
        credits: db.users[userIdx].credits 
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: parseGenAIError(error) || "Failed to process image." });
    }
  });

  // --- AI: VIDEO GENERATION (Veo 3) ---
  app.post("/api/ai/video-generate", upload.single('image'), async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    try {
       const { prompt, aspectRatio, mode } = req.body;
       const file = req.file;

       const payload: any = {
         model: 'veo-3.1-lite-generate-preview',
         prompt: prompt || 'A cinematic short video',
         config: {
           numberOfVideos: 1,
           resolution: '1080p',
           aspectRatio: aspectRatio || '16:9'
         }
       };

       if (file) {
         payload.image = {
           imageBytes: file.buffer.toString('base64'),
           mimeType: file.mimetype
         };
       }

       const operation = await ai.models.generateVideos(payload);
       res.json({ operationName: operation.name });
    } catch(err: any) {
       console.error(err);
       res.status(500).json({ error: parseGenAIError(err) });
    }
  });

  app.post("/api/ai/video-status", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    try {
      const op = new GenerateVideosOperation();
      op.name = req.body.operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done });
    } catch(err: any) {
      res.status(500).json({ error: parseGenAIError(err) });
    }
  });

  app.post("/api/ai/video-download", async (req, res) => {
    if (!ai || !process.env.GEMINI_API_KEY) return res.status(500).json({ error: "AI not configured" });
    try {
      const op = new GenerateVideosOperation();
      op.name = req.body.operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) return res.status(400).json({ error: "Video URI not found or Video failed" });

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
      });
      res.setHeader('Content-Type', 'video/mp4');
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch(err: any) {
      res.status(500).json({ error: parseGenAIError(err) });
    }
  });

  // --- AI: CHAT & GROUNDING ---
  app.post("/api/ai/chat", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    try {
      const { inputs, modelConfig, systemInstruction, enableThinking, enableMaps, enableSearch } = req.body;
      
      let interactionModel = modelConfig || "gemini-3.1-flash-preview";

      const tools = [];
      if (enableMaps) tools.push({ type: 'google_maps' });
      if (enableSearch) tools.push({ type: 'google_search' });

      // Build payload
      const payload: any = {
        model: interactionModel,
        input: inputs,
        generation_config: {}
      };

      if (enableThinking) {
        payload.generation_config.thinking_level = "high";
      }

      if (systemInstruction) payload.system_instruction = systemInstruction;
      if (tools.length > 0) payload.tools = tools;
      
      const interaction = await ai.interactions.create(payload);

      let fullText = "";
      let thoughts = "";
      for (const step of interaction.steps) {
        if (step.type === 'thought') {
           thoughts += (step.summary || step.signature || "Analyzing...") + "\n";
        }
        if (step.type === 'model_output') {
          const txt = step.content?.find((c: any) => c.type === 'text');
          if (txt) fullText += txt.text;
        }
      }

      res.json({ text: fullText, thoughts });
    } catch (err: any) {
       console.error(err);
       res.status(500).json({ error: parseGenAIError(err) });
    }
  });

  // --- AI: MEDIA ANALYSIS (Audio / Image / Video understanding) ---
  app.post("/api/ai/analyze", upload.single('media'), async (req, res) => {
     if (!ai) return res.status(500).json({ error: "AI not configured" });
     try {
       const file = req.file;
       const { prompt, asAudio } = req.body;

       if (!file) return res.status(400).json({ error: "Missing media file" });

       const modelToUse = asAudio === 'true' ? 'gemini-3.1-flash-preview' : 'gemini-3.1-pro-preview';

       const response = await ai.models.generateContent({
          model: modelToUse,
          contents: {
             parts: [
               { inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype } },
               { text: prompt || "Analyze this media file." }
             ]
          }
       });

       const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
       res.json({ result: text });
     } catch (err: any) {
        res.status(500).json({ error: parseGenAIError(err) });
     }
  });

  // --- AI: MUSIC GENERATION (Lyria) ---
  app.post("/api/ai/music", async (req, res) => {
    if (!ai) return res.status(500).json({ error: "AI not configured" });
    try {
      const { prompt, type } = req.body; // type: 'clip' or 'pro'
      const model = type === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

      const response = await ai.models.generateContentStream({
        model: model,
        contents: prompt || "A cinematic soundtrack",
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      res.json({ audioBase64, mimeType, lyrics });
    } catch(err: any) {
       console.error(err);
       res.status(500).json({ error: parseGenAIError(err) });
    }
  });

  // --- WebSocket Server for Live API ---
  const wss = new WebSocketServer({ server });
  wss.on("connection", async (clientWs) => {
    if (!ai) {
      clientWs.close();
      return;
    }
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: "You are a helpful and intelligent AI voice assistant.",
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch(e) { }
      });

      clientWs.on("close", () => {
         session.close();
      });
    } catch(err) {
       console.error("Live API Error", err);
       clientWs.send(JSON.stringify({ error: parseGenAIError(err) }));
       clientWs.close();
    }
  });

  // Vite middleware for development
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
