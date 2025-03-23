import { google } from 'googleapis';
import { auth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.CALENDAR_ID;

async function getCalendarService() {
  const credsFile = process.env.GOOGLE_CALENDAR_CREDENTIALS_FILE;

  try {
    const credentials = JSON.parse(fs.readFileSync(credsFile, 'utf8'));
    const client = auth.fromJSON(credentials);
    client.scopes = SCOPES;

    const service = google.calendar({ version: 'v3', auth: client });
    return service;
  } catch (error) {
    console.error('Error loading credentials:', error);
    throw error;
  }
}

async function testAddEvent() {
  const service = await getCalendarService();

  const event = {
    summary: 'Test Event from Code',
    description: 'This is a test event to check Google Calendar integration.',
    start: {
      dateTime: new Date().toISOString(),  // Start now
    },
    end: {
      dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),  // 1 hour later
    },
  };

  try {
    const response = await service.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    console.log('Event created:', response.data);
  } catch (error) {
    console.error('Failed to add event:', error);
  }
}

testAddEvent();
