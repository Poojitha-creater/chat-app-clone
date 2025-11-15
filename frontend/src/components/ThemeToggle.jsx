import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    // Use Tailwind classes for icons based on theme
    const icon = theme === 'light' ? '🌙' : '☀️';
    const buttonClass = theme === 'light' 
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
        : 'bg-gray-700 text-yellow-400 hover:bg-gray-600';

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full shadow-md transition-colors duration-300 ${buttonClass}`}
            aria-label="Toggle Dark/Light Mode"
        >
            <span role="img" aria-label="Theme Icon" className="text-xl">
                {icon}
            </span>
        </button>
    );
};

export default ThemeToggle;