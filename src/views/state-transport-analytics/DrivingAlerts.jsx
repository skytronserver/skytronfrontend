import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, MenuItem, Button, Grid, Typography, Card, CardContent, Chip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { IconSearch } from '@tabler/icons';
import AnalyticsService from '../../services/AnalyticsService';

const DrivingAlerts = () => {
  // Default to last 30 days
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const [filters, setFilters] = useState({
    start_datetime: defaultStartDate.toISOString().slice(0, 16),
    end_datetime: new Date().toISOString().slice(0, 16),
    alert_type: 'All',
    vehicle_reg_no: '',
    vehicle_category_id: 'All',
    state_id: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalRecords: 0,
  });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const [summaryData, setSummaryData] = useState({
    total_alerts: 0,
    harsh_braking_count: 0,
    harsh_turn_count: 0,
    harsh_acceleration_count: 0,
    overspeed_count: 0,
    route_overspeed_count: 0,
    idling_count: 0,
    unauthorized_stop_count: 0,
    unauthorized_skip_count: 0,
    tilt_count: 0
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: 'id', headerName: 'Alert ID', width: 90 },
    { 
      field: 'timestamp', 
      headerName: 'Date & Time', 
      width: 170, 
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' 
    },
    { field: 'vehicle_reg_no', headerName: 'Vehicle No.', width: 140 },
    { field: 'vehicle_category', headerName: 'Category', width: 130 },
    { field: 'state_name', headerName: 'State', width: 130 },
    { 
      field: 'alert_type_display', 
      headerName: 'Alert Type', 
      width: 180,
      renderCell: (params) => {
        let color = 'default';
        const type = params.row.type;
        if (type === 'HarshBreak' || type === 'HarshAcceleration') color = 'warning';
        else if (type === 'OverSpeed' || type === 'Route_overspeed') color = 'error';
        else if (type === 'HarshTurn' || type === 'Tilt') color = 'info';

        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    { field: 'alert_details', headerName: 'Details', width: 200 },
    { 
      field: 'location', 
      headerName: 'Location (Lat, Lng)', 
      width: 200,
      valueGetter: (params) => {
        if (params.row.latitude && params.row.longitude) {
          return `${params.row.latitude}, ${params.row.longitude}`;
        }
        return 'N/A';
      }
    },
  ];

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_datetime: new Date(filters.start_datetime).toISOString(),
        end_datetime: new Date(filters.end_datetime).toISOString(),
        page: paginationModel.page + 1, // DataGrid is 0-indexed, API is 1-indexed
        page_size: paginationModel.pageSize,
      };

      if (filters.alert_type && filters.alert_type !== 'All') {
        params.alert_type = filters.alert_type;
      }
      if (filters.vehicle_reg_no) {
        params.vehicle_reg_no = filters.vehicle_reg_no;
      }
      if (filters.vehicle_category_id && filters.vehicle_category_id !== 'All') {
        params.vehicle_category_id = filters.vehicle_category_id;
      }
      if (filters.state_id) {
        params.state_id = filters.state_id;
      }

      const response = await AnalyticsService.getDrivingAlerts(params);
      
      if (response && response.success) {
        setRows(response.data || []);
        setSummaryData(response.summary || {
          total_alerts: 0, harsh_braking_count: 0, harsh_turn_count: 0, harsh_acceleration_count: 0, 
          overspeed_count: 0, route_overspeed_count: 0, idling_count: 0, unauthorized_stop_count: 0, 
          unauthorized_skip_count: 0, tilt_count: 0
        });
        setPagination({
          page: response.pagination.page,
          pageSize: response.pagination.page_size,
          totalRecords: response.pagination.total_records,
        });
      }
    } catch (error) {
      console.error('Error fetching driving alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.start_datetime, filters.end_datetime, filters.alert_type, filters.vehicle_reg_no, filters.vehicle_category_id, filters.state_id, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    if (paginationModel.page !== 0) {
      setPaginationModel({ ...paginationModel, page: 0 }); 
    } else {
      fetchAlerts(); 
    }
  };

  return (
    <MainCard title="Driving Pattern Alerts">
      {/* Filters Section */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date & Time"
              type="datetime-local"
              name="start_datetime"
              value={filters.start_datetime}
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
              name="end_datetime"
              value={filters.end_datetime}
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
              name="alert_type"
              value={filters.alert_type}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="All">All Alerts</MenuItem>
              <MenuItem value="HarshBreak">Harsh Braking</MenuItem>
              <MenuItem value="HarshTurn">Harsh Turn</MenuItem>
              <MenuItem value="HarshAcceleration">Harsh Acceleration</MenuItem>
              <MenuItem value="OverSpeed">Over Speed</MenuItem>
              <MenuItem value="Route_overspeed">Route Overspeed</MenuItem>
              <MenuItem value="Idling">Idling</MenuItem>
              <MenuItem value="UnauthorizedStop">Unauthorized Stop</MenuItem>
              <MenuItem value="UnauthorizedSkip">Unauthorized Skip</MenuItem>
              <MenuItem value="Tilt">Tilt</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Vehicle No."
              name="vehicle_reg_no"
              value={filters.vehicle_reg_no}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Vehicle Type"
              name="vehicle_category_id"
              value={filters.vehicle_category_id}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="1">School Bus (1)</MenuItem>
              <MenuItem value="2">Truck (2)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="primary" startIcon={<IconSearch />} fullWidth sx={{ height: '40px' }} onClick={handleApplyFilters}>
              Search Alerts
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Alerts</Typography>
              <Typography variant="h4">{summaryData.total_alerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Over Speeding</Typography>
              <Typography variant="h4" color="error.main">{summaryData.overspeed_count + summaryData.route_overspeed_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Harsh Braking</Typography>
              <Typography variant="h4" color="warning.main">{summaryData.harsh_braking_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Harsh Acceleration</Typography>
              <Typography variant="h4" color="warning.main">{summaryData.harsh_acceleration_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Harsh Turn</Typography>
              <Typography variant="h4" color="info.main">{summaryData.harsh_turn_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid Section */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.totalRecords}
          page={paginationModel.page}
          onPageChange={(newPage) => setPaginationModel({ ...paginationModel, page: newPage })}
          pageSize={paginationModel.pageSize}
          onPageSizeChange={(newPageSize) => setPaginationModel({ ...paginationModel, pageSize: newPageSize })}
          rowsPerPageOptions={[10, 20, 50, 100]}
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
