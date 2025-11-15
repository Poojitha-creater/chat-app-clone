import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; 


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();
const port = 3001;


app.use(cors()); 
app.use(express.json()); 


const sessionsPath = path.join(__dirname, 'mockData', 'sessions.json');
const historyPath = path.join(__dirname, 'mockData', 'history.json');


const readData = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading data from ${filePath}:`, error);
        return {}; 
    }
};

// --- API Endpoints ---

// 1. Start new chat (POST /api/sessions/new)
app.post('/api/sessions/new', (req, res) => {
    const newSessionId = `sess_${uuidv4().substring(0, 8)}`; 
    const newSessionTitle = "New Chat - " + new Date().toLocaleTimeString();

    res.json({ sessionId: newSessionId, title: newSessionTitle });
});

// 2. Fetch all sessions (GET /api/sessions)
app.get('/api/sessions', (req, res) => {
    const sessions = readData(sessionsPath);
    // readData returns an object or array, ensure it's an array for the frontend
    res.json(Array.isArray(sessions) ? sessions : []);
});

// 3. Fetch session history (GET /api/sessions/:sessionId/history)
app.get('/api/sessions/:sessionId/history', (req, res) => {
    const { sessionId } = req.params;
    const historyData = readData(historyPath);
    
    // Returns the array of messages for the requested session ID, or an empty array if not found.
    const history = historyData[sessionId] || []; 
    res.json(history);
});

// 4. Ask question in a session (POST /api/sessions/:sessionId/question)
app.post('/api/sessions/:sessionId/question', (req, res) => {
    const userQuestion = req.body.question || "Tell me about structured data."; 
    
    // Hardcoded mock response including structured data for the Table View
    const mockAnswer = {
        id: Date.now(),
        type: "ai",
        text: `Dummy response for your question: "${userQuestion}". The following table illustrates the key metrics from your previous chat.`,
        data: {
            type: "table",
            headers: ["Key Metric", "Value", "Status"],
            rows: [
                ["Latency", "85ms", "Fast"],
                ["Token Count", "2048", "Standard"],
                ["Model ID", "GPT-Mock-3", "Mocked"]
            ]
        }
    };
    // Simulate a short network delay
    setTimeout(() => {
        res.json(mockAnswer);
    }, 500); 
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`✅ Backend server running at http://localhost:${port}`);
});