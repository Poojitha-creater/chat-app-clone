import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TableDisplay from './TableDisplay';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

/**
 * ChatInterface Component
 * Manages chat session display, message history, and user interactions
 */

const API_BASE_URL = 'http://localhost:3001/api/v1';
const SCROLL_BEHAVIOR = 'smooth';
const REQUEST_TIMEOUT = 30000; // 30 seconds

const ChatInterface = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();

    // State management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionData, setSessionData] = useState(null);

    // Refs
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    /**
     * Auto-scroll to latest message when messages update
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: SCROLL_BEHAVIOR });
    }, [messages, isLoading]);

    /**
     * Fetch chat history on session change
     */
    useEffect(() => {
        if (!sessionId) {
            setError('Invalid session. Please start a new chat.');
            return;
        }

        const loadChatHistory = async () => {
            setIsLoading(true);
            setError(null);
            abortControllerRef.current = new AbortController();

            try {
                const timeoutId = setTimeout(() => {
                    abortControllerRef.current?.abort();
                }, REQUEST_TIMEOUT);

                const response = await fetch(
                    `${API_BASE_URL}/sessions/${sessionId}/history`,
                    { signal: abortControllerRef.current.signal }
                );

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Failed to load chat history (${response.status})`);
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    setMessages(result.data);
                } else {
                    setMessages([]);
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    setError('Request timeout. Please try again.');
                } else {
                    console.error('Error loading chat history:', err);
                    setError('Unable to load chat history. Please try again.');
                }
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Store session data
        setSessionData({
            id: sessionId,
            createdAt: new Date(),
        });

        loadChatHistory();
    }, [sessionId]);

    /**
     * Render individual message bubble with avatar and optional data visualization
     */
    const renderMessage = (msg) => {
        const isUser = msg.type === 'user';

        const messageClasses = isUser
            ? 'self-end bg-indigo-600 text-white rounded-br-none'
            : theme === 'dark'
            ? 'self-start bg-gray-700 text-gray-100 rounded-tl-none'
            : 'self-start bg-gray-200 text-gray-900 rounded-tl-none';

        const AvatarComponent = () => (
            <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    isUser ? 'bg-indigo-600' : 'bg-emerald-500'
                }`}
                title={isUser ? 'You' : 'Assistant'}
            >
                {isUser ? 'U' : 'AI'}
            </div>
        );

        return (
            <div
                key={msg.id}
                className={`flex my-3 max-w-4xl ${isUser ? 'justify-end pr-2' : 'justify-start pl-2'} w-full`}
            >
                {!isUser && <AvatarComponent />}
                <div className={`ml-2 mr-2 p-3 max-w-[80%] break-words rounded-xl shadow-md ${messageClasses}`}>
                    <p className="text-sm">{msg.text}</p>
                    {msg.data?.type === 'table' && (
                        <div className="mt-3 border-t border-opacity-30 border-white pt-3">
                            <TableDisplay tableData={msg.data} isDark={theme === 'dark'} />
                        </div>
                    )}
                    {msg.timestamp && (
                        <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </div>
                {isUser && <AvatarComponent />}
            </div>
        );
    };

    /**
     * Handle sending user message
     */
    const handleSend = async (e) => {
        e.preventDefault();

        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // Create user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: trimmedInput,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        try {
            const timeoutId = setTimeout(() => {
                abortControllerRef.current?.abort();
            }, REQUEST_TIMEOUT);

            const response = await fetch(
                `${API_BASE_URL}/sessions/${sessionId}/question`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: trimmedInput }),
                    signal: abortControllerRef.current.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `API error (${response.status}): Failed to get response from server`
                );
            }

            const result = await response.json();

            if (result.success && result.data) {
                setMessages((prev) => [...prev, result.data]);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                setError('Request timeout. Please check your connection and try again.');
            } else {
                console.error('Error sending message:', err);
                setError(err.message || 'Failed to send message. Please try again.');
            }

            // Add error message to chat
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: '❌ Sorry, I encountered an error processing your request. Please try again.',
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Clear conversation
     */
    const handleClearChat = () => {
        if (window.confirm('Clear all messages in this chat?')) {
            setMessages([]);
            setError(null);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header with session info and controls */}
            <header
                className={`p-4 border-b flex items-center justify-between ${
                    theme === 'dark'
                        ? 'border-gray-700 bg-gray-800'
                        : 'border-gray-200 bg-white'
                }`}
            >
                <div className="flex-1">
                    {sessionData && (
                        <h1 className="text-lg font-semibold">
                            {sessionData.id}
                            <span className="text-xs opacity-70 ml-2">
                                Started {sessionData.createdAt.toLocaleTimeString()}
                            </span>
                        </h1>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="px-3 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                            title="Clear all messages"
                        >
                            Clear
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            {/* Error notification */}
            {error && (
                <div className="mx-4 mt-3 p-3 bg-red-100 text-red-800 rounded-lg text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-600 hover:text-red-800 font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Chat message area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="text-4xl">💬</div>
                        <h2 className="text-xl font-semibold">Start your conversation</h2>
                        <p className="opacity-70 text-center max-w-sm">
                            Type your question below and get instant responses with data visualizations
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        {messages.map(renderMessage)}
                        {isLoading && (
                            <div className="my-3 self-start pl-2 p-3 rounded-xl shadow-md max-w-xs w-full bg-gray-700 rounded-tl-none animate-pulse">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input footer */}
            <footer
                className={`p-4 border-t flex justify-center ${
                    theme === 'dark'
                        ? 'border-gray-700 bg-gray-800'
                        : 'border-gray-200 bg-white'
                }`}
            >
                <form onSubmit={handleSend} className="flex w-full max-w-4xl gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className={`flex-1 p-3 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600'
                                : 'bg-white text-gray-800 placeholder-gray-500 border border-gray-300'
                        }`}
                        disabled={isLoading}
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        className={`px-6 rounded-r-xl font-semibold transition duration-150 flex items-center justify-center ${
                            isLoading || !input.trim()
                                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        disabled={isLoading || !input.trim()}
                        title="Send message (Enter)"
                    >
                        {isLoading ? (
                            <span className="inline-block animate-spin mr-2">⏳</span>
                        ) : (
                            '→'
                        )}
                        {isLoading ? 'Sending' : 'Send'}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatInterface;