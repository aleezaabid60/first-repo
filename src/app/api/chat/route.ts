import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

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
- **Finding Replacements**: If a user asks for a replacement for a specific teacher, cross-reference their slot with the timetable and find another teacher who is NOT teaching during that exact Period and Day. State the Room and Slot clearly.

### CONCESSIVENESS & TONE:
- **Conciseness & Efficiency**: Be extremely fast, optimistic, and highly efficient. Respond optimally like ChatGPT or Meta AI. Always provide clear, direct, and actionable answers without unnecessary fluff.
- **Tone**: Maintain a highly positive, encouraging, and optimistic tone in all interactions.

Always behave as if you are directly connected to the system's core. If you don't know something, offer to help find it or suggest the next logical step.`;

async function getDatabaseContext() {
  try {
    const [staffRes, timetableRes, dutiesRes] = await Promise.all([
      supabase.from("staff").select("*").limit(100),
      supabase.from("timetable").select("*").limit(200),
      supabase.from("duties").select("*").limit(100),
    ]);

    if (staffRes.error || timetableRes.error || dutiesRes.error) {
      console.error("Supabase query error:", staffRes.error || timetableRes.error || dutiesRes.error);
      return "";
    }

    const staffMap = new Map<string, any>();
    staffRes.data?.forEach(s => staffMap.set(s.id, s));

    let staffText = "No staff records found in the database.";
    if (staffRes.data && staffRes.data.length > 0) {
      staffText = staffRes.data.map(s => `- Name: ${s.name} | Role: ${s.role} | Department: ${s.department || "N/A"} | Email: ${s.email || "N/A"}`).join("\n");
    }

    let timetableText = "No timetable records found in the database.";
    if (timetableRes.data && timetableRes.data.length > 0) {
      const grouped: { [key: string]: string[] } = {};
      timetableRes.data.forEach(t => {
        const day = t.day_of_week;
        if (!grouped[day]) grouped[day] = [];
        const teacher = t.staff_id ? staffMap.get(t.staff_id) : null;
        const teacherName = teacher ? teacher.name : "Unknown";
        grouped[day].push(`  - Period: ${t.period} | Teacher: ${teacherName} | Subject: ${t.subject} | Room: ${t.room || "N/A"} | Class: ${t.class_name}`);
      });

      timetableText = Object.entries(grouped)
        .map(([day, entries]) => `### ${day}\n${entries.join("\n")}`)
        .join("\n\n");
    }

    let dutiesText = "No duties scheduled.";
    if (dutiesRes.data && dutiesRes.data.length > 0) {
      dutiesText = dutiesRes.data.map(d => {
        const teacher = d.staff_id ? staffMap.get(d.staff_id) : null;
        const teacherName = teacher ? teacher.name : "Unknown";
        return `- Date: ${d.duty_date} | Teacher: ${teacherName} | Type: ${d.duty_type} | Location: ${d.location} | Status: ${d.status}`;
      }).join("\n");
    }

    return `

### ACTUAL DATABASE STATE (REAL-TIME DATA):
Use this real-time database data to answer user queries, find replacements, check schedules, and manage staff:

#### STAFF LIST:
${staffText}

#### TIMETABLE SCHEDULE:
${timetableText}

#### ACTIVE DUTIES:
${dutiesText}
`;
  } catch (error) {
    console.error("Failed to get database context:", error);
    return "";
  }
}

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

    // Fetch dynamic database context to keep chatbot updated
    const dbContext = await getDatabaseContext();
    const systemPromptWithContext = SYSTEM_PROMPT + dbContext;

    try {
      // Primary attempt using Gemini 2.5 Flash (stable, fast, and supports system instruction)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemPromptWithContext,
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
      console.log("Primary model (gemini-2.5-flash) failed, attempting fallback to gemini-2.0-flash...", primaryError.message);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          systemInstruction: systemPromptWithContext,
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

      } catch (fallbackError: any) {
        console.log("Fallback model (gemini-2.0-flash) failed...", fallbackError.message);
        
        throw new Error(`Google API Error: ${fallbackError.message || "Failed to generate response"}`);
      }
    }
  } catch (error: any) {
    console.error("Detailed Gemini SDK Error:", error);
    
    let errorMessage = error.message || "Internal Server Error";
    if (errorMessage.includes("API key not valid")) {
      errorMessage = "Invalid Gemini API Key. Please check your .env.local file.";
    }

    return NextResponse.json({ 
      error: errorMessage,
    }, { status: 500 });
  }
}

