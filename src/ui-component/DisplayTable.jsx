import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const transformKey = (key) => {
  return key
    .split('_')
    .map(word => {
      if (word.toLowerCase() === 'esim') {
        return 'M2M';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * DisplayTable
 * @param {object} values        - key/value pairs to display
 * @param {string} title         - table header title
 * @param {object} highlights    - optional map: { [key]: 'match' | 'mismatch' }
 *                                 'match'    → green row
 *                                 'mismatch' → red row
 */
const DisplayTable = ({ values, title, highlights = {} }) => {
  const getRowStyle = (key) => {
    const status = highlights[key];
    if (status === 'match') return { backgroundColor: '#e8f5e9' }; // light green
    if (status === 'mismatch') return { backgroundColor: '#ffebee' }; // light red
    return {};
  };

  const getCellStyle = (key) => {
    const status = highlights[key];
    if (status === 'match') return { color: '#2e7d32', fontWeight: 600 };   // dark green
    if (status === 'mismatch') return { color: '#c62828', fontWeight: 600 }; // dark red
    return {};
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {title}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(values).map((key, index) => (
            <TableRow key={index} style={getRowStyle(key)}>
              <TableCell style={{ width: '50%', ...getCellStyle(key) }}>
                {transformKey(key)}
                {highlights[key] === 'match' && (
                  <span style={{ marginLeft: 6, color: '#2e7d32' }}>✓</span>
                )}
                {highlights[key] === 'mismatch' && (
                  <span style={{ marginLeft: 6, color: '#c62828' }}>✗</span>
                )}
              </TableCell>
              <TableCell style={{ width: '50%', ...getCellStyle(key) }}>
                {values[key] || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DisplayTable;
