import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      // Escolher voz baseada no idioma
      const voice = language === 'pt' ? 'nova' : 'alloy'; // nova tem sotaque mais neutro
      
      const mp3 = await client.audio.speech.create({
        model: "tts-1-hd", // Modelo HD para melhor qualidade
        voice: voice,
        input: text,
        response_format: "mp3",
        speed: 0.9, // Velocidade um pouco mais lenta para entrevistas
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const audioBase64 = buffer.toString('base64');

      return res.status(200).json({ 
        audio: audioBase64,
        mimeType: 'audio/mpeg'
      });
    } catch (error) {
      console.error("Error generating speech:", error);
      return res.status(500).json({ error: "Failed to generate speech" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
