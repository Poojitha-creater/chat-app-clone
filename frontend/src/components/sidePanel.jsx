import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = 'http://localhost:3001/api';

const SidePanel = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();
    const { sessionId: currentSessionId } = useParams();
    const { theme } = useTheme();

    // Fetch sessions list on load
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // Fetches the list of sessions from the mock data API
                const response = await fetch(`${API_BASE_URL}/sessions`);
                const data = await response.json();
                setSessions(data);
            } catch (error) {
                console.error("Failed to fetch sessions:", error);
            }
        };
        fetchSessions();
    }, []);

    const handleNewChat = async () => {
        try {
            // Call backend API to create a new session
            const response = await fetch(`${API_BASE_URL}/sessions/new`, { method: 'POST' });
            const data = await response.json();
            
            // Navigate to the new session's URL
            navigate(`/chat/${data.sessionId}`);
            // Optimistically update the session list
            setSessions(prev => [data, ...prev.filter(s => s.id !== data.sessionId)]);
            setIsCollapsed(false); // Open panel on new chat
        } catch (error) {
            console.error('Error starting new chat:', error);
        }
    };

    const panelClasses = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    
    // Conditional styling for the active session link
    const linkClasses = (id) => `p-2 my-1 rounded-lg truncate cursor-pointer transition-colors ${
        id === currentSessionId 
            ? (theme === 'dark' ? 'bg-indigo-700' : 'bg-indigo-100 text-indigo-700 font-semibold')
            : (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
    }`;

    // Conditional classes for the collapse button icon (using SVG for simplicity)
    const collapseIcon = isCollapsed 
        ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg> // Arrow right
        : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>; // Arrow left

    return (
        <aside className={`h-full flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'} border-r ${panelClasses}`}>
            <div className="flex flex-col h-full">
                {/* Header and Toggle Button */}
                <div className={`flex items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    {!isCollapsed && <h1 className="text-xl font-bold flex-1">Chat AI</h1>}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                        {collapseIcon}
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <button onClick={handleNewChat} className={`w-full flex items-center justify-center p-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}>
                        <span className="text-xl mr-2">+</span>
                        {!isCollapsed && 'New Chat'}
                    </button>
                </div>

                {/* Session History */}
                <div className="flex-1 overflow-y-auto p-2">
                    {!isCollapsed && <h3 className="text-xs font-medium uppercase opacity-50 px-2 mt-4 mb-1">Sessions</h3>}
                    {sessions.map(session => (
                        <div 
                            key={session.id} 
                            onClick={() => navigate(`/chat/${session.id}`)}
                            className={linkClasses(session.id)}
                            title={session.title || session.id}
                        >
                            {isCollapsed ? <span className="block text-center">{session.title.charAt(0)}</span> : session.title}
                        </div>
                    ))}
                </div>

                {/* User Info (Bottom) */}
                <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">U</div>
                        {!isCollapsed && <span className="ml-3 font-medium">Test User</span>}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidePanel;