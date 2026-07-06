import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// REST APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Audio Tool: Transcribe & Enhance Story
app.post("/api/story/enhance", async (req, res) => {
  try {
    const { storyTitle, transcriptText, promptType } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        summary: "This is a captivating summary of your story, showing its emotional peak, underlying theme of self-determination, and crypto native elements. (Gemini API key is unconfigured, using fallback AI template)",
        enhancedTranscript: `[Enhanced Voiceover Intro: Soft ambient futuristic music swells]\n\n${transcriptText || "Once upon a time on Solana..."}\n\n[Outro: Fade out into decentralized echoes]`,
        suggestedTags: ["SolanaStory", "Cyberpunk", "VoiceOwnership", "EchoesNFT"],
        tokenMetrics: {
          recommendedSymbol: (storyTitle || "ECHO").toUpperCase().replace(/\s+/g, "").substring(0, 5),
          bondingCurveStart: "0.05 SOL",
          royaltyFee: "5%",
        }
      });
    }

    let systemPrompt = "You are Echoes AI, an expert storytelling and narrative director for Web3 audio creators. Your goal is to analyze transcripts, enhance them with narrative flow, and generate engaging summaries, tags, and token recommendations.";
    let userPrompt = "";

    if (promptType === "enhance") {
      userPrompt = `Please enhance this story transcript for vocal recording. Add narrative flow, pacing markers (like [Pause], [Inhale], [Tone: Whispering]), and fix any spelling/grammar errors without changing the core personality of the story.
Story Title: "${storyTitle || "Untitled Echo"}"
Transcript: "${transcriptText || ""}"`;
    } else {
      userPrompt = `Please summarize and analyze this story transcript. Generate a concise and gripping story summary, list 4 highly relevant tags, and recommend a token ticker symbol based on the title.
Story Title: "${storyTitle || "Untitled Echo"}"
Transcript: "${transcriptText || ""}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A compact, captivating 2-sentence summary of the audio story." },
            enhancedTranscript: { type: Type.STRING, description: "The transcript enhanced with pacing cues and narration guides." },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 4 metadata tags for the story.",
            },
            recommendedTicker: { type: Type.STRING, description: "A recommended 3-5 letter ticker symbol representing this story's token." },
          },
          required: ["summary", "enhancedTranscript", "suggestedTags", "recommendedTicker"],
        }
      }
    });

    const resultText = response.text?.trim() || "{}";
    const data = JSON.parse(resultText);

    res.json({
      success: true,
      summary: data.summary,
      enhancedTranscript: data.enhancedTranscript,
      suggestedTags: data.suggestedTags,
      tokenMetrics: {
        recommendedSymbol: data.recommendedTicker,
        bondingCurveStart: "0.05 SOL",
        royaltyFee: "5%",
      }
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process audio narrative" });
  }
});

// Setup Vite Dev Server / Static Asset Hosting
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
