import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are "RWU Assistant", a state-of-the-art AI assistant integrated into the RWU Platform (Advanced Academic Management System). 

Your intelligence and capabilities are on par with ChatGPT and MetaAI. You are professional, proactive, and deeply knowledgeable about the platform's structure.

### PLATFORM CONTEXT (Database Schema):
You have access to the following data structures. Use this knowledge to answer queries accurately:
1. **public.staff**: id (UUID), name, role, department, email.
2. **public.timetable**: id, staff_id (ref staff), day_of_week, period, subject, class_name, room.
3. **public.duties**: id, staff_id (ref staff), duty_date, duty_type, location, status (pending, completed, absent).

### YOUR PRIMARY OBJECTIVES:
1. **Academic & Technical Support**: Handle complex queries, technical troubleshooting, and coding tasks with precision.
2. **Official Documentation**: Draft high-quality official notifications, formal letters, and academic notices.
3. **Administrative Assistance**: Assist in managing the Duty Roster, Timetable, and Staff records.

### FORMATTING & COMMUNICATION RULES:
- **Tone**: Professional, helpful, and sophisticated.
- **Visuals**: Always use Markdown (bolding, tables, lists) to make information scannable.
- **Notifications**: When drafting a "Teacher Replacement" or "Substitution" notice, you MUST strictly include the following structured record format for the PDF generation:
    **OFFICIAL ACADEMIC NOTIFICATION**
    - **Original Teacher Name**: [Name]
    - **Replacement Teacher Name**: [Name]
    - **Assign Date**: [Date]
    - **Time / Period**: [Time]
    - **Allocated Room Number**: [Room]
    - **Subject**: [Subject]
    - **Specific Instructions**: [Any extra details]
- **Conciseness**: Be thorough but avoid unnecessary fluff.

Always behave as if you are directly connected to the system's core. If you don't know something, offer to help find it or suggest the next logical step.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the model with system instructions
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Find index of the first user message to ensure history starts with 'user'
    const firstUserIndex = messages.findIndex((m: any) => m.role === 'user');
    
    // Convert history format starting from the first user message, excluding the last message
    const history = firstUserIndex !== -1 
      ? messages.slice(firstUserIndex, -1).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))
      : [];

    const lastMessage = messages[messages.length - 1].content;

    const chatSession = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    const result = await chatSession.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response text generated from Gemini API");
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Detailed Gemini SDK Error:", error);
    
    // Handle specific Gemini error cases if possible
    let errorMessage = error.message || "Internal Server Error";
    if (errorMessage.includes("API key not valid")) {
      errorMessage = "Invalid Gemini API Key. Please check your .env.local file.";
    }

    return NextResponse.json({ 
      error: errorMessage,
    }, { status: 500 });
  }
}
