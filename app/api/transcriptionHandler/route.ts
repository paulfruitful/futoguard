import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing AssemblyAI API key" }, { status: 500 });
  }

  // Read raw buffer from request
  const audioBuffer = await req.arrayBuffer();

  try {
    // Step 1: Upload audio
    const uploadRes = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      Buffer.from(audioBuffer),
      { headers: { authorization: apiKey } }
    );
    const audioUrl = uploadRes.data.upload_url;

    // Step 2: Request transcription
    const transcriptRes = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      { headers: { authorization: apiKey } }
    );
    const transcriptId = transcriptRes.data.id;

    // Step 3: Poll for completion
    let transcript;
    do {
      const pollRes = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: apiKey } }
      );
      transcript = pollRes.data;
      if (transcript.status === "failed") break;
      await new Promise(r => setTimeout(r, 3000));
    } while (transcript.status !== "completed");

    if (transcript.status === "completed") {
      return NextResponse.json({ text: transcript.text }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Transcription failed." }, { status: 500 });
    }
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: "Transcription error." }, { status: 500 });
  }
}