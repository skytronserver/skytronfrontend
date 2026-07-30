import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Tooltip,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Download, FilterList, Clear, Search } from '@mui/icons-material';

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
        page_size: 50
    });

    const [incidentData, setIncidentData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 50,
        page: 0
    });

    // Media viewer
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerMedia, setViewerMedia] = useState(null);
    const [viewerType, setViewerType] = useState('image');

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
                registered_at_from: filters.registered_at_from,
                registered_at_to: filters.registered_at_to,
                latitude: filters.latitude,
                longitude: filters.longitude,
                radius_km: filters.radius_km,
                page: filters.page,
                page_size: filters.page_size
            };

            const res = await IncidentService.filterIncidents(apiFilters);

            const rawRows = Array.isArray(res?.data?.data)
                ? res.data.data
                : Array.isArray(res?.data?.data?.data)
                    ? res.data.data.data
                    : Array.isArray(res?.data?.data?.results)
                        ? res.data.data.results
                        : Array.isArray(res?.data?.data?.items)
                            ? res.data.data.items
                            : Array.isArray(res?.data?.results)
                                ? res.data.results
                                : Array.isArray(res?.data?.rows)
                                    ? res.data.rows
                                    : Array.isArray(res?.data?.items)
                                        ? res.data.items
                                        : Array.isArray(res?.data)
                                            ? res.data
                                            : [];

            const rowsWithIds = rawRows.map((item, i) => ({
                ...item,
                id: item.id ?? item.incident_id ?? i
            }));

            const totalCount =
                res?.data?.total_count ??
                res?.data?.data?.total_count ??
                res?.data?.total ??
                rowsWithIds.length;

            setIncidentData(rowsWithIds);
            setTotalRows(totalCount);
        } catch (e) {
            console.error(e);
            setIncidentData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.page_size]);

    useEffect(() => {
        if (viewerOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }, [viewerOpen]);

    const handlePaginationChange = (newPaginationModel) => {
        setPaginationModel(newPaginationModel);
        setFilters(prev => ({
            ...prev,
            page: newPaginationModel.page + 1,
            page_size: newPaginationModel.pageSize
        }));
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

    useEffect(() => {
    const timer = setTimeout(() => {
        setPaginationModel(prev => ({
            ...prev,
            page: 0
        }));

        setFilters(prev => ({
            ...prev,
            page: 1
        }));

        handleSearch();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [
    filters.vehicle_reg_no,
    filters.registered_by,
    filters.district,
    filters.police_station,
    filters.nearest_police_station,
    filters.registered_at_from,
    filters.registered_at_to,
    filters.latitude,
    filters.longitude,
    filters.radius_km
]);
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

    const closeMediaViewer = () => {
        setViewerOpen(false);
        setViewerMedia(null);
    };

    const getRegisteredAt = (row) =>
        row?.registered_at ??
        row?.registeredAt ??
        row?.created_at ??
        row?.createdAt ??
        row?.incident_time ??
        row?.reported_at ??
        row?.timestamp ??
        null;

    const getDistrict = (row) =>
        row?.district ??
        row?.district_name ??
        row?.districtInfo?.district ??
        row?.district_info?.district ??
        row?.device_tag_info?.district_info?.district ??
        row?.field_ex?.district_info?.district ??
        row?.location?.district ??
        null;

    const getPoliceStation = (row) =>
        row?.police_station ??
        row?.policeStation ??
        row?.nearest_ps ??
        row?.nearest_police_station ??
        row?.police_station_info?.name ??
        row?.police_station_info?.police_station ??
        row?.ps_name ??
        row?.ps ??
        null;

    // Table columns
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'vehicle_reg_no', headerName: 'Vehicle Reg No', flex: 1 },
        {
            field: 'district',
            headerName: 'District',
            flex: 0.8,
            valueGetter: p => getDistrict(p.row) || 'N/A'
        },


        {
            field: 'police_station',
            headerName: 'Police Station',
            flex: 1,
            valueGetter: p => getPoliceStation(p.row) || 'N/A'
        },
        {
            field: 'registered_by',
            headerName: 'Registered By',
            flex: 1,
            valueGetter: p =>
                p.row.registered_by_info?.name ||
                p.row.registered_by_info?.phone_no ||
                p.row.registered_by_info?.mobile_no ||
                p.row.registered_by_info?.mobile ||
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
                getRegisteredAt(p.row)
                    ? new Date(getRegisteredAt(p.row)).toLocaleString()
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
            getRegisteredAt(r),
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
                                        value={filters.latitude}
                                        onChange={e =>
                                            handleFilterChange('latitude', e.target.value)
                                        }
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Long"
                                        value={filters.longitude}
                                        onChange={e =>
                                            handleFilterChange('longitude', e.target.value)
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
                    <Paper sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
                        <Box p={2} sx={{ borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
                            <Typography variant="h6">
                                Incident List ({totalRows})
                            </Typography>
                        </Box>

                        {loading ? (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CustomLoader />
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    width: '100%',
                                    overflow: 'auto'
                                }}
                            >
                                <DataGrid
                                    rows={incidentData}
                                    columns={columns}
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={handlePaginationChange}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    rowCount={totalRows}
                                    disableRowSelectionOnClick
                                    sx={{
                                        border: 'none',
                                        height: '100%',
                                        width: '100%',
                                        '& .MuiDataGrid-virtualScroller': {
                                            overflowY: 'auto'
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#fff'
                                        },
                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            color: '#1976d2',
                                            fontWeight: 'bold'
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {viewerOpen && viewerMedia && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1300,
                        pointerEvents: 'none'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.45)',
                            pointerEvents: 'none'
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                bgcolor: 'black',
                                position: 'relative',
                                pointerEvents: 'auto'
                            }}
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={closeMediaViewer}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    zIndex: 1
                                }}
                            >
                                Close
                            </Button>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start',
                                    overflow: 'auto'
                                }}
                            >
                                {viewerType === 'video' ? (
                                    <video
                                        src={viewerMedia}
                                        controls
                                        autoPlay
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                ) : (
                                    <img
                                        src={viewerMedia}
                                        alt="Incident"
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}

        </MainCard>
    );
};

export default IncidentReport;
