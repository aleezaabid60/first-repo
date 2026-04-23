import { NextResponse } from "next/server";

const API_KEY = "AIzaSyA4z_FWuETIA3nEM3HryS0mzOAKe69fTjc";

const SYSTEM_PROMPT = "You are an AI assistant for the RWU Platform, an Advanced Academic Management System. The platform features an AI Duty Roster Generator, Timetable Matrix, Staff & Leave Management, and Advanced Analytics. The design is modern 'Midnight' theme with glassmorphism. You help users navigate the platform and answer questions about its features. Keep responses concise and professional.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    
    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Constructing history string for the prompt
    const chatContext = messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    const finalPrompt = `${SYSTEM_PROMPT}\n\nChat History:\n${chatContext}\n\nAssistant:`;

    // Direct fetch call to Google Gemini API (v1beta with gemini-flash-latest)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: finalPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || "Failed to fetch from Gemini API");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Backend Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
