// ===============================
// app.js (Translated -  Express.js for Node.js)
// ===============================
import express from 'express';
import multer from 'multer'; // For handling file uploads
import { extractDueDates } from './pdf_processor.js'; // Import our functions
import { addEvents } from './calendar_integration.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

console.log('Imported modules successfully');
console.log('extractDueDates:', typeof extractDueDates);
console.log('addEvents:', typeof addEvents);

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON requests

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// To use __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FILE_TYPES definition
const FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Course Dash API." });
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file provided" });
    }

    if (!FILE_TYPES.includes(file.mimetype)) {
        return res.status(400).json({ error: "Unsupported file type" });
    }

    try {
        if (file.mimetype === "application/pdf") {
            const events = await extractDueDates(file.buffer); // Pass the buffer
            if (!events) {
                return res.status(200).json({ message: "No due-date events found in the syllabus." });
            }
            const addedEvents = await addEvents(events);
            if (addedEvents) {
                const results = addedEvents.map(event => {
                    const start = event.start;
                    return start
                        ? `Event '${event.summary}' on ${start.date}`
                        : "Event details missing 'start' date.";
                });
                return res.status(200).json({ message: "Events added successfully", events: results });
            } else {
                return res.status(200).json({ message: "No events were added to the calendar." });
            }
        }
        return res.status(200).json({ message: "File uploaded successfully, but no specific action was taken for this file type." });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "File processing failed." });
    }
});

app.post("/chat", async (req, res) => {
    const query = req.body.query;

    if (!query) {
        return res.status(400).json({ error: "No query provided" });
    }

    const response = await generateResponse(query);  //  <--  Where is this defined?
    res.json({ response });
});

app.post("/process_syllabus", upload.single("file"), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file provided" });
    }

    if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Invalid file type. Please upload a PDF." });
    }

    try {
        console.log(`Processing PDF file: ${file.originalname}`);
        const events = await extractDueDates(file.buffer);
        
        if (!events || events.length === 0) {
            return res.status(200).json({ message: "No due-date events found in the syllabus." });
        }

        console.log("Due-date events extracted:");
        events.forEach(event => {
            console.log(` - ${event.event} on ${event.date}`);
        });

        console.log("\nAdding events to Google Calendar...");
        const createdEvents = await addEvents(events);

        if (createdEvents && createdEvents.length > 0) {
            const results = createdEvents.map(event => {
                const start = event.start;
                return start ? `Event '${event.summary}' on ${start.date}` : `Event details missing 'start' date.`;
            });
            return res.status(200).json({ message: "Events added successfully", events: results });
        } else {
            return res.status(200).json({ message: "No events were added to the calendar." });
        }

    } catch (error) {
        console.error(`Error processing syllabus: ${error}`);
        return res.status(500).json({ error: `Error processing syllabus: ${error}` });
    }
});

const server = app.listen(8000, '0.0.0.0', () => {
    console.log("Server is running on port 8000");
});
