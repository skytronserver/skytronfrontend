import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, MenuItem, Button, Grid, Typography, Card, CardContent } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { IconSearch } from '@tabler/icons';
import AnalyticsService from '../../services/AnalyticsService';

const TripAnalysis = () => {
  // Default to last 30 days
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const [filters, setFilters] = useState({
    start_datetime: defaultStartDate.toISOString().slice(0, 16),
    end_datetime: new Date().toISOString().slice(0, 16),
    vehicle_category_id: '',
    status: '',
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
    total_trips: 0,
    created_trips: 0,
    ended_trips: 0,
    canceled_trips: 0,
    total_distance_travel: 0,
    average_distance_travel: 0
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: 'id', headerName: 'Trip ID', width: 90 },
    { field: 'trip_name', headerName: 'Trip Name', width: 180 },
    { field: 'vehicle_reg_no', headerName: 'Vehicle Reg No.', width: 140 },
    { field: 'vehicle_category', headerName: 'Category', width: 130 },
    { 
      field: 'distance_travel', 
      headerName: 'Distance', 
      width: 120, 
      valueFormatter: (params) => params.value ? `${parseFloat(params.value).toFixed(2)} km` : '0 km' 
    },
    { field: 'expected_time_of_travel', headerName: 'Duration', width: 140 },
    { field: 'status', headerName: 'Status', width: 110 },
    { 
      field: 'created_at', 
      headerName: 'Created At', 
      width: 170, 
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' 
    },
    { 
      field: 'updated_at', 
      headerName: 'Updated At', 
      width: 170, 
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '' 
    },
    { field: 'mobile_no', headerName: 'Mobile No.', width: 130 },
  ];

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_datetime: new Date(filters.start_datetime).toISOString(),
        end_datetime: new Date(filters.end_datetime).toISOString(),
        page: paginationModel.page + 1, // DataGrid is 0-indexed, API is 1-indexed
        page_size: paginationModel.pageSize,
      };

      if (filters.vehicle_category_id && filters.vehicle_category_id !== 'All') {
        params.vehicle_category_id = filters.vehicle_category_id;
      }
      
      if (filters.status && filters.status !== 'All') {
        params.status = filters.status;
      }

      const response = await AnalyticsService.getTripAnalytics(params);
      
      if (response && response.success) {
        setRows(response.data || []);
        setSummaryData(response.summary || {
          total_trips: 0, created_trips: 0, ended_trips: 0, canceled_trips: 0, total_distance_travel: 0, average_distance_travel: 0
        });
        setPagination({
          page: response.pagination.page,
          pageSize: response.pagination.page_size,
          totalRecords: response.pagination.total_records,
        });
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.start_datetime, filters.end_datetime, filters.vehicle_category_id, filters.status, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]); // Trigger fetch when pagination or initial render happens

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    if (paginationModel.page !== 0) {
      setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page, fetchTrips will be called by useEffect
    } else {
      fetchTrips(); // If already on first page, manually call fetchTrips
    }
  };

  return (
    <MainCard title="Trip Analysis">
      {/* Filters Section */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2.5}>
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
          <Grid item xs={12} sm={2.5}>
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
          <Grid item xs={12} sm={2.5}>
            <TextField
              fullWidth
              select
              label="Vehicle Type ID"
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
          <Grid item xs={12} sm={2.5}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="created">Created</MenuItem>
              <MenuItem value="ended">Ended</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" color="primary" startIcon={<IconSearch />} fullWidth sx={{ height: '40px' }} onClick={handleApplyFilters}>
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
              <Typography variant="h4">{summaryData.total_trips}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Ended Trips</Typography>
              <Typography variant="h4" color="success.main">{summaryData.ended_trips}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Distance</Typography>
              <Typography variant="h4">{summaryData.total_distance_travel ? parseFloat(summaryData.total_distance_travel).toFixed(2) : 0} km</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Avg. Distance</Typography>
              <Typography variant="h4">{summaryData.average_distance_travel ? parseFloat(summaryData.average_distance_travel).toFixed(2) : 0} km</Typography>
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
          rowsPerPageOptions={[5, 10, 20, 50]}
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
