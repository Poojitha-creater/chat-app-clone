import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TableDisplay from './TableDisplay';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const API_BASE_URL = 'http://localhost:3001/api';

const ChatInterface = () => {
    const { sessionId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch initial chat history when sessionId changes
    useEffect(() => {
        const fetchHistory = async () => {
            if (!sessionId) {
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/history`);
                const history = await response.json();
                setMessages(history);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
        
        // Reset input/messages for new sessions
        setMessages([]);
        setInput('');
    }, [sessionId]);

    // Function to render a single message bubble
    const renderMessage = (msg) => {
        const isUser = msg.type === 'user';
        const msgClasses = isUser 
            ? 'self-end bg-indigo-600 text-white rounded-br-none' 
            : (theme === 'dark' ? 'self-start bg-gray-700 rounded-tl-none' : 'self-start bg-gray-200 rounded-tl-none');
        
        const avatar = isUser 
            ? <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2">U</div>
            : <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold mr-2">AI</div>;

        return (
            <div key={msg.id} className={`flex my-3 max-w-4xl ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
                {!isUser && avatar}
                <div className={`p-3 max-w-[80%] break-words rounded-xl shadow-md ${msgClasses}`}>
                    <p className="text-sm">{msg.text}</p>
                    {/* Render TableDisplay if the message has structured data */}
                    {msg.data?.type === 'table' && <TableDisplay tableData={msg.data} />}
                </div>
                {isUser && avatar}
            </div>
        );
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now(), type: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Send the question to the backend
            const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMessage.text }),
            });
            const aiResponse = await response.json();
            
            // Add the AI response to the messages
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: 'Error: Failed to connect to backend.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header and Theme Toggle */}
            <header className={`p-4 border-b flex justify-end ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <ThemeToggle />
            </header>

            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold mb-2">{sessionId ? `Chat Session: ${sessionId}` : 'Select a Chat'}</h2>
                    <p className="opacity-70 text-sm">Welcome! Start a new chat or select a session from the side panel.</p>
                </div>
                
                {messages.length > 0 && (
                    <div className="flex flex-col items-center w-full">
                        {messages.map(renderMessage)}
                        {isLoading && (
                            <div className="my-3 self-start p-3 rounded-xl shadow-md animate-pulse max-w-xs w-full bg-gray-700 rounded-tl-none">
                                <div className="w-1/2 h-3 bg-gray-500 rounded"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
                
                {isLoading && messages.length === 0 && <p className="text-center opacity-70 mt-10">Loading chat history...</p>}
            </div>

            {/* Input Footer */}
            <footer className={`p-4 border-t flex justify-center ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <form onSubmit={handleSend} className="flex w-full max-w-4xl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className={`flex-1 p-3 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`px-6 rounded-r-xl font-semibold transition duration-150 flex items-center ${
                            (isLoading || !input.trim()) 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatInterface;