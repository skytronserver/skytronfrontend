import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField, MenuItem } from '@mui/material';
// Need ExpandMoreIcon? Since we aren't sure if @mui/icons-material is installed, we can just use a simple string like "▼" or a basic button text if Accordion is too complex. 
// Let's stick to a simple Box that can be toggled to show advanced filters.
import { DataGrid } from '@mui/x-data-grid';
import SendCommandPopup from './SendCommandPopup';
import { getAxiosInstance } from '../../services/axiosInstance';
import DealerServices from '../../services/DealerServices';

const OtaCommandHistory = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dealers, setDealers] = useState([]);

  // Search States
  const [searchField, setSearchField] = useState('registration_no');
  const [searchValue, setSearchValue] = useState('');
  
  // Advanced Filter States
  const [otaIdFilter, setOtaIdFilter] = useState('');
  const [commandTypeFilter, setCommandTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sentFrom, setSentFrom] = useState('');
  const [sentTo, setSentTo] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const axios = getAxiosInstance();
      const payload = {};
      
      if (searchValue) payload[searchField] = searchValue;
      if (otaIdFilter) payload.ota_id = otaIdFilter;
      if (commandTypeFilter !== 'all') payload.command_type = commandTypeFilter;
      if (sourceFilter !== 'all') payload.source = sourceFilter;
      if (statusFilter !== 'all') payload.send_status = statusFilter;
      if (sentFrom) payload.sent_from = new Date(sentFrom).toISOString();
      if (sentTo) payload.sent_to = new Date(sentTo).toISOString();
      
      const response = await axios.post('/api/ota/command/history/filter/', payload);
      if (response.data?.status === 'success') {
        setRows(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OTA history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchField('registration_no');
    setSearchValue('');
    setOtaIdFilter('');
    setCommandTypeFilter('all');
    setSourceFilter('all');
    setStatusFilter('all');
    setSentFrom('');
    setSentTo('');
  };

  useEffect(() => {
    fetchHistory();
    const fetchDealers = async () => {
      try {
        const response = await DealerServices.dealerList({});
        if (response.data?.data) {
          setDealers(response.data.data);
        } else if (response.data?.info) {
          setDealers(response.data.info);
        } else if (Array.isArray(response.data)) {
          setDealers(response.data);
        }
      } catch (err) {
        console.error("Error fetching dealers", err);
      }
    };
    fetchDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { 
      field: 'otaId', 
      headerName: 'OTA ID', 
      width: 120,
      valueGetter: (params) => params.row?.ota_command_info?.command_id || ''
    },
    { field: 'command_type', headerName: 'Command Type', width: 130 },
    { field: 'command_sent', headerName: 'Command Sent', width: 150 },
    { field: 'reply_received', headerName: 'Reply Received', width: 150 },
    { field: 'imei', headerName: 'IMEI', width: 150 },
    { field: 'source', headerName: 'Source', width: 110 },
    { field: 'send_status', headerName: 'Status', width: 130 },
    { field: 'sent_at', headerName: 'Sent At', width: 160 },
    { field: 'received_at', headerName: 'Received At', width: 160 },
    { field: 'reply_regex_output', headerName: 'Reply Output', width: 130 },
    { 
      field: 'deviceTag', 
      headerName: 'Device Tag (Reg No)', 
      width: 160,
      valueGetter: (params) => params.row?.device_tag_info?.vehicle_reg_no || ''
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">OTA Command History</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenPopup(true)}>
          Send Command
        </Button>
      </Box>

      {/* Main Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: showAdvanced ? 2 : 0 }}>
          <Typography variant="subtitle1" fontWeight="bold">Search By:</Typography>
          <TextField 
            select 
            size="small" 
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="registration_no">Registration No</MenuItem>
            <MenuItem value="imei">IMEI</MenuItem>
            <MenuItem value="dealer_name">Dealer RFC(Retro Fitment Center) Name</MenuItem>
            <MenuItem value="owner_name">Owner Name</MenuItem>
            <MenuItem value="manufacturer_name">Manufacturer Name</MenuItem>
            <MenuItem value="district">District</MenuItem>
          </TextField>
          
          {searchField === 'dealer_name' ? (
            <TextField
              select
              size="small"
              label="Select Dealer RFC(Retro Fitment Center)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ flexGrow: 1 }}
            >
              <MenuItem value=""><em>Select a Dealer RFC(Retro Fitment Center)...</em></MenuItem>
              {dealers.map((dealer) => (
                <MenuItem key={dealer.id} value={dealer.company_name || dealer.name || ''}>
                  {dealer.company_name || dealer.name || `Dealer RFC(Retro Fitment Center) ID: ${dealer.id}`}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField 
              size="small" 
              placeholder="Enter search value..."
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          )}

          <Button variant="outlined" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}
          </Button>

          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => fetchHistory()}
          >
            Search
          </Button>
        </Box>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
            
            <TextField 
              size="small" 
              label="Exact OTA ID" 
              value={otaIdFilter}
              onChange={(e) => setOtaIdFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            />

            <TextField 
              select 
              size="small" 
              label="Command Type"
              value={commandTypeFilter}
              onChange={(e) => setCommandTypeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="get">Get</MenuItem>
              <MenuItem value="set">Set</MenuItem>
              <MenuItem value="clear">Clear</MenuItem>
            </TextField>

            <TextField 
              select 
              size="small" 
              label="Source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="mqtt">MQTT</MenuItem>
            </TextField>

            <TextField 
              select 
              size="small" 
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="queued">Queued</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="replied">Replied</MenuItem>
              <MenuItem value="timeout">Timeout</MenuItem>
            </TextField>

            <TextField
              size="small"
              label="Sent From"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={sentFrom}
              onChange={(e) => setSentFrom(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <TextField
              size="small"
              label="Sent To"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={sentTo}
              onChange={(e) => setSentTo(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <Button variant="text" color="error" onClick={handleClearFilters} sx={{ ml: 'auto' }}>
              Clear All Filters
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <SendCommandPopup 
        open={openPopup} 
        handleClose={() => {
          setOpenPopup(false);
          fetchHistory(); // Refresh after sending
        }} 
      />
    </Box>
  );
};

export default OtaCommandHistory;
