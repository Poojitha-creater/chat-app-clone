import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * TableDisplay Component
 * Renders structured data in a responsive, theme-aware table format
 * 
 * @param {Object} props
 * @param {Object} props.tableData - Data structure { type, headers, rows }
 * @param {boolean} props.isDark - Optional: override theme for table styling
 */
const TableDisplay = ({ tableData, isDark }) => {
    const { theme } = useTheme();
    const isDarkMode = isDark !== undefined ? isDark : theme === 'dark';

    // Validate data structure
    const isValidData = useMemo(() => {
        return (
            tableData &&
            tableData.type === 'table' &&
            Array.isArray(tableData.headers) &&
            tableData.headers.length > 0 &&
            Array.isArray(tableData.rows) &&
            tableData.rows.length > 0 &&
            tableData.rows.every((row) => Array.isArray(row) && row.length === tableData.headers.length)
        );
    }, [tableData]);

    if (!isValidData) {
        return null;
    }

    const { headers, rows } = tableData;

    // Theme-aware styling
    const tableStyles = {
        container: isDarkMode
            ? 'bg-gray-700 border-gray-600 divide-gray-600'
            : 'bg-white border-gray-300 divide-gray-300',
        header: isDarkMode
            ? 'bg-gray-600 text-gray-100'
            : 'bg-gray-100 text-gray-700',
        rowHover: isDarkMode
            ? 'hover:bg-gray-750 transition-colors'
            : 'hover:bg-gray-50 transition-colors',
        cell: isDarkMode
            ? 'border-gray-600 text-gray-100'
            : 'border-gray-300 text-gray-900',
    };

    return (
        <div className="overflow-x-auto rounded-lg shadow-md border">
            <table className={`min-w-full divide-y ${tableStyles.container}`}>
                {/* Table Header */}
                <thead className={tableStyles.header}>
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={`header-${index}`}
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className={`divide-y ${tableStyles.container}`}>
                    {rows.map((row, rowIndex) => (
                        <tr key={`row-${rowIndex}`} className={tableStyles.rowHover}>
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={`cell-${rowIndex}-${cellIndex}`}
                                    className={`px-4 py-3 text-sm whitespace-nowrap ${tableStyles.cell}`}
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