import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(req: Request) {
  try {
    const { audioBuffer } = await req.json();

    if (!audioBuffer) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // Convert array back to Node.js Buffer
    const buffer = Buffer.from(audioBuffer);

    // Wrap as Blob (so @gradio/client treats it as a file)
    const blob = new Blob([buffer], { type: "audio/wav" });

    // Connect to the Gradio Space
    const client = await Client.connect("paulfruitful/aed-panic");

    // Send file exactly like Python's handle_file()
    const result = await client.predict("/predict", {
      file_path: blob
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Gradio API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  } 
}
