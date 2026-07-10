import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Button,
    useTheme,
    CircularProgress,
    Divider,
    Paper,
    Avatar,
    Chip,
    Rating
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import {
    IconBus,
    IconUser,
    IconCalendarStats,
    IconSearch,
    IconRefresh,
    IconClock,
    IconCircleX,
    IconCircleCheck,
    IconPoint,
    IconTruck
} from '@tabler/icons';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import PISService from '../../services/PISServices';
import SettingService from '../../services/SettingService';
import UserServices from '../../services/UserServices';

const ResourcePerformance = () => {
    const theme = useTheme();

    // Default Date Range: Last 30 days
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const startOfPeriod = defaultStartDate.toISOString().slice(0, 16);
    const endOfPeriod = new Date().toISOString().slice(0, 16);

    const [filters, setFilters] = useState({
        start_datetime: startOfPeriod,
        end_datetime: endOfPeriod,
        owner_id: '',
        vehicle_category_id: '',
        service_type: '',
        departure_punctuality: '',
        arrival_punctuality: ''
    });

    const PUNCTUALITY_OPTIONS = [
        { value: '', label: 'All' },
        { value: 'on_time', label: 'On Time' },
        { value: 'early', label: 'Early' },
        { value: 'late', label: 'Late' },
    ];

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState([]);
    const [vehicleCategories, setVehicleCategories] = useState([]);

    const serviceTypes = ['Express', 'Ordinary', 'AC', 'City_Bus', 'Sleeper', 'Deluxe'];

    const fetchDropdowns = useCallback(async () => {
        try {
            const [ownerRes, vehicleCatRes] = await Promise.all([
                UserServices.fetchVehicleOwner({}),
                SettingService.filter_settings_VehicleCategory({})
            ]);
            setOwners(ownerRes.data || []);
            setVehicleCategories(vehicleCatRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdowns:', error);
        }
    }, []);

    useEffect(() => {
        fetchDropdowns();
    }, [fetchDropdowns]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                start_datetime: new Date(filters.start_datetime).toISOString(),
                end_datetime: new Date(filters.end_datetime).toISOString()
            };
            if (filters.owner_id) params.owner_id = filters.owner_id;
            if (filters.vehicle_category_id) params.vehicle_category_id = filters.vehicle_category_id;
            if (filters.service_type) params.service_type = filters.service_type;
            if (filters.departure_punctuality) params.departure_punctuality = filters.departure_punctuality;
            if (filters.arrival_punctuality) params.arrival_punctuality = filters.arrival_punctuality;

            const response = await PISService.getResourcePerformance(params);
            if (response && response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching resource performance:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        fetchData();
    };

    const handleResetFilters = () => {
        setFilters({
            start_datetime: startOfPeriod,
            end_datetime: endOfPeriod,
            owner_id: '',
            vehicle_category_id: '',
            service_type: '',
            departure_punctuality: '',
            arrival_punctuality: ''
        });
    };

    const columns = [
        {
            field: 'vehicle_reg_no',
            headerName: 'Vehicle Reg No.',
            width: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBus size={18} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
                </Box>
            )
        },
        { field: 'vehicle_make', headerName: 'Make', width: 120 },
        { field: 'vehicle_model', headerName: 'Model', width: 120 },
        {
            field: 'owner',
            headerName: 'Owner',
            width: 180,
            valueGetter: (params) => params.value?.name || 'N/A'
        },
        {
            field: 'driver',
            headerName: 'Driver',
            width: 180,
            valueGetter: (params) => params.value?.name || 'N/A'
        },
        { field: 'total_schedules', headerName: 'Schedules', width: 110, type: 'number' },
        {
            field: 'completion_rate_pct',
            headerName: 'Comp. Rate',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={`${params.value}%`}
                    color={params.value > 90 ? 'success' : params.value > 70 ? 'warning' : 'error'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'on_time_start_rate_pct',
            headerName: 'On-Time Start',
            width: 130,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconClock size={16} color={params.value > 80 ? theme.palette.success.main : theme.palette.warning.main} />
                    <Typography variant="body2">{params.value}%</Typography>
                </Box>
            )
        },
        {
            field: 'avg_stop_delay_minutes',
            headerName: 'Avg. Delay',
            width: 130,
            valueFormatter: (params) => `${params.value} mins`
        }
    ];

    if (!data && loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    const fleetSummary = data?.fleet_summary;
    const buses = data?.buses || [];

    const performanceChartData = [
        { name: 'Completion', value: fleetSummary?.completion_rate_pct || 0 },
        { name: 'On-Time Departure', value: fleetSummary?.on_time_start_rate_pct || 0 },
        { name: 'Cancellation', value: fleetSummary?.cancellation_rate_pct || 0 }
    ];

    return (
        <MainCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconTruck size={24} />
                    <Typography variant="h3">Resource Performance Analytics</Typography>
                </Box>
            }
            secondary={
                <Button
                    variant="outlined"
                    startIcon={<IconRefresh />}
                    onClick={fetchData}
                    disabled={loading}
                >
                    Refresh
                </Button>
            }
        >
            {/* Filters */}
            <Box sx={{ mb: 4, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2.4}>
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
                    <Grid item xs={12} sm={6} md={2.4}>
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
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Owner"
                            name="owner_id"
                            value={filters.owner_id}
                            onChange={handleFilterChange}
                            size="small"
                        >
                            <MenuItem value="">All Owners</MenuItem>
                            {owners.map((o) => (
                                <MenuItem key={o.id} value={o.id}>
                                    {o.users?.[0]?.name || o.owner_name || o.company_name || `Owner ${o.id}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Vehicle Type"
                            name="vehicle_category_id"
                            value={filters.vehicle_category_id}
                            onChange={handleFilterChange}
                            size="small"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {vehicleCategories.map((vc) => (
                                <MenuItem key={vc.id} value={vc.id}>{vc.category}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Service Type"
                            name="service_type"
                            value={filters.service_type}
                            onChange={handleFilterChange}
                            size="small"
                        >
                            <MenuItem value="">All Service Types</MenuItem>
                            {serviceTypes.map((st) => (
                                <MenuItem key={st} value={st}>{st}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Departure Punctuality"
                            name="departure_punctuality"
                            value={filters.departure_punctuality}
                            onChange={handleFilterChange}
                            size="small"
                        >
                            {PUNCTUALITY_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.value === '' ? 'All Departure' : opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Arrival Punctuality"
                            name="arrival_punctuality"
                            value={filters.arrival_punctuality}
                            onChange={handleFilterChange}
                            size="small"
                        >
                            {PUNCTUALITY_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.value === '' ? 'All Arrival' : opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={handleResetFilters}>Reset</Button>
                        <Button variant="contained" color="primary" startIcon={<IconSearch />} onClick={handleApplyFilters} disabled={loading}>Apply</Button>
                    </Grid>
                </Grid>
            </Box>

            {loading && !data && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5 }} />}

            {data && (
                <Grid container spacing={3}>
                    {/* Fleet Summary Cards */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Total Fleet Size</Typography>
                                        <Typography variant="h3">{fleetSummary.total_buses}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                                        <IconBus size={24} />
                                    </Avatar>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Total Schedules: </Typography>
                                    <Typography variant="subtitle2" component="span">{fleetSummary.total_schedules}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Completion Rate</Typography>
                                        <Typography variant="h3" color="success.main">{fleetSummary.completion_rate_pct}%</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                                        <IconCircleCheck size={24} />
                                    </Avatar>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Completed: </Typography>
                                    <Typography variant="subtitle2" component="span">{fleetSummary.completed_count}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">On-Time Departure</Typography>
                                        <Typography variant="h3" color="primary.main">{fleetSummary.on_time_start_rate_pct}%</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                                        <IconClock size={24} />
                                    </Avatar>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary">On-Time: </Typography>
                                    <Typography variant="subtitle2" component="span">{fleetSummary.on_time_start_count}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">Cancellation Rate</Typography>
                                        <Typography variant="h3" color="error.main">{fleetSummary.cancellation_rate_pct}%</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                                        <IconCircleX size={24} />
                                    </Avatar>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Canceled: </Typography>
                                    <Typography variant="subtitle2" component="span">{fleetSummary.canceled_count}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Performance Overview Chart */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 3 }}>Fleet Performance KPIs</Typography>
                                <Box sx={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={performanceChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis unit="%" />
                                            <RechartsTooltip />
                                            <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 3 }}>Operational Pulse</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" color="textSecondary">Pending Schedules</Typography>
                                            <Typography variant="h4">{fleetSummary.pending_count}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" color="textSecondary">Schedules In-Progress</Typography>
                                            <Typography variant="h4">{fleetSummary.started_count}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ p: 2, bgcolor: theme.palette.info.light, borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <IconPoint color={theme.palette.info.main} />
                                                <Typography variant="subtitle1" color="info.dark">On-Time Threshold</Typography>
                                            </Box>
                                            <Typography variant="body2">Current system threshold is set to <strong>{fleetSummary.on_time_threshold_minutes} minutes</strong> for departure punctuality.</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Bus KPIs Table */}
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h4">Resource Performance Breakdown</Typography>
                                </Box>
                                <Box sx={{ height: 600, width: '100%' }}>
                                    <DataGrid
                                        rows={buses}
                                        columns={columns}
                                        getRowId={(row) => row.bus_id}
                                        pagination
                                        pageSize={10}
                                        rowsPerPageOptions={[10, 20, 50]}
                                        components={{ Toolbar: GridToolbar }}
                                        componentsProps={{
                                            toolbar: {
                                                showQuickFilter: true,
                                            },
                                        }}
                                        disableSelectionOnClick
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </MainCard>
    );
};

export default ResourcePerformance;
