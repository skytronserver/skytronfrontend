import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Typography, Chip, MenuItem } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { IconSearch } from '@tabler/icons';

const DrivingAlerts = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    alertType: 'All',
  });

  // Mock Data
  const columns = [
    { field: 'id', headerName: 'Alert ID', width: 100 },
    { field: 'timestamp', headerName: 'Date & Time', width: 180 },
    { field: 'vehicleNo', headerName: 'Vehicle No.', width: 150 },
    { field: 'driver', headerName: 'Driver', width: 150 },
    { 
      field: 'alertType', 
      headerName: 'Alert Type', 
      width: 180,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Harsh Braking') color = 'error';
        else if (params.value === 'Harsh Acceleration') color = 'warning';
        else if (params.value === 'Over Speeding') color = 'error';
        else if (params.value === 'Sharp Turn') color = 'info';

        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'severity', headerName: 'Severity', width: 100 },
  ];

  const rows = [
    { id: 'AL-001', timestamp: '2023-10-27 08:15:22', vehicleNo: 'KA-01-AB-1234', driver: 'Ramesh K.', alertType: 'Harsh Braking', location: 'MG Road Junction', severity: 'High' },
    { id: 'AL-002', timestamp: '2023-10-27 08:45:10', vehicleNo: 'KA-02-CD-5678', driver: 'Suresh M.', alertType: 'Over Speeding', location: 'Highway 44', severity: 'High' },
    { id: 'AL-003', timestamp: '2023-10-27 09:12:05', vehicleNo: 'KA-01-AB-1234', driver: 'Ramesh K.', alertType: 'Sharp Turn', location: 'Brigade Road', severity: 'Medium' },
    { id: 'AL-004', timestamp: '2023-10-27 10:05:30', vehicleNo: 'KA-04-GH-3456', driver: 'Rajesh S.', alertType: 'Harsh Acceleration', location: 'Tech Park Exit', severity: 'Low' },
    { id: 'AL-005', timestamp: '2023-10-27 11:20:45', vehicleNo: 'KA-05-IJ-7890', driver: 'Vikram A.', alertType: 'Harsh Braking', location: 'City Center', severity: 'High' },
    { id: 'AL-006', timestamp: '2023-10-27 12:15:00', vehicleNo: 'KA-03-EF-9012', driver: 'Mahesh P.', alertType: 'Over Speeding', location: 'Outer Ring Road', severity: 'High' },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <MainCard title="Driving Pattern Alerts">
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date & Time"
              type="datetime-local"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date & Time"
              type="datetime-local"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Alert Type"
              name="alertType"
              value={filters.alertType}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="All">All Alerts</MenuItem>
              <MenuItem value="Harsh Braking">Harsh Braking</MenuItem>
              <MenuItem value="Harsh Acceleration">Harsh Acceleration</MenuItem>
              <MenuItem value="Over Speeding">Over Speeding</MenuItem>
              <MenuItem value="Sharp Turn">Sharp Turn</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="primary" startIcon={<IconSearch />} fullWidth sx={{ height: '40px' }}>
              Search Alerts
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Showing deriving pattern violations such as harsh braking, sudden acceleration, over-speeding, and sharp turns.
        </Typography>
      </Box>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Box>
    </MainCard>
  );
};

export default DrivingAlerts;
