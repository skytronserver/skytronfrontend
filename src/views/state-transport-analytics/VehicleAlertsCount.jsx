import React, { useState } from 'react';
import { Box, TextField, Button, Grid } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { IconSearch } from '@tabler/icons';

const VehicleAlertsCount = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  // Mock Data
  const columns = [
    { field: 'id', headerName: 'Vehicle ID', width: 100 },
    { field: 'vehicleNo', headerName: 'Vehicle No.', width: 150 },
    { field: 'fleetName', headerName: 'Fleet / Depot', width: 150 },
    { field: 'driver', headerName: 'Primary Driver', width: 150 },
    { field: 'harshBraking', headerName: 'Harsh Braking', width: 130, type: 'number' },
    { field: 'harshAcceleration', headerName: 'Harsh Accel', width: 120, type: 'number' },
    { field: 'overSpeeding', headerName: 'Over Speeding', width: 130, type: 'number' },
    { field: 'sharpTurn', headerName: 'Sharp Turn', width: 120, type: 'number' },
    { field: 'sosAlerts', headerName: 'SOS Alerts', width: 120, type: 'number' },
    { 
      field: 'totalAlerts', 
      headerName: 'Total Alerts', 
      width: 120, 
      type: 'number',
      valueGetter: (params) => 
        (params.row.harshBraking || 0) + 
        (params.row.harshAcceleration || 0) + 
        (params.row.overSpeeding || 0) + 
        (params.row.sharpTurn || 0) +
        (params.row.sosAlerts || 0)
    },
  ];

  const rows = [
    { id: 'V-001', vehicleNo: 'KA-01-AB-1234', fleetName: 'Central Depot', driver: 'Ramesh K.', harshBraking: 12, harshAcceleration: 4, overSpeeding: 2, sharpTurn: 5, sosAlerts: 0 },
    { id: 'V-002', vehicleNo: 'KA-02-CD-5678', fleetName: 'North Depot', driver: 'Suresh M.', harshBraking: 3, harshAcceleration: 1, overSpeeding: 15, sharpTurn: 2, sosAlerts: 1 },
    { id: 'V-003', vehicleNo: 'KA-03-EF-9012', fleetName: 'East Depot', driver: 'Mahesh P.', harshBraking: 8, harshAcceleration: 6, overSpeeding: 0, sharpTurn: 8, sosAlerts: 0 },
    { id: 'V-004', vehicleNo: 'KA-04-GH-3456', fleetName: 'West Depot', driver: 'Rajesh S.', harshBraking: 1, harshAcceleration: 0, overSpeeding: 1, sharpTurn: 1, sosAlerts: 0 },
    { id: 'V-005', vehicleNo: 'KA-05-IJ-7890', fleetName: 'South Depot', driver: 'Vikram A.', harshBraking: 20, harshAcceleration: 15, overSpeeding: 8, sharpTurn: 12, sosAlerts: 2 },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <MainCard title="Vehicle Alerts Aggregate Count">
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" color="primary" startIcon={<IconSearch />} fullWidth sx={{ height: '40px' }}>
              Aggregate Data
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'totalAlerts', sort: 'desc' }],
            },
          }}
        />
      </Box>
    </MainCard>
  );
};

export default VehicleAlertsCount;
