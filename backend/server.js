import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// ES Module utilities for __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app and configuration
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = 'v1';

// Middleware setup
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'mockData');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safely read and parse JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @returns {Object|Array} Parsed JSON data or empty object on error
 */
const readDataFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`Data file not found: ${filePath}`);
            return {};
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading data file ${filePath}:`, error.message);
        return {};
    }
};

/**
 * Generate a structured mock response for demonstration
 * @param {string} userQuestion - The user's input question
 * @returns {Object} AI response object with optional structured data
 */
const generateMockResponse = (userQuestion) => {
    const responses = [
        {
            text: `I analyzed your question: "${userQuestion}". Here are the key metrics from the analysis:`,
            data: {
                type: 'table',
                headers: ['Metric', 'Value', 'Status'],
                rows: [
                    ['Processing Time', '145ms', 'Normal'],
                    ['Confidence Score', '0.92', 'High'],
                    ['Response Type', 'Analytical', 'Valid'],
                ],
            },
        },
        {
            text: `Based on your input: "${userQuestion}", the system has processed and categorized the request. See details below:`,
            data: {
                type: 'table',
                headers: ['Category', 'Count', 'Impact'],
                rows: [
                    ['Keywords Detected', '5', 'Significant'],
                    ['Query Complexity', 'Medium', 'Manageable'],
                    ['Response Time', '120ms', 'Optimal'],
                ],
            },
        },
    ];

    return responses[Math.floor(Math.random() * responses.length)];
};

// ============================================================================
// API Routes
// ============================================================================

/**
 * POST /api/{version}/sessions/new
 * Create a new chat session
 */
app.post(`/api/${API_VERSION}/sessions/new`, (req, res) => {
    try {
        const sessionId = `sess_${uuidv4().substring(0, 8)}`;
        const timestamp = new Date().toISOString();
        const title = `Chat Session - ${new Date().toLocaleString()}`;

        const newSession = {
            id: sessionId,
            title,
            createdAt: timestamp,
            updatedAt: timestamp,
            messageCount: 0,
        };

        res.status(201).json({
            success: true,
            data: newSession,
        });
    } catch (error) {
        console.error('Error creating new session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create new session',
        });
    }
});

/**
 * GET /api/{version}/sessions
 * Fetch all active chat sessions
 */
app.get(`/api/${API_VERSION}/sessions`, (req, res) => {
    try {
        const sessionsData = readDataFile(SESSIONS_FILE);
        const sessions = Array.isArray(sessionsData) ? sessionsData : Object.values(sessionsData);

        res.status(200).json({
            success: true,
            data: sessions,
            count: sessions.length,
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sessions',
        });
    }
});

/**
 * GET /api/{version}/sessions/:sessionId/history
 * Retrieve chat history for a specific session
 */
app.get(`/api/${API_VERSION}/sessions/:sessionId/history`, (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId || !sessionId.match(/^sess_/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid session ID format',
            });
        }

        const historyData = readDataFile(HISTORY_FILE);
        const history = historyData[sessionId] || [];

        res.status(200).json({
            success: true,
            data: history,
            sessionId,
            messageCount: history.length,
        });
    } catch (error) {
        console.error(`Error fetching history for session ${req.params.sessionId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat history',
        });
    }
});

/**
 * POST /api/{version}/sessions/:sessionId/question
 * Send a question in a chat session and receive a response
 */
app.post(`/api/${API_VERSION}/sessions/:sessionId/question`, (req, res) => {
    try {
        const { sessionId } = req.params;
        const { question } = req.body;

        // Validation
        if (!sessionId || !sessionId.match(/^sess_/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid session ID format',
            });
        }

        if (!question || typeof question !== 'string' || !question.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Question is required and must be a non-empty string',
            });
        }

        // Generate mock response with structured data
        const mockResponse = generateMockResponse(question.trim());
        const aiMessage = {
            id: Date.now(),
            type: 'ai',
            text: mockResponse.text,
            timestamp: new Date().toISOString(),
            ...(mockResponse.data && { data: mockResponse.data }),
        };

        // Simulate network latency (realistic API behavior)
        const responseDelay = Math.random() * 800 + 400; // 400-1200ms
        setTimeout(() => {
            res.status(200).json({
                success: true,
                data: aiMessage,
            });
        }, responseDelay);
    } catch (error) {
        console.error(`Error processing question for session ${req.params.sessionId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to process question',
        });
    }
});

// ============================================================================
// Error Handling & Server Startup
// ============================================================================

/**
 * Global 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
    });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend API running on http://localhost:${PORT}`);
    console.log(`📡 API Version: ${API_VERSION}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});