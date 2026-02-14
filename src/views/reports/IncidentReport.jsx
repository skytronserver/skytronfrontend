import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Stack,
    Dialog,
    Slide,
    AppBar,
    Toolbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download, FilterList, Clear, Search } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import IncidentService from '../../services/IncidentService';
import {
    fetchSecureIncidentMedia,
    createMediaUrl,
    isVideoFile
} from '../../utils/incidentImageLoader';

const IncidentReport = () => {
    // Filters state (UI)
    const [filters, setFilters] = useState({
        vehicle_reg_no: '',
        registered_by: '',
        district: '',
        police_station: '',
        nearest_police_station: '',
        registered_at_from: '',
        registered_at_to: '',
        latitude: '',
        longitude: '',
        radius_km: '',
        page: 1,
        page_size: 10
    });

    const [incidentData, setIncidentData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);

    // Media viewer
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerMedia, setViewerMedia] = useState(null);
    const [viewerType, setViewerType] = useState('image');

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="left" ref={ref} {...props} />;
    });

    useEffect(() => {
        handleSearch();
    }, [filters.page, filters.page_size]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // ✅ SAFE SEARCH (only supported API params)
    const handleSearch = async () => {
        setLoading(true);
        try {
            const apiFilters = {
                vehicle_reg_no: filters.vehicle_reg_no,
                registered_by: filters.registered_by,
                district: filters.district,
                police_station: filters.police_station,
                nearest_police_station: filters.nearest_police_station,
                page: filters.page,
                page_size: filters.page_size
            };

            const res = await IncidentService.filterIncidents(apiFilters);

            if (res?.data?.data) {
                setIncidentData(
                    res.data.data.map((item, i) => ({
                        ...item,
                        id: item.id || i
                    }))
                );
                setTotalRows(res.data.total_count || res.data.data.length);
            } else if (Array.isArray(res.data)) {
                setIncidentData(
                    res.data.map((item, i) => ({
                        ...item,
                        id: item.id || i
                    }))
                );
                setTotalRows(res.data.length);
            } else {
                setIncidentData([]);
                setTotalRows(0);
            }
        } catch (e) {
            console.error(e);
            setIncidentData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            vehicle_reg_no: '',
            registered_by: '',
            district: '',
            police_station: '',
            nearest_police_station: '',
            registered_at_from: '',
            registered_at_to: '',
            latitude: '',
            longitude: '',
            radius_km: '',
            page: 1,
            page_size: 10
        });
    };

    const openMediaViewer = async (filePath) => {
        try {
            const token = sessionStorage.getItem('oAuthToken');
            if (!token) return alert('Not authenticated');

            const blob = await fetchSecureIncidentMedia(filePath, token);
            const url = createMediaUrl(blob);

            setViewerMedia(url);
            setViewerType(isVideoFile(filePath) ? 'video' : 'image');
            setViewerOpen(true);
        } catch {
            alert('Failed to load media');
        }
    };

    // Table columns
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'vehicle_reg_no', headerName: 'Vehicle Reg No', flex: 1 },
        { field: 'district', headerName: 'District', flex: 0.8 },


        {
            field: 'police_station',
            headerName: 'Police Station',
            flex: 1,
            valueGetter: p => p.row.police_station || 'N/A'
        },
        {
            field: 'registered_by',
            headerName: 'Registered By',
            flex: 1,
            valueGetter: p =>
                p.row.registered_by_info?.phone_no ||
                p.row.registered_by_info?.mobile_no ||
                p.row.registered_by ||
                'N/A'
        },
        {
            field: 'details',
            headerName: 'Details',
            flex: 1.2,
            valueGetter: (params) =>
                params.row.details || 'N/A'
        },
        {
            field: 'registered_at',
            headerName: 'Registered At',
            flex: 1,
            valueGetter: p =>
                p.row.registered_at
                    ? new Date(p.row.registered_at).toLocaleString()
                    : 'N/A'
        },
        {
            field: 'location',
            headerName: 'Location',
            flex: 1,
            renderCell: p => {
                const lat = p.row.latitude;
                const lon = p.row.longitude;
                if (!lat || !lon) return 'N/A';

                return (
                    <Tooltip title={`Lat: ${lat}, Long: ${lon}`}>
                        <Typography variant="body2">
                            {lat.toString().slice(0, 8)}, {lon.toString().slice(0, 8)}
                        </Typography>
                    </Tooltip>
                );
            }
        },
        {
            field: 'image_file',
            headerName: 'Image',
            flex: 0.6,
            renderCell: p =>
                p.value ? (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => openMediaViewer(p.value)}
                    >
                        View
                    </Button>
                ) : 'No Image'
        }
    ];

    const exportToCSV = () => {
        if (!incidentData.length) return;

        const headers = [
            'ID',
            'Vehicle Reg No',
            'District',
            'Registered At',
            'Lat',
            'Long'
        ];

        const rows = incidentData.map(r => [
            r.id,
            r.vehicle_reg_no,
            r.district,
            r.registered_at,
            r.lat,
            r.long
        ]);

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `incident_report_${Date.now()}.csv`;
        link.click();
    };

    return (
        <MainCard
            title="Incident Report"
            secondary={
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Download />}
                    onClick={exportToCSV}
                    disabled={!incidentData.length}
                    size="small"
                >
                    Export CSV
                </Button>
            }
        >
            <Grid container spacing={3}>
                {/* FILTER PANEL */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <FilterList sx={{ mr: 1 }} />
                                Filter Incidents
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Vehicle Reg No"
                                        value={filters.vehicle_reg_no}
                                        onChange={e =>
                                            handleFilterChange('vehicle_reg_no', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="District"
                                        value={filters.district}
                                        onChange={e =>
                                            handleFilterChange('district', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Police Station"
                                        value={filters.police_station}
                                        onChange={e =>
                                            handleFilterChange('police_station', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Registered By"
                                        value={filters.registered_by}
                                        onChange={e =>
                                            handleFilterChange('registered_by', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                {/* Date + Geo UI (visual only) */}
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="From Date"
                                        InputLabelProps={{ shrink: true }}
                                        value={filters.registered_at_from}
                                        onChange={e =>
                                            handleFilterChange('registered_at_from', e.target.value)
                                        }
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
                                        onChange={e =>
                                            handleFilterChange('registered_at_to', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Lat"
                                        value={filters.lat}
                                        onChange={e =>
                                            handleFilterChange('lat', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Long"
                                        value={filters.long}
                                        onChange={e =>
                                            handleFilterChange('long', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Radius (km)"
                                        value={filters.radius_km}
                                        onChange={e =>
                                            handleFilterChange('radius_km', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Search />}
                                            onClick={handleSearch}
                                        >
                                            Search
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Clear />}
                                            onClick={clearFilters}
                                        >
                                            Reset
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* INCIDENT LIST */}
                <Grid item xs={12}>
                    <Paper>
                        <Box p={2}>
                            <Typography variant="h6">
                                Incident List ({totalRows})
                            </Typography>
                        </Box>

                        <Box height={500}>
                            {loading ? (
                                <CustomLoader />
                            ) : (
                                <DataGrid
                                    rows={incidentData}
                                    columns={columns}
                                    pageSize={filters.page_size}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    sx={{
                                        border: 'none',

                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#fff'   // keep white background
                                        },

                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            color: '#1976d2',         // BLUE TEXT
                                            fontWeight: 'bold'
                                        }
                                    }}
                                />


                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* MEDIA VIEWER */}
            <Dialog
                fullScreen
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setViewerOpen(false)}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                            Incident Media
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'black'
                    }}
                >
                    {viewerType === 'video' ? (
                        <video
                            src={viewerMedia}
                            controls
                            autoPlay
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    ) : (
                        <img
                            src={viewerMedia}
                            alt="Incident"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    )}
                </Box>
            </Dialog>
        </MainCard>
    );
};

export default IncidentReport;
