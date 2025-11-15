import React from 'react';
import { useTheme } from '../context/ThemeContext';

const TableDisplay = ({ tableData }) => {
    const { theme } = useTheme();

    if (!tableData || tableData.type !== 'table' || !tableData.headers || !tableData.rows) {
        return null; // Don't render if data is invalid
    }

    const { headers, rows } = tableData;
    
    // Tailwind classes based on theme
    const tableClass = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
    const headerClass = theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-100 text-gray-700';
    const cellClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';

    return (
        <div className="overflow-x-auto my-4 rounded-lg shadow-md">
            <table className={`min-w-full divide-y ${tableClass}`}>
                {/* Table Header */}
                <thead className={headerClass}>
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* Table Body */}
                <tbody className="divide-y divide-gray-200">
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`px-6 py-4 whitespace-nowrap text-sm border-b ${cellClass}`}
                                >
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