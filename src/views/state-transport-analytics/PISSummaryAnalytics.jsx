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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import {
    IconBus,
    IconRoute,
    IconMapPin,
    IconCalendarEvent,
    IconSearch,
    IconFilter,
    IconRefresh
} from '@tabler/icons';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import PISService from '../../services/PISServices';
import SettingService from '../../services/SettingService';

const PISSummaryAnalytics = () => {
    const theme = useTheme();

    // Default Date Range: Today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString().slice(0, 16);
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString().slice(0, 16);

    const [filters, setFilters] = useState({
        start_datetime: startOfDay,
        end_datetime: endOfDay,
        state_id: '',
        district_id: '',
        vehicle_category_id: ''
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [vehicleCategories, setVehicleCategories] = useState([]);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [stateRes, vehicleCatRes] = await Promise.all([
                SettingService.filter_settings_State({}),
                SettingService.filter_settings_VehicleCategory({})
            ]);
            setStates(stateRes.data || []);
            setVehicleCategories(vehicleCatRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdowns:', error);
        }
    }, []);

    const fetchDistricts = useCallback(async (stateId) => {
        try {
            const res = await SettingService.filter_settings_District({ state_id: stateId });
            setDistricts(res.data || []);
        } catch (error) {
            console.error('Error fetching districts:', error);
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
            if (filters.state_id) params.state_id = filters.state_id;
            if (filters.district_id) params.district_id = filters.district_id;
            if (filters.vehicle_category_id) params.vehicle_category_id = filters.vehicle_category_id;

            const response = await PISService.getPISSummary(params);
            if (response && response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching PIS summary:', error);
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
        if (name === 'state_id') {
            setFilters((prev) => ({ ...prev, state_id: value, district_id: '' }));
            if (value) fetchDistricts(value);
            else setDistricts([]);
        }
    };

    const handleApplyFilters = () => {
        fetchData();
    };

    const handleResetFilters = () => {
        setFilters({
            start_datetime: startOfDay,
            end_datetime: endOfDay,
            state_id: '',
            district_id: '',
            vehicle_category_id: ''
        });
        setDistricts([]);
    };

    if (!data && loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    const scheduleStatusData = data ? [
        { name: 'Created', value: data.schedules_created, color: theme.palette.info.main },
        { name: 'Started', value: data.schedules_started, color: theme.palette.primary.main },
        { name: 'Completed', value: data.schedules_completed, color: theme.palette.success.main },
        { name: 'Canceled', value: data.schedules_canceled, color: theme.palette.error.main }
    ].filter(item => item.value > 0) : [];

    const serviceTypeData = data ? data.service_type_breakdown.map((item) => ({
        name: item.service_type,
        Total: item.count,
        Completed: item.completed,
        Canceled: item.canceled
    })) : [];

    return (
        <MainCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBus size={24} />
                    <Typography variant="h3">PIS Summary Dashboard</Typography>
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
            {/* Filters Section */}
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
                            label="State"
                            name="state_id"
                            value={filters.state_id}
                            onChange={handleFilterChange}
                            size="small"
                        >
                            <MenuItem value="">All States</MenuItem>
                            {states.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.state_name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="District"
                            name="district_id"
                            value={filters.district_id}
                            onChange={handleFilterChange}
                            size="small"
                            disabled={!filters.state_id}
                        >
                            <MenuItem value="">All Districts</MenuItem>
                            {districts.map((d) => (
                                <MenuItem key={d.id} value={d.id}>{d.district_name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                            fullWidth
                            select
                            label="Vehicle Category"
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
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={handleResetFilters} size="medium" color="secondary">
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconSearch />}
                            onClick={handleApplyFilters}
                            size="medium"
                            disabled={loading}
                        >
                            Apply Filters
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {loading && !data && <CircularProgress sx={{ mx: 'auto', display: 'block', my: 5 }} />}

            {data && (
                <Grid container spacing={3}>
                    {/* Infrastructure Metrics */}
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{ mb: 2 }}>Infrastructure Overview</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'primary.light' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="subtitle1" color="primary.dark">Total Buses</Typography>
                                    <Typography variant="h2">{data.total_buses}</Typography>
                                </Box>
                                <IconBus size={48} opacity={0.3} color={theme.palette.primary.main} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'success.light' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" color="success.dark">Bus Stops</Typography>
                                    <IconMapPin size={24} color={theme.palette.success.main} />
                                </Box>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography variant="h3">{data.total_active_stops}</Typography>
                                        <Typography variant="caption">Active</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h3" color="error">{data.total_deactivated_stops}</Typography>
                                        <Typography variant="caption">Deactivated</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'secondary.light' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" color="secondary.dark">Bus Routes</Typography>
                                    <IconRoute size={24} color={theme.palette.secondary.main} />
                                </Box>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography variant="h3">{data.total_active_routes}</Typography>
                                        <Typography variant="caption">Active</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h3" color="error">{data.total_deactivated_routes}</Typography>
                                        <Typography variant="caption">Deactivated</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    {/* Schedule Metrics */}
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{ mb: 2 }}>Schedule Performance</Typography>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Card elevation={2} sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 2 }}>Schedule Distribution</Typography>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="h2">{data.schedules_total}</Typography>
                                    <Typography variant="subtitle2" color="textSecondary">Total Schedules</Typography>
                                </Box>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={scheduleStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {scheduleStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Card elevation={2} sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 2 }}>Service Type Breakdown</Typography>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={serviceTypeData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Bar dataKey="Total" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="Completed" fill={theme.palette.success.main} radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="Canceled" fill={theme.palette.error.main} radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Detailed Service Table */}
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 2 }}>Service Type Details</Typography>
                                <TableContainer component={Paper} elevation={0}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Service Type</TableCell>
                                                <TableCell align="right">Total Schedules</TableCell>
                                                <TableCell align="right">Completed</TableCell>
                                                <TableCell align="right">Canceled</TableCell>
                                                <TableCell align="right">Completion Rate</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.service_type_breakdown.map((row) => {
                                                const rate = row.count > 0 ? ((row.completed / row.count) * 100).toFixed(1) : 0;
                                                return (
                                                    <TableRow key={row.service_type}>
                                                        <TableCell component="th" scope="row">
                                                            <Typography sx={{ fontWeight: 500 }}>{row.service_type}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">{row.count}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'success.main' }}>{row.completed}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'error.main' }}>{row.canceled}</TableCell>
                                                        <TableCell align="right">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                                <Typography variant="body2">{rate}%</Typography>
                                                                <CircularProgress
                                                                    variant="determinate"
                                                                    value={parseFloat(rate)}
                                                                    size={20}
                                                                    thickness={6}
                                                                    color={parseFloat(rate) > 80 ? 'success' : parseFloat(rate) > 50 ? 'warning' : 'error'}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </MainCard>
    );
};

export default PISSummaryAnalytics;
