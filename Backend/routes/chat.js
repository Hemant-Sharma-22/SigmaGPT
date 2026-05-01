import express from "express";
import Thread from "../models/Thread.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ================= TEST =================
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread2"
        });

        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// ================= CHAT =================
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            thread = new Thread({
                threadId,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        // 🔥 FINAL GEMINI FIX
        let assistantReply = "";

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash"
            });

            const result = await model.generateContent(message);

            if (!result || !result.response) {
                throw new Error("No response from Gemini");
            }

            assistantReply = result.response.text();

        }  catch (aiError) {
    console.error("🔥 FULL GEMINI ERROR:", aiError);
    console.error("🔥 ERROR MESSAGE:", aiError.message);
    console.error("🔥 ERROR STACK:", aiError.stack);

    return res.status(500).json({
        error: aiError.message || "AI failed"
    });
}

        thread.messages.push({
            role: "assistant",
            content: assistantReply
        });

        thread.updatedAt = new Date();
        await thread.save();

        res.json({ reply: assistantReply });

    } catch (err) {
        console.log("Server Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;