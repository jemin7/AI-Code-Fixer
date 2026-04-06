import express, { Request, Response } from "express";
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
    // We now accept a mode, plus the potential web project files
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

        CRITICAL INSTRUCTION: If there are absolutely no bugs or errors in any of the provided code, your ONLY output must be exactly the text: "there is no bug in the code".

        If there ARE bugs, provide the completely fixed and working code. Separate your response into distinct Markdown code blocks for HTML, CSS, and JavaScript. Do NOT include any greetings or explanations.

        HTML:
        \n${html || ""}\n
        
        CSS:
        \n${css || "/* No CSS provided */"}\n

        JavaScript:
        \n${js || "// No JS provided"}\n
      `;
    } else {
      // 📄 SINGLE FILE PROMPT (Your existing setup)
      if (!code)
        return res.status(400).json({ error: "Please provide some code." });

      const langContext = language !== "Auto-Detect" ? language : "software";
      prompt = `
        You are an expert ${langContext} developer. Review the following code and fix any bugs. 
        
        CRITICAL INSTRUCTION: If there are no bugs or errors in the code, your ONLY output must be exactly the text: "there is no bug in the code".
        
        If there ARE bugs, your ONLY output must be the completely fixed and working code enclosed in a single Markdown code block. Do NOT include any greetings, explanations, or bug identification text.

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
