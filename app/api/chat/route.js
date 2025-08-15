import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { message } = body;
    const llm = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash-lite" });
    const response = await llm.invoke([
        "system",
        `You are a highly intelligent and empathetic distress operator specializing in emergency situations. 
        Your role is to analyze incoming messages from users and agents, which may include environmental data, 
        and provide clear, actionable, and supportive responses to assist users effectively. 
        Prioritize safety, clarity, and empathy in your replies.`
    ], [
        "human",
        message
    ]);

    const headers = {
        "Access-Control-Allow-Origin": "*", // Allow all origins
        "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
        "Access-Control-Allow-Headers": "Content-Type" // Allow Content-Type header
    };

    return NextResponse.json({reply: response.content }, { status: 200, headers });
}

export async function OPTIONS() {
    const headers = {
        "Access-Control-Allow-Origin": "*", // Allow all origins
        "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
        "Access-Control-Allow-Headers": "Content-Type" // Allow Content-Type header
    };

    return NextResponse.json({ success: true }, { status: 200, headers }); // Use 200 for a response body
}