import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, html, teacherName, dutyDate, dutyTime, location, reminderType } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Recipient email "to" is required' }, { status: 400 });
    }

    // Try to load SMTP config if available
    const host = process.env.SMTP_HOST || '';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    let sent = false;
    let mode = 'mock';
    let infoMessage = '';

    if (host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });

        const info = await transporter.sendMail({
          from: `"RWU Notification Service" <${user}>`,
          to,
          subject: subject || `Duty Roster Reminder - ${reminderType === '24h' ? '24 Hours Notice' : '15 Minutes Alert'}`,
          html: html || `<p>Hello ${teacherName},</p><p>You have a duty scheduled for <b>${dutyDate}</b> at <b>${dutyTime}</b> in <b>${location}</b>.</p>`
        });

        sent = true;
        mode = 'smtp';
        infoMessage = `Email sent successfully via SMTP: ${info.messageId}`;
      } catch (err: any) {
        console.error('SMTP sending failed, falling back to mock:', err.message);
        infoMessage = `SMTP error: ${err.message}. Fell back to mock simulation.`;
      }
    } else {
      infoMessage = 'No SMTP configuration found in environment variables. Sent via mock simulation.';
    }

    if (!sent) {
      // Mock sending: log the email and return success
      console.log(`[MOCK EMAIL SENT] to: ${to}, subject: ${subject}, reminderType: ${reminderType}`);
      sent = true;
    }

    return NextResponse.json({
      success: true,
      message: infoMessage,
      mode,
      details: {
        to,
        subject,
        teacherName,
        dutyDate,
        dutyTime,
        location,
        reminderType
      }
    });

  } catch (error: any) {
    console.error('Error in send notifications endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}