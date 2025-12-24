import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import showDeviceApi from '../../services/showDeviceApi';
import { retriveStateList } from '../../helper';

const AlertReport = () => {
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    vehicle_reg_no: '',
    state_id: '',
    district: '',
    start_date: '',
    end_date: '',
    latitude: '',
    longitude: '',
    radius: 10,
    page: 1,
    page_size: 25
  });

  // Component states
  const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [statesList, setStatesList] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Alert type options
  const alertTypes = [
    { value: 'Route', label: 'Route' },
    { value: 'Geofence', label: 'Geofence' },
    { value: 'Idling', label: 'Idling' },
    { value: 'OfflineDevice', label: 'OfflineDevice' },
    { value: 'Overtime', label: 'Overtime' },
    { value: 'UnauthorizedStop', label: 'UnauthorizedStop' },
    { value: 'UnauthorizedSkip', label: 'UnauthorizedSkip' },
    { value: 'NetworkLoss', label: 'NetworkLoss' },
    { value: 'GPSLoss', label: 'GPSLoss' },
    { value: 'Route_overspeed', label: 'Route_overspeed' },
    { value: 'Permit_3day', label: 'Permit' },
    { value: 'state_border_cross', label: 'state_border_cross' },
    { value: 'district_border_cross', label: 'district_border_cross' },
    { value: 'city_border_cross', label: 'city_border_cross' },
    { value: 'Incident', label: 'Incident' },
    { value: 'Em', label: 'Em' },
    { value: 'EmPublicApp', label: 'EmPublicApp' },
    { value: 'EmRegisteredApp', label: 'EmRegisteredApp' },
    { value: 'EmMonitorTripSOS', label: 'EmMonitorTripSOS' },
    { value: 'EmMonitorTripInvalidPw', label: 'EmMonitorTripInvalidPw' },
    { value: 'EmMonitorTripBLEDisconnect', label: 'EmMonitorTripBLEDisconnect' },
    { value: 'EmMonitorTripDeviated', label: 'EmMonitorTripDeviated' },
    { value: 'Eng', label: 'Eng' },
    { value: 'OverSpeed', label: 'OverSpeed' },
    { value: 'LowIntBat', label: 'LowIntBat' },
    { value: 'LowExtBat', label: 'LowExtBat' },
    { value: 'ExtBatDiscnt', label: 'ExtBatDiscnt' },
    { value: 'BoxTemp', label: 'BoxTemp' },
    { value: 'EmTemp', label: 'EmTemp' },
    { value: 'Tilt', label: 'Tilt' },
    { value: 'HarshBreak', label: 'HarshBreak' },
    { value: 'HarshTurn', label: 'HarshTurn' },
    { value: 'HarshAccileration', label: 'HarshAccileration' }
  ];

  // Alert status options
  const alertStatuses = ['in', 'out'];

  // Fetch states and initial alert data on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const states = await retriveStateList();
        setStatesList(states);
      } catch (error) {
        console.error('Error fetching states:', error);
        setStatesList([]);
      }
    };

    const fetchInitialAlerts = async () => {
      try {
        setLoading(true);
        const response = await showDeviceApi.getAlertLogFilter({
          page: 1,
          page_size: pageSize
        });

        if (response.data && response.data.status === 'success') {
          const alerts = response.data.data.map((alert) => ({
            ...alert,
            id: alert.id
          }));
          setAlertData(alerts);
          setTotalRows(response.data.pagination?.total_records || 0);
        }
      } catch (error) {
        console.error('Error fetching initial alert data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
    fetchInitialAlerts();
  }, [pageSize]);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // DataGrid columns
  const columns = [
    {
      field: 'id',
      headerName: 'Alert ID',
      width: 100,
      flex: 0.5
    },
    {
      field: 'type',
      headerName: 'Alert Type',
      width: 130,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'OverSpeed' ? 'error' : 'default'}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      flex: 0.5,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'in' ? 'success' : 'warning'}
        />
      )
    },
    {
      field: 'vehicle_reg_no',
      headerName: 'Vehicle Reg No',
      width: 150,
      flex: 1,
      valueGetter: (params) => {
        // Vehicle reg no is at deviceTag level, not device level
        return params.row.deviceTag?.vehicle_reg_no || params.row.deviceTag?.device?.vehicle_reg_no || 'N/A';
      }
    },
    {
      field: 'device_esn',
      headerName: 'Device ESN',
      width: 150,
      flex: 1,
      valueGetter: (params) => params.row.deviceTag?.device?.device_esn || 'N/A'
    },
    {
      field: 'latitude',
      headerName: 'Latitude',
      width: 120,
      flex: 0.8,
      valueGetter: (params) => params.row.gps_ref?.latitude || 'N/A',
      valueFormatter: (params) => params.value !== 'N/A' ? parseFloat(params.value).toFixed(6) : 'N/A'
    },
    {
      field: 'longitude',
      headerName: 'Longitude',
      width: 120,
      flex: 0.8,
      valueGetter: (params) => params.row.gps_ref?.longitude || 'N/A',
      valueFormatter: (params) => params.value !== 'N/A' ? parseFloat(params.value).toFixed(6) : 'N/A'
    },
    {
      field: 'district',
      headerName: 'District',
      width: 120,
      flex: 1,
      valueGetter: (params) => {
        // District is in device.dealer.districts array
        if (params.row.deviceTag?.device?.dealer?.districts &&
          params.row.deviceTag.device.dealer.districts.length > 0) {
          return params.row.deviceTag.device.dealer.districts[0].district;
        }
        // Fallback to deviceTag.districts if it exists
        if (params.row.deviceTag?.districts && params.row.deviceTag.districts.length > 0) {
          return params.row.deviceTag.districts[0].district;
        }
        // Last fallback
        return 'N/A';
      }
    },
    {
      field: 'state_name',
      headerName: 'State',
      width: 120,
      flex: 1,
      valueGetter: (params) => params.row.state?.state || 'N/A'
    },
    {
      field: 'timestamp',
      headerName: 'Alert Time',
      width: 180,
      flex: 1.2,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'route_info',
      headerName: 'Route Info',
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {params.row.route_ref ? `Route ID: ${params.row.route_ref.id}` : 'No Route'}
        </div>
      )
    },
    {
      field: 'vehicle_owner',
      headerName: 'Vehicle Owner',
      width: 150,
      flex: 1,
      valueGetter: (params) => {
        // Try to get owner name from the users array in vehicle_owner
        if (params.row.deviceTag?.vehicle_owner?.users && params.row.deviceTag.vehicle_owner.users.length > 0) {
          return params.row.deviceTag.vehicle_owner.users[0].name;
        }
        // Fallback to direct name property if it exists
        return params.row.deviceTag?.vehicle_owner?.name || 'N/A';
      }
    }
  ];

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      vehicle_reg_no: '',
      state_id: '',
      district: '',
      start_date: '',
      end_date: '',
      latitude: '',
      longitude: '',
      radius: 10,
      page: 1,
      page_size: pageSize
    });
    setPage(0);
    // Fetch all data without filters
    setTimeout(() => {
      fetchAlertData();
    }, 100);
  };

  // Fetch alert data
  const fetchAlertData = async () => {
    setLoading(true);
    try {
      // Prepare filter data - only include non-empty values
      const filterData = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          filterData[key] = filters[key];
        }
      });

      // Always include pagination
      filterData.page = page + 1;
      filterData.page_size = pageSize;

      const response = await showDeviceApi.getAlertLogFilter(filterData);

      if (response.data && response.data.status === 'success') {
        const alerts = response.data.data.map((alert) => ({
          ...alert,
          id: alert.id
        }));
        setAlertData(alerts);
        setTotalRows(response.data.pagination?.total_records || 0);
      } else {
        setAlertData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error('Error fetching alert data:', error);
      setAlertData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(0);
    fetchAlertData();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key =>
      filters[key] !== '' &&
      filters[key] !== null &&
      filters[key] !== undefined &&
      key !== 'page' &&
      key !== 'page_size' &&
      !(key === 'radius' && filters[key] === 10) // Don't count default radius
    ).length;
  };

  // Export to CSV
  const exportToCSV = () => {
    if (alertData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Alert ID', 'Alert Type', 'Status', 'Vehicle Reg No', 'Device ESN',
      'Latitude', 'Longitude', 'District', 'State', 'Alert Time', 'Route Info', 'Vehicle Owner'
    ];

    const csvData = alertData.map(row => [
      row.id,
      row.type,
      row.status,
      row.deviceTag?.vehicle_reg_no || row.deviceTag?.device?.vehicle_reg_no || 'N/A',
      row.deviceTag?.device?.device_esn || 'N/A',
      row.gps_ref?.latitude || 'N/A',
      row.gps_ref?.longitude || 'N/A',
      // Get district from device.dealer.districts array
      (row.deviceTag?.device?.dealer?.districts && row.deviceTag.device.dealer.districts.length > 0)
        ? row.deviceTag.device.dealer.districts[0].district
        : ((row.deviceTag?.districts && row.deviceTag.districts.length > 0)
          ? row.deviceTag.districts[0].district
          : 'N/A'),
      row.state?.state || 'N/A',
      formatDate(row.timestamp),
      row.route_ref ? `Route ID: ${row.route_ref.id}` : 'No Route',
      // Get vehicle owner from users array
      (row.deviceTag?.vehicle_owner?.users && row.deviceTag.vehicle_owner.users.length > 0)
        ? row.deviceTag.vehicle_owner.users[0].name
        : (row.deviceTag?.vehicle_owner?.name || 'N/A')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alert_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update data when page changes (but not on initial load)
  useEffect(() => {
    if (alertData.length > 0 || page > 0) {
      fetchAlertData();
    }
  }, [page]);

  return (
    <MainCard title="Alert Report">
      <Grid container spacing={3}>
        {/* Filter Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterList sx={{ mr: 1 }} />
                  Filter Options
                  {!filtersExpanded && getActiveFiltersCount() > 0 && (
                    <Chip
                      label={`${getActiveFiltersCount()} active`}
                      size="small"
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                <IconButton size="small">
                  {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={filtersExpanded}>
                <Box sx={{ mt: 2 }}>

                  <Grid container spacing={2}>
                    {/* Alert Type */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Alert Type</InputLabel>
                        <Select
                          value={filters.type}
                          label="Alert Type"
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          {alertTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Alert Status */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Alert Status</InputLabel>
                        <Select
                          value={filters.status}
                          label="Alert Status"
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <MenuItem value="">All Status</MenuItem>
                          {alertStatuses.map(status => (
                            <MenuItem key={status} value={status}>{status.toUpperCase()}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Vehicle Registration */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Vehicle Reg No"
                        value={filters.vehicle_reg_no}
                        onChange={(e) => handleFilterChange('vehicle_reg_no', e.target.value)}
                        placeholder="Partial match supported"
                      />
                    </Grid>

                    {/* State */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>State</InputLabel>
                        <Select
                          value={filters.state_id}
                          label="State"
                          onChange={(e) => handleFilterChange('state_id', e.target.value)}
                        >
                          <MenuItem value="">All States</MenuItem>
                          {statesList.map(state => (
                            <MenuItem key={state.value} value={state.value}>{state.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* District */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="District"
                        value={filters.district}
                        onChange={(e) => handleFilterChange('district', e.target.value)}
                        placeholder="Partial match from device tag"
                      />
                    </Grid>

                    {/* Start Date */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* End Date */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* Latitude */}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        type="number"
                        value={filters.latitude}
                        onChange={(e) => handleFilterChange('latitude', e.target.value)}
                        inputProps={{ step: 'any' }}
                      />
                    </Grid>

                    {/* Longitude */}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        type="number"
                        value={filters.longitude}
                        onChange={(e) => handleFilterChange('longitude', e.target.value)}
                        inputProps={{ step: 'any' }}
                      />
                    </Grid>

                    {/* Radius */}
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Radius (km)"
                        type="number"
                        value={filters.radius}
                        onChange={(e) => handleFilterChange('radius', e.target.value)}
                        inputProps={{ min: 1, max: 100 }}
                      />
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearch}
                          startIcon={<FilterList />}
                          sx={{ minWidth: 120 }}
                        >
                          Apply Filters
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={clearFilters}
                          startIcon={<Clear />}
                        >
                          Clear Filters
                        </Button>
                        <Button
                          variant="outlined"
                          color="info"
                          onClick={() => {
                            setPage(0);
                            fetchAlertData();
                          }}
                        >
                          Show All
                        </Button>
                        <Tooltip title="Export to CSV">
                          <IconButton
                            color="primary"
                            onClick={exportToCSV}
                            disabled={alertData.length === 0}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Alert Results {totalRows > 0 && `(${totalRows} total)`}
              </Typography>
              {alertData.length > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Download />}
                  onClick={exportToCSV}
                  size="small"
                >
                  Export CSV
                </Button>
              )}
            </Box>

            {loading ? (
              <CustomLoader />
            ) : (
              <Box sx={{
                height: 600,
                width: '100%',
                '& .MuiDataGrid-root': {
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    borderBottom: '2px solid #e0e0e0'
                  }
                }
              }}>
                <DataGrid
                  rows={alertData}
                  columns={columns}
                  pageSize={pageSize}
                  page={page}
                  rowCount={totalRows}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  pagination
                  paginationMode="server"
                  disableSelectionOnClick
                  getRowHeight={() => 'auto'}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      padding: '8px',
                      alignItems: 'center'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      padding: '8px',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default AlertReport;
