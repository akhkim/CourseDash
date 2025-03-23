import 'dotenv/config'; // Use import for dotenv
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';

async function sendCalendarEventsToEmail() {
  try {
    const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_CALENDAR_CREDENTIALS_FILE));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    const client = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: client });
    const res = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;

    let emailContent = 'Upcoming Calendar Events:\n\n';
    if (events.length) {
      events.forEach((event) => {
        const start = event.start.dateTime || event.start.date;
        emailContent += `${start} - ${event.summary}\n`;
      });
    } else {
      emailContent = 'No upcoming events found.';
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Calendar Event Details',
      text: emailContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

sendCalendarEventsToEmail();