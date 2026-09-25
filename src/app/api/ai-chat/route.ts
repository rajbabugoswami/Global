import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Intelligent fallback if no API key is provided
      const lower = message.toLowerCase();
      let reply = "Hello! I am the GlobalConnect AI Assistant. You need to add a GEMINI_API_KEY to your .env file to enable my full artificial brain. However, I am here and ready to help you navigate GlobalConnect!";
      
      if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hello there! I'm the GlobalConnect AI. How can I assist you with your communications today?";
      } else if (lower.includes("help")) {
        reply = "I can help you translate messages, generate text, write emails, and answer questions. (Note: Please configure GEMINI_API_KEY for full functionality).";
      } else if (lower.includes("who are you")) {
        reply = "I am the built-in AI Assistant for GlobalConnect, designed to help you communicate better with the world.";
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ response: reply });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: "You are the GlobalConnect AI Assistant, a smart, friendly, and concise bot built directly into the GlobalConnect communication platform. You help users translate text, write better messages, and answer general questions.",
      }
    });
    
    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI' }, { status: 500 });
  }
}
