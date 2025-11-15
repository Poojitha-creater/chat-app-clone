import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import SidePanel from './components/sidePanel';
import './index.css'; // Make sure the Tailwind CSS is imported

// This component wraps the main layout and applies theme classes globally
const AppContent = () => {
    const { theme } = useTheme();

    return (
        // The main container applies the dark mode classes to the body
        <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
            <SidePanel />
            <main className="flex-1 flex flex-col min-w-0">
                <Routes>
                    {/* Route for the initial 'New Chat' screen */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* Route for active chat sessions, linked to the URL */}
                    <Route path="/chat/:sessionId" element={<ChatInterface />} />
                </Routes>
            </main>
        </div>
    );
};

// This is the root component that sets up routing and context
const App = () => (
    <ThemeProvider>
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    </ThemeProvider>
);

export default App;