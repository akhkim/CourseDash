import { google } from 'googleapis';
import { auth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// ===============================
// calendar_integration.js (Translated)
// ===============================

/**
 * Returns an authorized Google Calendar service instance.
 * @returns {Promise<google.calendar_v3.Calendar>} - A Google Calendar service instance.
 */
async function getCalendarService() {
    const credsFile = process.env.GOOGLE_CALENDAR_CREDENTIALS_FILE;
    if (!credsFile) {
        throw new Error("GOOGLE_CALENDAR_CREDENTIALS_FILE environment variable is not set.");
    }

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

/**
 * Creates a calendar event using the provided event_info dictionary.
 * @param {{event: string, date: string}} eventInfo - Object containing event details.
 * @returns {Promise<any | null>} - A promise that resolves to the created event, or null on failure.
 */
async function addEvent(eventInfo) {
    const service = await getCalendarService();

    try {
        // Parse the date string (MM/DD/YYYY format)
        const [month, day, year] = eventInfo.date.split('/').map(Number);
        const eventDate = new Date(year, month - 1, day);
        
        if (isNaN(eventDate.getTime())) {
            console.error(`Date format not recognized for '${eventInfo.date}' in event '${eventInfo.event}'. Skipping.`);
            return null;
        }

        const event = {
            summary: eventInfo.event,
            start: {
                date: eventDate.toISOString().split('T')[0],
            },
            end: {
                date: new Date(eventDate.setDate(eventDate.getDate() + 1)).toISOString().split('T')[0],
            },
        };

        const calendarId = process.env.CALENDAR_ID;
        if (!calendarId) {
            throw new Error("CALENDAR_ID environment variable is not set.");
        }

        const createdEvent = await service.events.insert({
            calendarId: calendarId,
            requestBody: event,
        });
        return createdEvent.data;
    } catch (error) {
        console.error(`Failed to add event '${eventInfo.event}' on ${eventInfo.date}: ${error}`);
        return null;
    }
}

/**
 * Adds a list of events to the calendar.
 * @param {Array<{event: string, date: string}>} events - An array of event objects.
 * @returns {Promise<Array<any>>} - A promise that resolves to an array of successfully added events.
 */
async function addEvents(events) {
    const addedEvents = [];
    for (const eventInfo of events) {
        const created = await addEvent(eventInfo);
        if (created) {
            addedEvents.push(created);
        }
    }
    return addedEvents;
}

export { addEvents, addEvent, getCalendarService };