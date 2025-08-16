import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { classification, location } = body;

    if (!classification?.data) {
      return NextResponse.json(
        { error: "No classification data provided" },
        { status: 400 }
      );
    }

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
    });

    // Extract classification results
    const results = classification.data[0].clipwise_results
      .map((r) => `${r.label}: ${r.score.toFixed(2)}`)
      .join(", ");

    const messages = [
      new SystemMessage(
        `You are an emergency operator AI. Your job is to analyze background audio classification results 
         (sounds like speech, music, dogs, vehicles, etc.) and provide a short, empathetic, human-readable 
         description of what might be happening. Always keep the description concise and safety-focused.`
      ),
      new HumanMessage(
        `Here are the detected sounds: ${results}.
        Location (if available): ${location ? JSON.stringify(location) : "unknown"}.`
      ),
    ];

    const response = await llm.invoke(messages);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return NextResponse.json(
      { description: response.content },
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Emergency API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  return NextResponse.json({ success: true }, { status: 200, headers });
}
