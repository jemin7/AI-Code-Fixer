import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Add your Gemini API Key in a .env file!
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post("/api/review", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Review this code for bugs and improvements:\n${code}`;
    const result = await model.generateContent(prompt);

    res.json({ review: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI review" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
