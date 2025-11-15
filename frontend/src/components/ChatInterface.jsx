import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TableDisplay from './TableDisplay';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const API_BASE_URL = 'http://localhost:3001/api/v1';
const TIMEOUT_MS = 30000;

const ChatInterface = () => {
    const { sessionId } = useParams();
    const { theme } = useTheme();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const abortRef = useRef(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Load chat history
    useEffect(() => {
        if (!sessionId) return;

        const loadHistory = async () => {
            setLoading(true);
            setError(null);
            abortRef.current = new AbortController();

            try {
                const timeoutId = setTimeout(() => abortRef.current?.abort(), TIMEOUT_MS);

                const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/history`, {
                    signal: abortRef.current.signal,
                });

                clearTimeout(timeoutId);

                if (!res.ok) throw new Error(`Error ${res.status}`);

                const result = await res.json();
                setMessages(result.data || []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Load error:', err);
                    setError('Failed to load chat history');
                }
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [sessionId]);

    const renderMessage = (msg) => {
        const isUser = msg.type === 'user';
        const bgColor = isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : theme === 'dark'
            ? 'bg-gray-700 rounded-tl-none'
            : 'bg-gray-200 rounded-tl-none';

        return (
            <div
                key={msg.id}
                className={`flex my-3 max-w-4xl ${isUser ? 'justify-end' : 'justify-start'}`}
            >
                {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                        AI
                    </div>
                )}
                <div className={`p-3 max-w-[80%] rounded-xl shadow-md ${bgColor}`}>
                    <p className="text-sm">{msg.text}</p>
                    {msg.data?.type === 'table' && <TableDisplay tableData={msg.data} isDark={theme === 'dark'} />}
                    {msg.timestamp && (
                        <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </div>
                {isUser && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ml-2">
                        U
                    </div>
                )}
            </div>
        );
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: trimmed,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setError(null);

        abortRef.current = new AbortController();

        try {
            const timeoutId = setTimeout(() => abortRef.current?.abort(), TIMEOUT_MS);

            const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: trimmed }),
                signal: abortRef.current.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error('Server error');

            const result = await res.json();
            if (result.data) {
                setMessages((prev) => [...prev, result.data]);
            }
        } catch (err) {
            console.error('Send error:', err);
            setError(err.message || 'Failed to send message');
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    type: 'ai',
                    text: 'Sorry, something went wrong. Try again.',
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header
                className={`p-4 border-b flex justify-between items-center ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
            >
                <h1 className="text-lg font-semibold">{sessionId || 'Chat'}</h1>
                <ThemeToggle />
            </header>

            {/* Error banner */}
            {error && (
                <div className="mx-4 mt-2 p-2 bg-red-100 text-red-800 text-sm rounded">
                    {error}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Start typing!</p>
                    </div>
                ) : (
                    <>
                        {messages.map(renderMessage)}
                        {loading && (
                            <div className="my-3 self-start p-3 rounded-xl bg-gray-700 animate-pulse">
                                <div className="h-3 bg-gray-500 rounded w-24"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <footer
                className={`p-4 border-t flex justify-center ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
            >
                <form onSubmit={handleSend} className="flex w-full max-w-4xl gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-white'
                                : 'bg-white text-gray-800 border border-gray-300'
                        }`}
                        disabled={loading}
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                            loading || !input.trim()
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        Send
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatInterface;