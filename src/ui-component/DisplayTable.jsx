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
        return 'eSIM';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const DisplayTable = ({ values, title }) => {
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
            <TableRow key={index}>
              <TableCell style={{ width: '50%' }}>{transformKey(key)}</TableCell>
              <TableCell style={{ width: '50%' }}>{values[key]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DisplayTable;
