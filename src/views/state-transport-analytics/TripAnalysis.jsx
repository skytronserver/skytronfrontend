import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Grid, Typography, Card, CardContent } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { IconSearch } from '@tabler/icons';

const TripAnalysis = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicleClass: 'All',
  });

  // Mock Data
  const summaryData = {
    totalTrips: 1540,
    totalDistance: '42,500 km',
    avgDuration: '2h 15m',
    onTimePercentage: '88%'
  };

  const columns = [
    { field: 'id', headerName: 'Trip ID', width: 100 },
    { field: 'route', headerName: 'Route Name', width: 180 },
    { field: 'vehicleNo', headerName: 'Vehicle No.', width: 130 },
    { field: 'class', headerName: 'Class', width: 120 },
    { field: 'startTime', headerName: 'Start Time', width: 160 },
    { field: 'endTime', headerName: 'End Time', width: 160 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'driver', headerName: 'Driver Name', width: 150 },
  ];

  const rows = [
    { id: 'TRP-101', route: 'City Center - Airport', vehicleNo: 'KA-01-AB-1234', class: 'AC Sleeper', startTime: '2023-10-27 08:00', endTime: '2023-10-27 09:15', status: 'Completed', driver: 'Ramesh K.' },
    { id: 'TRP-102', route: 'North Depot - South Point', vehicleNo: 'KA-02-CD-5678', class: 'Non-AC Seater', startTime: '2023-10-27 08:30', endTime: '2023-10-27 10:00', status: 'Completed', driver: 'Suresh M.' },
    { id: 'TRP-103', route: 'East End - West Side', vehicleNo: 'KA-03-EF-9012', class: 'Volvo AC', startTime: '2023-10-27 09:00', endTime: '2023-10-27 11:30', status: 'In Progress', driver: 'Mahesh P.' },
    { id: 'TRP-104', route: 'Tech Park - Railway Stn', vehicleNo: 'KA-04-GH-3456', class: 'Mini Bus', startTime: '2023-10-27 10:00', endTime: '2023-10-27 10:45', status: 'Canceled', driver: 'Rajesh S.' },
    { id: 'TRP-105', route: 'Suburb - City Center', vehicleNo: 'KA-05-IJ-7890', class: 'AC Seater', startTime: '2023-10-27 10:15', endTime: '2023-10-27 11:15', status: 'In Progress', driver: 'Vikram A.' },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <MainCard title="Trip Analysis">
      {/* Filters Section */}
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
              label="Vehicle Class"
              name="vehicleClass"
              value={filters.vehicleClass}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="All">All Classes</MenuItem>
              <MenuItem value="AC Sleeper">AC Sleeper</MenuItem>
              <MenuItem value="Volvo AC">Volvo AC</MenuItem>
              <MenuItem value="AC Seater">AC Seater</MenuItem>
              <MenuItem value="Non-AC Seater">Non-AC Seater</MenuItem>
              <MenuItem value="Mini Bus">Mini Bus</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="primary" startIcon={<IconSearch />} fullWidth sx={{ height: '40px' }}>
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Trips</Typography>
              <Typography variant="h4">{summaryData.totalTrips}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Distance</Typography>
              <Typography variant="h4">{summaryData.totalDistance}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Avg. Duration</Typography>
              <Typography variant="h4">{summaryData.avgDuration}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">On-Time Performance</Typography>
              <Typography variant="h4" color="success.main">{summaryData.onTimePercentage}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid Section */}
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
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

export default TripAnalysis;
