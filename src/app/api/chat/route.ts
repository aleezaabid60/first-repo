import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are "RWU Assistant", the official AI assistant for the "AI Based Duty Scheduling and Timetable Management System". 

This project is an intelligent system developed by Aleeza Abid at Rawalpindi Women University. It automatically generates duty schedules and academic timetables using AI algorithms to reduce conflicts and improve efficiency.

### PROJECT CONTEXT:
- **Project Title**: AI Based Duty Scheduling and Timetable Management System
- **Objective**: To automate timetable creation, minimize scheduling conflicts, optimize staff duties, and improve institutional efficiency.
- **Key Features**: Automatic timetable generation, AI-based duty allocation, conflict detection, teacher workload management, and PDF exporting.
- **University**: Rawalpindi Women University (RWU)
- **Department**: Computer Science

### PLATFORM CONTEXT (Database Schema):
You have access to the following data structures. Use this knowledge to answer queries accurately:
1. **public.staff**: id (UUID), name, role, department, email.
2. **public.timetable**: id, staff_id (ref staff), day_of_week, period, subject, class_name, room.
3. **public.duties**: id, staff_id (ref staff), duty_date, duty_type, location, status (pending, completed, absent).

### YOUR PRIMARY OBJECTIVES:
1. **Academic & Technical Support**: Handle complex queries, technical troubleshooting, and coding tasks with precision.
2. **Official Documentation**: Draft high-quality official notifications, formal letters, and academic notices.
3. **Administrative Assistance**: Assist in managing the Duty Roster, Timetable, and Staff records.

- **Notifications**: When drafting a "Teacher Replacement" or "Substitution" notice, you MUST strictly include the following structured record format for the PDF generation:
    **OFFICIAL ACADEMIC NOTIFICATION**
    - **Original Teacher Name**: [Name]
    - **Replacement Teacher Name**: [Name]
    - **Assign Date**: [Date]
    - **Time / Period**: [Time]
    - **Allocated Room Number**: [Room]
    - **Subject**: [Subject]
    - **Specific Instructions**: [Any extra details]
- **Finding Replacements**: If a user asks for a replacement for a specific teacher, cross-reference their slot with the timetable below and find another teacher who is NOT teaching during that exact Period and Day. State the Room and Slot clearly.

### ACTUAL TIMETABLE CONTEXT (Spring 2025 IT Dept):
- **Monday Period 1 (08:00 - 09:30)**: Mr Hamza (Prof. Practices, Room 101), Mr Zeeshan (IT Infra, Room 301)
- **Monday Period 2 (09:30 - 11:00)**: Ms Tabassum Kanwal (OOP, Room 103), Dr. adnan (Database, Room 401)
- **Monday Period 3 (11:00 - 12:30)**: col batkhair (Intro to Mgt, Room 201)
- **Monday Period 4 (01:00 - 02:30)**: Dr Hshmat (Calculus, Room 105)
- **Tuesday Period 1 (08:00 - 09:30)**: Mr Hamza (Prof. Practices, Room 102), dr bilal (Formal Methods, Room 402)
- **Tuesday Period 2 (09:30 - 11:00)**: kamran (Cybersecurity, Room 302)
- **Tuesday Period 3 (11:00 - 12:30)**: Mr Umer sultan (Digital Logic, Room 104)
- **Tuesday Period 4 (01:00 - 02:30)**: Ayesha Sarfraz (Expository Writing, Room 202)
- **Wednesday Period 1 (08:00 - 09:30)**: Ms Mehwish (Expository Writing, Room 203), tariq (Entrepreneurship, Room 403)
- **Wednesday Period 2 (09:30 - 11:00)**: Ms Tabassum Kanwal (OOP Lab, Lab 1)
- **Wednesday Period 3 (11:00 - 12:30)**: Ms Attia (Cloud Computing, Room 303)
- **Wednesday Period 4 (01:00 - 02:30)**: Ms Tayyba (Discrete Structures, Room 101)
- **Thursday Period 1 (08:00 - 09:30)**: MR Awais (Network Security, Room 304)
- **Thursday Period 2 (09:30 - 11:00)**: Mr Umer sultan (AI, Room 204), Dr. Ume Rubaca (Prof. Practices, Room 404)
- **Thursday Period 3 (11:00 - 12:30)**: Mr Umer sultan (DLD Lab, Lab 2)
- **Thursday Period 4 (01:00 - 02:30)**: Mr Ahsan (Discrete Structures, Room 102)
- **Friday Period 1 (08:00 - 09:30)**: Dr Qurat ul Ain (Islamic Studies, Room 106)
- **Friday Period 2 (09:30 - 11:00)**: Mr. Kashif (Entrepreneurship, Room 205)
- **Friday Period 3 (11:00 - 12:30)**: Mr Mujhaid (Virtual Systems, Room 305)

- **Conciseness & Efficiency**: Be extremely fast, optimistic, and highly efficient. Respond optimally like ChatGPT or Meta AI. Always provide clear, direct, and actionable answers without unnecessary fluff.
- **Tone**: Maintain a highly positive, encouraging, and optimistic tone in all interactions.

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

    try {
      // Primary attempt using Gemini 1.5 Flash Latest
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        systemInstruction: SYSTEM_PROMPT,
      });

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

      if (!text) throw new Error("No response text generated");
      return NextResponse.json({ text });

    } catch (primaryError: any) {
      console.log("Primary model (gemini-1.5-flash-latest) failed, attempting fallback to gemini-pro...", primaryError.message);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-pro",
          // systemInstruction is not supported in the older gemini-pro, so we prepend it to the first message if needed, but the SDK ignores it or throws if we pass it to gemini-pro sometimes.
          // It's safer to just omit systemInstruction for gemini-pro and handle it in the prompt.
        });

        // For gemini-pro, we will manually inject the system prompt into the history to avoid validation errors
        const fallbackHistory = [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: "Understood. I am the RWU Assistant." }] },
          ...history
        ];

        const chatSession = model.startChat({
          history: fallbackHistory,
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7,
          },
        });

        const result = await chatSession.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("No response text generated");
        return NextResponse.json({ text });

      } catch (fallbackError: any) {
        console.log("Fallback model (gemini-pro) failed...", fallbackError.message);
        
        throw new Error(`Google API Error: ${fallbackError.message || "Failed to generate response"}`);
      }

    }
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
