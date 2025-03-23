import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from 'pdf2json';
import dotenv from 'dotenv';
// Note:  For brevity and to focus on the core logic, this translation
//        makes some assumptions about how you'd handle file input
//        and environment variables in a Node.js environment.  In
//        a browser context, the file handling would be very different,
//        and you wouldn't use dotenv.
//
//        This translation is tailored for a Node.js backend environment
//        where you can use libraries like 'fs' (for file system access)
//        and environment variables.

// In a Node.js environment, you'd typically use:
// const fs = require('fs');
// require('dotenv').config();

// Load environment variables
dotenv.config();

// ===============================
// pdf_processor.js (Translated)
// ===============================

/**
 * Extracts due dates from a PDF file.
 * @param {Buffer} pdfBuffer - The PDF file as a buffer.
 * @returns {Promise<Array<{event: string, date: string}>>} - A promise that resolves to an array of event objects.
 */
async function extractDueDates(pdfBuffer) {
    try {
        if (!pdfBuffer) {
            console.error(`Error: No PDF data provided.`);
            return [];
        }

        // Parse the PDF buffer
        const parser = new PDFParser();
        console.log('Starting PDF parsing...');
        const text = await new Promise((resolve, reject) => {
            let text = '';
            parser.on('pdfParser_dataReady', (pdfData) => {
                console.log('PDF parsing complete, extracting text...');
                pdfData.Pages.forEach(page => {
                    page.Texts.forEach(textObj => {
                        text += decodeURIComponent(textObj.R[0].T) + ' ';
                    });
                    text += '\n';
                });
                console.log('Extracted text:', text.substring(0, 200) + '...');
                resolve(text);
            });
            parser.on('pdfParser_dataError', (error) => {
                console.error('PDF parsing error:', error);
                reject(error);
            });
            parser.parseBuffer(pdfBuffer);
        });

        if (!text.trim()) {
            console.error(`Error: No text found in PDF`);
            return [];
        }

        // Initialize Gemini
        console.log('Initializing Gemini...');
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not set.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Define the prompt
        const prompt = `Extract all items with due dates from the following syllabus text.
            Include assignments, quizzes, midterms, exams, and in-class assignments.
            For each item, provide the event name and its due date.
            If a due date is a specific date, use the format 'Event Name - MM/DD/YYYY'.
            If a due date is given as 'Week of MM/DD/YYYY', use the *first day* of that week (Monday) as the date.
            For example, 'Week of 09/16/2024' should be converted to '09/16/2024'.
            If you cannot find a specific date or 'Week of' date, do not include that event.
            Return the results as a comma-separated list of 'Event Name - MM/DD/YYYY' entries.
            If no events are found, return an empty string.`;

        // Generate content with Gemini
        console.log('Sending request to Gemini...');
        const result = await model.generateContent([
            {
                inlineData: {
                    data: pdfBuffer.toString('base64'),
                    mimeType: "application/pdf"
                }
            },
            prompt
        ]);

        console.log('Received response from Gemini');
        const response = await result.response.text();
        console.log('Raw result:', response);
        const trimmedResult = response ? response.trim() : '';
        console.log('Extracted result:', trimmedResult);

        if (!trimmedResult) {
            console.log('No result from Gemini');
            return [];
        }

        // Process the result
        const events = [];
        const entries = trimmedResult.split(",");
        console.log('Split entries:', entries);
        
        for (const entry of entries) {
            if (!entry) {
                console.log('Empty entry, skipping');
                continue;
            }
            
            console.log('Processing entry:', entry);
            const trimmedEntry = entry.trim();
            
            if (trimmedEntry && trimmedEntry.includes("-")) {
                const [eventName, dateStr] = trimmedEntry.split("-").map(s => s.trim());
                console.log('Event:', eventName, 'Date:', dateStr);
                if (eventName && dateStr) {
                    try {
                        // Attempt to parse the date
                        const [month, day, year] = dateStr.split('/').map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        if (!isNaN(dateObj.getTime())) { // Check if it is a valid date
                            events.push({ event: eventName, date: dateStr });
                            console.log('Added event:', { event: eventName, date: dateStr });
                        } else {
                            console.log(`Skipping event '${eventName}' with unparseable date: ${dateStr}`);
                        }
                    } catch (error) {
                        console.log(`Skipping event '${eventName}' with unparseable date: ${dateStr}`);
                    }
                }
            } else {
                console.log('Invalid entry format:', entry);
            }
        }
        return events;

    } catch (error) {
        console.error(`Error processing PDF: ${error}`);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export { extractDueDates };