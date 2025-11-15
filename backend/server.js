import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: Move CORS configuration to env variables
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'mockData');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Read data from JSON files
const readDataFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return {};
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return {};
    }
};

// Generate varied mock responses for more realistic behavior
const mockResponses = [
    {
        text: `I've analyzed your question. Here's what I found:`,
        data: {
            type: 'table',
            headers: ['Metric', 'Value', 'Status'],
            rows: [
                ['Response Time', '142ms', 'Good'],
                ['Confidence', '0.94', 'High'],
                ['Query Type', 'Analysis', 'Valid'],
            ],
        },
    },
    {
        text: `Based on your input, here are the key findings:`,
        data: {
            type: 'table',
            headers: ['Category', 'Count', 'Level'],
            rows: [
                ['Keywords', '6', 'Moderate'],
                ['Complexity', 'Medium', 'Manageable'],
                ['Processing', '128ms', 'Fast'],
            ],
        },
    },
    {
        text: `Here's the breakdown of your request:`,
        data: {
            type: 'table',
            headers: ['Item', 'Count', 'Result'],
            rows: [
                ['Entities Found', '4', 'Success'],
                ['Sentiment', 'Neutral', 'Detected'],
                ['Language', 'English', 'Confirmed'],
            ],
        },
    },
];

const getRandomResponse = (question) => {
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return {
        text: response.text,
        data: response.data,
    };
};

// Routes

// Create new session
app.post('/api/v1/sessions/new', (req, res) => {
    try {
        const sessionId = `sess_${uuidv4().substring(0, 8)}`;
        const newSession = {
            id: sessionId,
            title: `Chat - ${new Date().toLocaleString()}`,
            createdAt: new Date().toISOString(),
        };
        res.status(201).json({ success: true, data: newSession });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all sessions
app.get('/api/v1/sessions', (req, res) => {
    try {
        const sessions = readDataFile(SESSIONS_FILE);
        const sessionList = Array.isArray(sessions) ? sessions : Object.values(sessions);
        res.json({ success: true, data: sessionList });
    } catch (error) {
        console.error('Sessions fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
    }
});

// Get chat history for a session
app.get('/api/v1/sessions/:sessionId/history', (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId.startsWith('sess_')) {
            return res.status(400).json({ success: false, error: 'Invalid session format' });
        }

        const history = readDataFile(HISTORY_FILE);
        const messages = history[sessionId] || [];
        
        res.json({ success: true, data: messages, count: messages.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Could not load history' });
    }
});

// Send message and get response
app.post('/api/v1/sessions/:sessionId/question', (req, res) => {
    const { sessionId } = req.params;
    const { question } = req.body;

    // Validation
    if (!sessionId || !sessionId.startsWith('sess_')) {
        return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    if (!question || !question.trim()) {
        return res.status(400).json({ success: false, error: 'Question cannot be empty' });
    }

    // Get random response
    const mockData = getRandomResponse(question);
    const response = {
        id: Date.now(),
        type: 'ai',
        text: mockData.text,
        timestamp: new Date().toISOString(),
    };

    if (mockData.data) {
        response.data = mockData.data;
    }

    // Simulate network delay
    const delay = Math.random() * 1000 + 300;
    setTimeout(() => {
        res.json({ success: true, data: response });
    }, delay);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});