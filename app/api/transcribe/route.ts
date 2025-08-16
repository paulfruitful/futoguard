import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export async function POST(request) {
    const body = await request.json();
    
    const { audio } = body;

    if (!audio) {
        return NextResponse.json({ error: "No audio data provided." }, { status: 400 });
    }

    const client = new AssemblyAI({apiKey: process.env.ASSEMBLYAI_API_KEY});

    const params = {
        audio: Buffer.from(audio), 
        speech_model: "slam-1",
    };

    const run = async () => {
        const transcript = await client.transcripts.transcribe(params);
        return transcript.text;
    };

    try {
        const res = await run();
        
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        return NextResponse.json({ text: res }, { status: 200, headers });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return NextResponse.json({ error: "Failed to transcribe audio." }, { status: 500 });
    }
}

export async function OPTIONS() {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    return NextResponse.json({ success: true }, { status: 200, headers });
}