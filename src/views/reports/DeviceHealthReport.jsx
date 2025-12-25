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
import { Download, FilterList, Clear, ExpandMore, ExpandLess, Refresh } from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import showDeviceApi from '../../services/showDeviceApi';
import { retriveStateList, retriveManufacturerList, retriveDeviceModelList } from '../../helper';

const DeviceHealthReport = () => {
  // Filter states
  const [filters, setFilters] = useState({
    vehicle_reg_no: '',
    device_tag_id: '',
    imei: '',
    device_stock_id: '',
    device_model_id: '',
    district_id: '',
    manufacturer_id: '',
    vehicle_owner_id: ''
  });

  // Component states
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [statesList, setStatesList] = useState([]);
  const [manufacturersList, setManufacturersList] = useState([]);
  const [deviceModelsList, setDeviceModelsList] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [healthStats, setHealthStats] = useState({
    total_devices: 0,
    online_devices: 0,
    offline_devices: 0,
    no_data_devices: 0
  });
  const [offlineFilter, setOfflineFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [quickRange, setQuickRange] = useState('');

  // Data Grid columns
  const columns = [
    {
      field: 'device_tag_id',
      headerName: 'Device Tag ID',
      width: 120,
      sortable: true
    },
    {
      field: 'vehicle_reg_no',
      headerName: 'Vehicle Reg No',
      width: 150,
      sortable: true
    },
    {
      field: 'device_esn',
      headerName: 'Device ESN',
      width: 180,
      sortable: true,
      valueGetter: (params) => params.row?.device_details?.device_esn || 'N/A'
    },
    {
      field: 'imei',
      headerName: 'IMEI',
      width: 160,
      sortable: true,
      valueGetter: (params) => params.row?.device_details?.imei || 'N/A'
    },
    {
      field: 'device_model',
      headerName: 'Device Model',
      width: 150,
      sortable: true,
      valueGetter: (params) => params.row?.device_details?.device_model?.model_name || 'N/A'
    },
    {
      field: 'manufacturer',
      headerName: 'Manufacturer',
      width: 150,
      sortable: true,
      valueGetter: (params) => params.row?.device_details?.manufacturer?.name || 'N/A'
    },
    {
      field: 'district',
      headerName: 'District',
      width: 120,
      sortable: true,
      valueGetter: (params) => params.row?.location_details?.district || 'N/A'
    },
    {
      field: 'state',
      headerName: 'State',
      width: 100,
      sortable: true,
      valueGetter: (params) => params.row?.location_details?.state || 'N/A'
    },
    {
      field: 'vehicle_make',
      headerName: 'Vehicle Make',
      width: 120,
      sortable: true,
      valueGetter: (params) => params.row?.vehicle_details?.vehicle_make || 'N/A'
    },
    {
      field: 'vehicle_model',
      headerName: 'Vehicle Model',
      width: 120,
      sortable: true,
      valueGetter: (params) => params.row?.vehicle_details?.vehicle_model || 'N/A'
    },
    {
      field: 'device_status',
      headerName: 'Device Status',
      width: 130,
      sortable: true,
      renderCell: (params) => {
        const status = params.row?.device_status || 'Unknown';
        const color = status === 'online' ? 'success' : 
                     status === 'offline' ? 'warning' : 
                     status === 'no_data' ? 'error' : 'default';
        const label = status === 'no_data' ? 'No Data' : 
                     status.charAt(0).toUpperCase() + status.slice(1);
        return <Chip label={label} color={color} size="small" />;
      }
    },
    {
      field: 'last_seen',
      headerName: 'Last Seen',
      width: 180,
      sortable: true,
      valueGetter: (params) => {
        if (params.row?.last_seen) {
          return new Date(params.row.last_seen).toLocaleString();
        }
        return 'Never';
      }
    },
    {
      field: 'offline_duration',
      headerName: 'Offline Duration (mins)',
      width: 160,
      sortable: true,
      valueGetter: (params) => params.row?.offline_duration_minutes || 0
    },
    {
      field: 'iccid',
      headerName: 'ICCID',
      width: 180,
      sortable: true,
      valueGetter: (params) => params.row?.device_details?.iccid || 'N/A'
    },
    {
      field: 'msisdn1',
      headerName: 'MSISDN',
      width: 130,
      sortable: true,
      valueGetter: (params) => params.row?.device_details?.msisdn1 || 'N/A'
    }
  ];

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
    fetchHealthData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [states, manufacturers, deviceModels] = await Promise.all([
        retriveStateList(),
        retriveManufacturerList(),
        retriveDeviceModelList()
      ]);
      
      setStatesList(states || []);
      setManufacturersList(manufacturers || []);
      setDeviceModelsList(deviceModels || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchHealthData = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        ...filterParams
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await showDeviceApi.getDeviceHealthStatus(params);
      
      if (response.data && response.data.status === 'success') {
        const devices = response.data.devices || [];
        // Add unique IDs for DataGrid (required by MUI DataGrid)
        const devicesWithIds = devices.map((device, index) => ({
          ...device,
          id: device.device_tag_id || index
        }));
        
        setHealthData(devicesWithIds);
        setTotalRows(response.data.total_devices || 0);
        
        // Update health statistics
        setHealthStats({
          total_devices: response.data.total_devices || 0,
          online_devices: response.data.online_devices || 0,
          offline_devices: response.data.offline_devices || 0,
          no_data_devices: response.data.no_data_devices || 0
        });
      } else {
        setHealthData([]);
        setTotalRows(0);
        setHealthStats({
          total_devices: 0,
          online_devices: 0,
          offline_devices: 0,
          no_data_devices: 0
        });
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      setHealthData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchHealthData();
  };

  const handleClearFilters = () => {
    setFilters({
      vehicle_reg_no: '',
      device_tag_id: '',
      imei: '',
      device_stock_id: '',
      device_model_id: '',
      district_id: '',
      manufacturer_id: '',
      vehicle_owner_id: ''
    });
    setOfflineFilter('all');
    setDateRange({ start: '', end: '' });
    setQuickRange('');
    setPage(0);
    fetchHealthData({});
  };

  const handleRefresh = () => {
    fetchHealthData();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Note: API doesn't seem to support pagination, so we'll handle client-side pagination
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const exportToCSV = () => {
    if (healthData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Device Tag ID',
      'Vehicle Reg No',
      'Device ESN',
      'IMEI',
      'Device Model',
      'Manufacturer',
      'District',
      'State',
      'Vehicle Make',
      'Vehicle Model',
      'Device Status',
      'Last Seen',
      'Offline Duration (mins)',
      'ICCID',
      'MSISDN'
    ];

    const csvData = healthData.map(row => [
      row.device_tag_id || '',
      row.vehicle_reg_no || '',
      row.device_details?.device_esn || '',
      row.device_details?.imei || '',
      row.device_details?.device_model?.model_name || '',
      row.device_details?.manufacturer?.name || '',
      row.location_details?.district || '',
      row.location_details?.state || '',
      row.vehicle_details?.vehicle_make || '',
      row.vehicle_details?.vehicle_model || '',
      row.device_status || '',
      row.last_seen ? new Date(row.last_seen).toLocaleString() : 'Never',
      row.offline_duration_minutes || 0,
      row.device_details?.iccid || '',
      row.device_details?.msisdn1 || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `device_health_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActiveFiltersCount = () => {
    const excludeFields = ['page', 'page_size'];
    return Object.entries(filters).filter(([key, value]) => 
      !excludeFields.includes(key) && value !== '' && value !== null && value !== undefined
    ).length;
  };

  const toggleFiltersExpanded = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const getFilteredRows = () => {
    let rows = healthData;

    // Apply offline duration filter if selected
    if (offlineFilter !== 'all') {
      const days = parseInt(offlineFilter, 10);
      if (!Number.isNaN(days)) {
        const thresholdMinutes = days * 24 * 60;
        rows = rows.filter((row) => {
          const duration = row?.offline_duration_minutes || 0;
          return row?.device_status === 'offline' && duration >= thresholdMinutes;
        });
      }
    }

    // Apply date range filter on last_seen if provided
    if (dateRange.start || dateRange.end) {
      const startTime = dateRange.start ? new Date(dateRange.start).getTime() : null;
      const endTime = dateRange.end ? new Date(dateRange.end).getTime() : null;

      rows = rows.filter((row) => {
        if (!row.last_seen) {
          return false;
        }
        const lastSeenTime = new Date(row.last_seen).getTime();

        if (Number.isNaN(lastSeenTime)) {
          return false;
        }

        if (startTime !== null && lastSeenTime < startTime) {
          return false;
        }

        if (endTime !== null) {
          // Include alerts up to end of selected day
          const endOfDay = endTime + (24 * 60 * 60 * 1000) - 1;
          if (lastSeenTime > endOfDay) {
            return false;
          }
        }

        return true;
      });
    }

    return rows;
  };

  const handleQuickRangeChange = (value) => {
    setQuickRange(value);

    if (!value) {
      setDateRange({ start: '', end: '' });
      return;
    }

    let start;
    const end = new Date();

    if (value === '24h') {
      // Past 24 hours
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    } else if (value === '3d') {
      start = new Date();
      start.setDate(end.getDate() - 3);
    } else if (value === '7d') {
      start = new Date();
      start.setDate(end.getDate() - 7);
    } else if (value === '3m') {
      start = new Date();
      start.setMonth(end.getMonth() - 3);
    } else {
      return;
    }

    const formatDateOnly = (date) => date.toISOString().split('T')[0];

    setDateRange({
      start: formatDateOnly(start),
      end: formatDateOnly(end)
    });
  };

  return (
    <MainCard title="Device Health Report">
      <Box sx={{ width: '100%' }}>
        {/* Health Statistics Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {healthStats.total_devices}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Devices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {healthStats.online_devices}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Online Devices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {healthStats.offline_devices}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Offline Devices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {healthStats.no_data_devices}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No Data Devices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Collapsible Filters Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box 
              onClick={toggleFiltersExpanded}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Filter Options</Typography>
                {!filtersExpanded && getActiveFiltersCount() > 0 && (
                  <Chip 
                    label={`${getActiveFiltersCount()} active`} 
                    color="primary" 
                    size="small" 
                  />
                )}
              </Box>
              <IconButton>
                {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            <Collapse in={filtersExpanded}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Vehicle Reg No"
                      value={filters.vehicle_reg_no}
                      onChange={(e) => handleFilterChange('vehicle_reg_no', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Device Tag ID"
                      value={filters.device_tag_id}
                      onChange={(e) => handleFilterChange('device_tag_id', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="IMEI"
                      value={filters.imei}
                      onChange={(e) => handleFilterChange('imei', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Device Stock ID"
                      value={filters.device_stock_id}
                      onChange={(e) => handleFilterChange('device_stock_id', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Device Model</InputLabel>
                      <Select
                        value={filters.device_model_id}
                        onChange={(e) => handleFilterChange('device_model_id', e.target.value)}
                        label="Device Model"
                      >
                        <MenuItem value="">All Models</MenuItem>
                        {deviceModelsList.map((model) => (
                          <MenuItem key={model.value} value={model.value}>
                            {model.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="District ID"
                      value={filters.district_id}
                      onChange={(e) => handleFilterChange('district_id', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Manufacturer</InputLabel>
                      <Select
                        value={filters.manufacturer_id}
                        onChange={(e) => handleFilterChange('manufacturer_id', e.target.value)}
                        label="Manufacturer"
                      >
                        <MenuItem value="">All Manufacturers</MenuItem>
                        {manufacturersList.map((manufacturer) => (
                          <MenuItem key={manufacturer.value} value={manufacturer.value}>
                            {manufacturer.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Vehicle Owner ID"
                      value={filters.vehicle_owner_id}
                      onChange={(e) => handleFilterChange('vehicle_owner_id', e.target.value)}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Offline Duration</InputLabel>
                      <Select
                        value={offlineFilter}
                        label="Offline Duration"
                        onChange={(e) => setOfflineFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Devices</MenuItem>
                        <MenuItem value="3">Offline  3 days</MenuItem>
                        <MenuItem value="7">Offline  7 days</MenuItem>
                        <MenuItem value="10">Offline  10 days</MenuItem>
                        <MenuItem value="30">Offline  30 days</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Last Seen Range</InputLabel>
                      <Select
                        value={quickRange}
                        label="Last Seen Range"
                        onChange={(e) => handleQuickRangeChange(e.target.value)}
                      >
                        <MenuItem value="">All Time</MenuItem>
                        <MenuItem value="24h">Past 24 hours</MenuItem>
                        <MenuItem value="3d">Past 3 days</MenuItem>
                        <MenuItem value="7d">Past 7 days</MenuItem>
                        <MenuItem value="3m">Past 3 months</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    startIcon={<FilterList />}
                    disabled={loading}
                  >
                    Apply Filters
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<Clear />}
                    disabled={loading}
                  >
                    Clear Filters
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleRefresh}
                    startIcon={<Refresh />}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  
                  <Tooltip title="Export to CSV">
                    <Button
                      variant="outlined"
                      onClick={exportToCSV}
                      startIcon={<Download />}
                      disabled={loading || healthData.length === 0}
                    >
                      Export CSV
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          {loading && <CustomLoader />}
          <DataGrid
            rows={getFilteredRows()}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            pagination
            paginationMode="client"
            page={page}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #d0d0d0',
              },
            }}
          />
        </Paper>
      </Box>
    </MainCard>
  );
};

export default DeviceHealthReport;
