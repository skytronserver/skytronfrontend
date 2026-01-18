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
    CardContent,
    Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download, FilterList, Clear, ExpandMore, ExpandLess, Search } from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import IncidentService from '../../services/IncidentService';
import { useTheme } from '@mui/material/styles';
import { fetchSecureIncidentMedia, createMediaUrl, isVideoFile } from '../../utils/incidentImageLoader';

const IncidentReport = () => {
    const theme = useTheme();

    // Filter states
    const [filters, setFilters] = useState({
        vehicle_reg_no: '',
        registered_by: '',
        registered_at_from: '',
        registered_at_to: '',
        district: '',
        police_station: '',
        latitude: '',
        longitude: '',
        radius_km: '',
        page: 1,
        page_size: 10
    });

    // Component states
    const [incidentData, setIncidentData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filtersExpanded, setFiltersExpanded] = useState(true);

    // Fetch data when page or page_size changes
    useEffect(() => {
        handleSearch();
    }, [filters.page, filters.page_size]);

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Apply filters and fetch data
    const handleSearch = async () => {
        setLoading(true);
        try {
            // Clean filters to remove empty strings
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );

            const response = await IncidentService.filterIncidents(cleanFilters);
            if (response && response.data) {
                if (response.data.data && Array.isArray(response.data.data)) {
                    setIncidentData(response.data.data.map((item, index) => ({ ...item, id: item.id || index })));
                    setTotalRows(response.data.total_count || response.data.data.length);
                } else if (Array.isArray(response.data)) {
                    setIncidentData(response.data.map((item, index) => ({ ...item, id: item.id || index })));
                    setTotalRows(response.data.length);
                } else {
                    setIncidentData([]);
                    setTotalRows(0);
                }
            }
        } catch (error) {
            console.error('Error fetching incident data:', error);
            setIncidentData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            vehicle_reg_no: '',
            registered_by: '',
            registered_at_from: '',
            registered_at_to: '',
            district: '',
            police_station: '',
            latitude: '',
            longitude: '',
            radius_km: '',
            page: 1,
            page_size: 10
        });
    };

    // DataGrid columns
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'vehicle_reg_no', headerName: 'Vehicle Reg No', width: 140, flex: 1 },
        { field: 'district', headerName: 'District', width: 120, flex: 0.8 },
        { field: 'police_station', headerName: 'Police Station', width: 130, flex: 1, valueGetter: (params) => params.row.police_station || 'N/A' },
        {
            field: 'registered_by_info',
            headerName: 'Registered By',
            width: 150,
            flex: 1,
            valueGetter: (params) => params.row.registered_by_info?.name || params.row.registered_by || 'N/A'
        },
        { field: 'details', headerName: 'Details', width: 150, flex: 1.2 },
        {
            field: 'registered_at',
            headerName: 'Registered At',
            width: 170,
            flex: 1,
            valueGetter: (params) => params.row.registered_at ? new Date(params.row.registered_at).toLocaleString() : 'N/A'
        },
        {
            field: 'location',
            headerName: 'Location',
            width: 180,
            flex: 1,
            renderCell: (params) => (
                <Tooltip title={`Lat: ${params.row.latitude}, Long: ${params.row.longitude}`}>
                    <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                        {params.row.latitude?.toString().slice(0, 8)}, {params.row.longitude?.toString().slice(0, 8)}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'image_file',
            headerName: 'Image',
            width: 100,
            flex: 0.7,
            renderCell: (params) => params.value ? (
                <Button
                    variant="text"
                    size="small"
                    onClick={async () => {
                        try {
                            const token = sessionStorage.getItem('oAuthToken');
                            if (!token) {
                                alert('Not authenticated: token missing');
                                return;
                            }
                            const blob = await fetchSecureIncidentMedia(params.value, token);
                            const url = createMediaUrl(blob);
                            // Open in a new tab; for video, the browser will render it
                            const newWin = window.open();
                            if (newWin) {
                                if (isVideoFile(params.value)) {
                                    newWin.document.write(`<video src="${url}" controls autoplay style="max-width:100%"></video>`);
                                } else {
                                    newWin.document.write(`<img src="${url}" style="max-width:100%"/>`);
                                }
                            } else {
                                // Fallback: change current tab
                                window.location.href = url;
                            }
                        } catch (e) {
                            alert('Failed to load image');
                        }
                    }}
                    sx={{ textTransform: 'none', p: 0 }}
                >
                    View
                </Button>
            ) : 'No Image'
        }
    ];

    // Export to CSV
    const exportToCSV = () => {
        if (incidentData.length === 0) return;

        const headers = ['ID', 'Vehicle Reg No', 'District', 'Police Station', 'Details', 'Registered By', 'Registered At', 'Latitude', 'Longitude', 'Image URL'];
        const csvRows = incidentData.map(row => [
            row.id,
            row.vehicle_reg_no,
            row.district || 'N/A',
            row.police_station || 'N/A',
            `"${(row.details || '').replace(/"/g, '""')}"`,
            row.registered_by_info?.name || row.registered_by || 'N/A',
            row.registered_at,
            row.latitude,
            row.longitude,
            row.image_file ? `https://api.gromed.in/${row.image_file}` : 'N/A'
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `incident_report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <MainCard title="Incident Report" secondary={
            <Button
                variant="contained"
                color="secondary"
                startIcon={<Download />}
                onClick={exportToCSV}
                disabled={incidentData.length === 0}
                size="small"
            >
                Export CSV
            </Button>
        }>
            <Grid container spacing={3}>
                {/* Filter Section */}
                <Grid item xs={12}>
                    <Card sx={{
                        border: '1px solid',
                        borderColor: theme.palette.primary.light,
                        '&:hover': {
                            boxShadow: theme.shadows[3]
                        },
                        transition: 'all 0.3s'
                    }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: filtersExpanded ? 2 : 0 }}>
                                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main }}>
                                    <FilterList sx={{ mr: 1 }} />
                                    Filter Incidents
                                </Typography>
                                <IconButton onClick={() => setFiltersExpanded(!filtersExpanded)} size="small">
                                    {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Stack>

                            <Collapse in={filtersExpanded}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Vehicle Reg No"
                                            value={filters.vehicle_reg_no}
                                            onChange={(e) => handleFilterChange('vehicle_reg_no', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="District"
                                            value={filters.district}
                                            onChange={(e) => handleFilterChange('district', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Police Station"
                                            value={filters.police_station}
                                            onChange={(e) => handleFilterChange('police_station', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="From Date"
                                            InputLabelProps={{ shrink: true }}
                                            value={filters.registered_at_from}
                                            onChange={(e) => handleFilterChange('registered_at_from', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="To Date"
                                            InputLabelProps={{ shrink: true }}
                                            value={filters.registered_at_to}
                                            onChange={(e) => handleFilterChange('registered_at_to', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Registered By (ID)"
                                            value={filters.registered_by}
                                            onChange={(e) => handleFilterChange('registered_by', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Lat"
                                            value={filters.latitude}
                                            onChange={(e) => handleFilterChange('latitude', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Long"
                                            value={filters.longitude}
                                            onChange={(e) => handleFilterChange('longitude', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Radius (km)"
                                            value={filters.radius_km}
                                            onChange={(e) => handleFilterChange('radius_km', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSearch}
                                                startIcon={<Search />}
                                            >
                                                Search
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={clearFilters}
                                                startIcon={<Clear />}
                                            >
                                                Reset
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Collapse>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Results Section */}
                <Grid item xs={12}>
                    <Paper sx={{
                        p: 0,
                        overflow: 'hidden',
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[2]
                    }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.grey[50] }}>
                            <Typography variant="h6">
                                Incident List ({totalRows})
                            </Typography>
                        </Box>

                        <Box sx={{
                            height: 500,
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: theme.palette.primary.light,
                                    color: theme.palette.primary.dark,
                                    fontWeight: 'bold'
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    backgroundColor: '#fff'
                                }
                            }
                        }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CustomLoader />
                                </Box>
                            ) : (
                                <DataGrid
                                    rows={incidentData}
                                    columns={columns}
                                    pageSize={filters.page_size}
                                    onPageSizeChange={(newPageSize) => handleFilterChange('page_size', newPageSize)}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    pagination
                                    rowCount={totalRows}
                                    paginationMode="server"
                                    onPageChange={(page) => handleFilterChange('page', page + 1)}
                                    disableSelectionOnClick
                                />
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default IncidentReport;
