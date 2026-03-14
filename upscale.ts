import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({});

async function run() {
    try {
        console.log("Reading image...");
        const imageBytes = fs.readFileSync("./public/8.jpg");
        const base64Data = imageBytes.toString("base64");

        console.log("Calling Gemini API...");
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/jpeg",
                },
              },
              {
                text: "Upscale and enhance this image. Make it high resolution, sharp, highly detailed, cinematic, photorealistic. Keep the exact same subject and composition.",
              },
            ],
          },
        });

        console.log("Processing response...");
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const outBase64 = part.inlineData.data;
            fs.writeFileSync("./public/8_highres.jpg", Buffer.from(outBase64, "base64"));
            console.log("SUCCESS");
            return;
          }
        }
        console.log("NO IMAGE RETURNED");
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
