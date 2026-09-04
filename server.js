const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));


// Upload folder
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}


// Upload settings
const upload = multer({
    dest: uploadFolder,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});


// Gemini
const aiClient = import("@google/genai").then(
    ({ GoogleGenAI, createUserContent, createPartFromUri }) => {
        return {
            ai: new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY
            }),
            createUserContent,
            createPartFromUri
        };
    }
);


// Chat endpoint
app.post("/api/chat", upload.single("file"), async (req, res) => {

    const message = req.body.message || "";
    const selectedFile = req.file;

    if (!message.trim() && !selectedFile) {
        return res.status(400).json({
            error: "Please enter a message or attach a file."
        });
    }

    let uploadedFile = null;

    try {

        const {
            ai,
            createUserContent,
            createPartFromUri
        } = await aiClient;

        let contents;


        // Handle uploaded file
        if (selectedFile) {

            uploadedFile = await ai.files.upload({
                file: selectedFile.path,
                config: {
                    mimeType: selectedFile.mimetype
                }
            });

            contents = createUserContent([
                message || "Please analyze this file.",
                createPartFromUri(
                    uploadedFile.uri,
                    uploadedFile.mimeType
                )
            ]);

        } else {

            contents = message;

        }


        // Generate AI response
        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash",

            contents: contents,

            config: {
                thinkingConfig: {
                    thinkingLevel: "minimal"
                },

                systemInstruction: `
You are a professional general-purpose AI assistant.

Understand exactly what the user is asking and complete the task.

Give useful, natural, professional answers that are easy to read.

Rules:
- Answer the user's actual request.
- Do not assume information that the user did not provide.
- Do not invent names, dates, times, facts, or other details.
- For writing requests, provide the finished content directly.
- Be accurate and helpful.
- Keep simple answers concise.
- Give more detail when the task requires it.
- When a file is provided, use the file as a source of information.
`
            }

        });


        res.json({
            reply: response.text
        });


    } catch (error) {

        console.error("Gemini request failed:", error.message);

        if (error.status === 429) {

            return res.status(429).json({
                error: "The AI service is temporarily unavailable. Please try again later."
            });

        }

        return res.status(500).json({
            error: "Unable to process your request right now."
        });

    } finally {

        // Remove local uploaded file
        if (
            selectedFile &&
            fs.existsSync(selectedFile.path)
        ) {
            fs.unlinkSync(selectedFile.path);
        }


        // Remove Gemini uploaded file
        if (uploadedFile) {

            try {

                const { ai } = await aiClient;

                await ai.files.delete({
                    name: uploadedFile.name
                });

            } catch (deleteError) {

                console.error(
                    "File cleanup failed:",
                    deleteError.message
                );

            }

        }

    }

});


// Upload / request errors
app.use((error, req, res, next) => {

    if (error instanceof multer.MulterError) {

        if (error.code === "LIMIT_FILE_SIZE") {

            return res.status(400).json({
                error: "File is too large. Maximum size is 20 MB."
            });

        }

        return res.status(400).json({
            error: "Unable to upload the file."
        });

    }


    console.error(
        "Server error:",
        error.message
    );

    res.status(500).json({
        error: "Something went wrong on the server."
    });

});


// Start server
app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Cognitask running at http://localhost:${PORT}`
    );

});