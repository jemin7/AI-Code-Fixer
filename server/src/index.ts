import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post("/api/review", async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, language, mode, html, css, js } = req.body;

    const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = "";

    if (mode === "web") {
      // 🌐 WEB PROJECT PROMPT
      if (!html && !css && !js) {
        return res
          .status(400)
          .json({ error: "Please provide some code in at least one tab." });
      }

      prompt = `
        You are an expert full-stack web developer. 
        Review the following HTML, CSS, and JavaScript code. They are part of the same project.
        Fix any bugs, ensure they are linked properly, and make sure they work together flawlessly.

        CRITICAL RULES:
        1. If there are no bugs at all, your ONLY output must be exactly: "there is no bug in the code".
        2. If there ARE bugs, output ONLY the completely fixed and working code.
        3. Do NOT wrap the code in Markdown blocks (do not use \`\`\`html or \`\`\`javascript).
        4. When you fix a bug, add a SINGLE-LINE comment next to the fixed code (e.g., "// Fix: updated class to id"). 
        5. DO NOT write multi-line comments or paragraphs. Keep comments under 10 words.
        6. Separate the HTML, CSS, and JS clearly using standard comment headers (e.g., , /* CSS */, // JavaScript).
        7. Do NOT include any conversational text.

        HTML:
        \n${html || ""}\n
        
        CSS:
        \n${css || "/* No CSS provided */"}\n

        JavaScript:
        \n${js || "// No JS provided"}\n
      `;
    } else {
      // 📄 SINGLE FILE PROMPT
      if (!code)
        return res.status(400).json({ error: "Please provide some code." });

      const langContext = language !== "Auto-Detect" ? language : "software";
      prompt = `
        You are an expert ${langContext} developer. Review the following code and fix any bugs. 
        
        CRITICAL RULES:
        1. If there are no bugs or errors in the code, your ONLY output must be exactly: "there is no bug in the code".
        2. If there ARE bugs, your ONLY output must be the completely fixed raw code.
        3. Do NOT wrap the code in Markdown blocks (do not use \`\`\` or language tags).
        4. When you fix a bug, add a SINGLE-LINE comment exactly where the fix was made (e.g., "// Fix: changed <= to <"). 
        5. DO NOT write multi-line comments or paragraph explanations. Keep all comments strictly under 10 words.
        6. Do NOT include any conversational text.

        Here is the code:
        \n\n${code}
      `;
    }

    const result = await aiModel.generateContent(prompt);
    const review = result.response.text();

    res.json({ review });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to fetch AI review from Google." });
  }
});

app.listen(port, () => {
  console.log(`Server is awake and running on http://localhost:${port}`);
});
