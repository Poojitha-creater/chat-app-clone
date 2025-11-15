import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = 'http://localhost:3001/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const startNewChat = async () => {
        try {
            // Call backend API to generate a new session ID
            const response = await fetch(`${API_BASE_URL}/sessions/new`, { method: 'POST' });
            const data = await response.json();
            
            // Redirect to the new session URL, e.g., /chat/sess_xyz123
            navigate(`/chat/${data.sessionId}`);
        } catch (error) {
            console.error('Error starting new chat:', error);
            alert('Could not start new chat. Ensure the backend is running on port 3001.');
        }
    };

    const cardClass = theme === 'dark' 
        ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
        : 'bg-white hover:bg-gray-100 border-gray-200';

    return (
        <div className="flex flex-col items-center justify-center flex-grow p-6">
            <header className="absolute top-4 right-4">
                <ThemeToggle />
            </header>
            <h1 className="text-4xl font-bold mb-12">Simplified Chat AI</h1>
            <div 
                 className={`p-8 border rounded-xl shadow-lg cursor-pointer max-w-sm w-full text-center transition-all duration-200 ${cardClass}`}
                 onClick={startNewChat}
            >
                <p className="text-xl font-semibold">Start a New Chat</p>
                <p className="text-sm mt-2 opacity-70">Click to begin a fresh conversation session.</p>
            </div>
        </div>
    );
};

export default LandingPage;