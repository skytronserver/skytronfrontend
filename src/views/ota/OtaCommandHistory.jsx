import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, MenuItem } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import SendCommandPopup from './SendCommandPopup';

const mockHistoryData = [
  {
    id: 1,
    otaId: 'OTA-001',
    commandType: 'Reboot',
    commandSend: 'REBOOT_CMD',
    replyReceive: 'OK',
    imei: '123456789012345',
    source: 'Admin User',
    sendAt: '2026-07-07 10:00:00',
    receivedAt: '2026-07-07 10:00:05',
    replyRegexOutput: 'Match',
    deviceTag: 'Device A'
  }
];

const OtaCommandHistory = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [rows, setRows] = useState(mockHistoryData);
  const [searchField, setSearchField] = useState('registration');
  const [searchValue, setSearchValue] = useState('');

  const columns = [
    { field: 'otaId', headerName: 'OTA ID', width: 120 },
    { field: 'commandType', headerName: 'Command Type', width: 150 },
    { field: 'commandSend', headerName: 'Command Sent', width: 150 },
    { field: 'replyReceive', headerName: 'Reply Received', width: 150 },
    { field: 'imei', headerName: 'IMEI', width: 150 },
    { field: 'source', headerName: 'Source', width: 130 },
    { field: 'sendAt', headerName: 'Sent At', width: 160 },
    { field: 'receivedAt', headerName: 'Received At', width: 160 },
    { field: 'replyRegexOutput', headerName: 'Reply Output', width: 130 },
    { field: 'deviceTag', headerName: 'Device Tag', width: 130 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">OTA Command History</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenPopup(true)}>
          Send Command
        </Button>
      </Box>

      {/* Custom Search Bar */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">Search By:</Typography>
        <TextField 
          select 
          size="small" 
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="registration">Registration No</MenuItem>
          <MenuItem value="imei">IMEI</MenuItem>
          <MenuItem value="dealer">Dealer</MenuItem>
        </TextField>
        
        <TextField 
          size="small" 
          placeholder="Enter search value..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ flexGrow: 1 }}
        />

        <Button variant="contained" color="secondary">Search</Button>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <SendCommandPopup open={openPopup} handleClose={() => setOpenPopup(false)} />
    </Box>
  );
};

export default OtaCommandHistory;
