import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Audio data in Base64 is required" });
    }

    try {
      // Converter o Base64 para um buffer binário
      const audioBuffer = Buffer.from(audioBase64, "base64");

      // Criar um arquivo temporário WAV
      const tempFilePath = path.join(process.cwd(), "temp_audio.wav");
      fs.writeFileSync(tempFilePath, audioBuffer);

      // Enviar o arquivo para o OpenAI
      const fileStream = fs.createReadStream(tempFilePath);
      const transcription = await client.audio.transcriptions.create({
        model: "whisper-1",
        file: fileStream,
        response_format: "json",
      });

      // Excluir o arquivo temporário
      fs.unlinkSync(tempFilePath);

      return res.status(200).json({ transcription: transcription.text });
    } catch (error) {
      console.error("Error processing audio:", error);
      return res.status(500).json({ error: "Failed to process audio" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
