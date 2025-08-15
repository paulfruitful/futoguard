import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { messages } = body;

    const llm = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash-lite" });

    // Build the chat history properly
    const chatHistory = [
        new SystemMessage(
            `You are a highly intelligent and empathetic distress operator specializing in emergency situations.
            Your role is to analyze incoming messages from users and agents, which may include environmental data,
            and provide clear, actionable, and supportive responses to assist users effectively.
            Prioritize safety, clarity, and empathy in your replies.`
        ),
        ...messages.map(([role, content]) =>
            role === "human"
                ? new HumanMessage(content)
                : new AIMessage(content)
        ),
    ];

    const response = await llm.invoke(chatHistory);

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    return NextResponse.json({ reply: response.content }, { status: 200, headers });
}

export async function OPTIONS() {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    return NextResponse.json({ success: true }, { status: 200, headers });
}
