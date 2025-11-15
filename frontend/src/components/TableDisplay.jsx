import React from 'react';
import { useTheme } from '../context/ThemeContext';

const TableDisplay = ({ tableData, isDark }) => {
    const { theme } = useTheme();
    const darkMode = isDark !== undefined ? isDark : theme === 'dark';

    if (!tableData || !tableData.headers || !tableData.rows) {
        return null;
    }

    const { headers, rows } = tableData;

    return (
        <div className="overflow-x-auto my-3 rounded-lg">
            <table className={`min-w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-200'}>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="px-4 py-2 text-left text-xs font-semibold">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-300'}`}>
                    {rows.map((row, i) => (
                        <tr key={i} className={darkMode ? 'hover:bg-gray-650' : 'hover:bg-gray-100'}>
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2 text-sm">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableDisplay;