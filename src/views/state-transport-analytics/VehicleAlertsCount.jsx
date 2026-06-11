import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Button, Grid, MenuItem, Typography, Card, CardContent } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { IconSearch } from '@tabler/icons';
import AnalyticsService from '../../services/AnalyticsService';

const VehicleAlertsCount = () => {
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const [filters, setFilters] = useState({
    start_datetime: defaultStartDate.toISOString().slice(0, 16),
    end_datetime: new Date().toISOString().slice(0, 16),
    vehicle_category_id: 'All',
    vehicle_reg_no: '',
    alert_type: 'All',
    min_total_alerts: '',
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

  const [sortModel, setSortModel] = useState([
    { field: 'total_alerts', sort: 'desc' }
  ]);

  const [summaryData, setSummaryData] = useState({
    fleet_total_vehicles: 0,
    fleet_total_alerts: 0,
    fleet_overspeed: 0,
    fleet_harsh_braking: 0,
    fleet_harsh_acceleration: 0,
    fleet_harsh_turn: 0,
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: 'vehicle_reg_no', headerName: 'Vehicle No.', width: 140 },
    { field: 'vehicle_category', headerName: 'Category', width: 130 },
    { field: 'state_name', headerName: 'State', width: 130 },
    { field: 'district_name', headerName: 'District', width: 130 },
    { field: 'total_alerts', headerName: 'Total Alerts', width: 110, type: 'number' },
    { field: 'overspeed_count', headerName: 'Over Speeding', width: 130, type: 'number' },
    { field: 'harsh_braking_count', headerName: 'Harsh Braking', width: 130, type: 'number' },
    { field: 'harsh_acceleration_count', headerName: 'Harsh Accel', width: 120, type: 'number' },
    { field: 'harsh_turn_count', headerName: 'Harsh Turn', width: 110, type: 'number' },
    { field: 'idling_count', headerName: 'Idling', width: 90, type: 'number' },
    { field: 'route_overspeed_count', headerName: 'Route Overspeed', width: 140, type: 'number' },
  ];

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_datetime: new Date(filters.start_datetime).toISOString(),
        end_datetime: new Date(filters.end_datetime).toISOString(),
        page: paginationModel.page + 1, // API is 1-indexed
        page_size: paginationModel.pageSize,
      };

      if (sortModel.length > 0) {
        params.sort_by = sortModel[0].field;
        params.sort_order = sortModel[0].sort;
      }

      if (filters.vehicle_category_id && filters.vehicle_category_id !== 'All') {
        params.vehicle_category_id = filters.vehicle_category_id;
      }
      if (filters.vehicle_reg_no) {
        params.vehicle_reg_no = filters.vehicle_reg_no;
      }
      if (filters.alert_type && filters.alert_type !== 'All') {
        params.alert_type = filters.alert_type;
      }
      if (filters.min_total_alerts) {
        params.min_total_alerts = filters.min_total_alerts;
      }

      const response = await AnalyticsService.getVehicleAlertSummary(params);
      
      if (response && response.success) {
        // Map device_tag_id or vehicle_reg_no to id so DataGrid has a unique id
        const mappedRows = (response.data || []).map((row, index) => ({
          ...row,
          id: row.device_tag_id || `v-${index}`
        }));
        
        setRows(mappedRows);
        setSummaryData(response.summary || {
          fleet_total_vehicles: 0, fleet_total_alerts: 0, fleet_overspeed: 0, 
          fleet_harsh_braking: 0, fleet_harsh_acceleration: 0, fleet_harsh_turn: 0
        });
        setPagination({
          page: response.pagination.page,
          pageSize: response.pagination.page_size,
          totalRecords: response.pagination.total_records,
        });
      }
    } catch (error) {
      console.error('Error fetching vehicle alert summary:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.start_datetime, filters.end_datetime, filters.alert_type, filters.vehicle_reg_no, filters.vehicle_category_id, filters.min_total_alerts, paginationModel.page, paginationModel.pageSize, sortModel]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    if (paginationModel.page !== 0) {
      setPaginationModel({ ...paginationModel, page: 0 }); 
    } else {
      fetchSummary(); 
    }
  };

  return (
    <MainCard title="Vehicle Alerts Aggregate Count">
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
            <TextField
              fullWidth
              select
              label="Required Alert Type"
              name="alert_type"
              value={filters.alert_type}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="All">Any Alert</MenuItem>
              <MenuItem value="HarshBreak">Harsh Braking</MenuItem>
              <MenuItem value="OverSpeed">Over Speeding</MenuItem>
              <MenuItem value="HarshAcceleration">Harsh Acceleration</MenuItem>
              <MenuItem value="HarshTurn">Harsh Turn</MenuItem>
              <MenuItem value="Idling">Idling</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Min Total Alerts"
              type="number"
              name="min_total_alerts"
              value={filters.min_total_alerts}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="primary" startIcon={<IconSearch />} fullWidth sx={{ height: '40px' }} onClick={handleApplyFilters}>
              Aggregate Data
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Fleet Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Fleet Vehicles</Typography>
              <Typography variant="h4">{summaryData.fleet_total_vehicles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Alerts</Typography>
              <Typography variant="h4">{summaryData.fleet_total_alerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Over Speeding</Typography>
              <Typography variant="h4" color="error.main">{summaryData.fleet_overspeed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Harsh Braking</Typography>
              <Typography variant="h4" color="warning.main">{summaryData.fleet_harsh_braking}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Harsh Accel</Typography>
              <Typography variant="h4" color="warning.main">{summaryData.fleet_harsh_acceleration}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Harsh Turn</Typography>
              <Typography variant="h4" color="info.main">{summaryData.fleet_harsh_turn}</Typography>
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
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
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

export default VehicleAlertsCount;
