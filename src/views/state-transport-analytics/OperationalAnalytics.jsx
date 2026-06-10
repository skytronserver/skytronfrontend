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
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import {
    IconSettingsAutomation,
    IconClock,
    IconCircleX,
    IconMapPin,
    IconRoute,
    IconSearch,
    IconRefresh,
    IconTimeline,
    IconChartBar,
    IconReportAnalytics
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
    AreaChart,
    Area,
    LineChart,
    Line
} from 'recharts';
import PISService from '../../services/PISServices';
import SettingService from '../../services/SettingService';
import UserServices from '../../services/UserServices';

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`operational-tabpanel-${index}`}
        aria-labelledby={`operational-tab-${index}`}
        {...other}
    >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
);

const OperationalAnalytics = () => {
    const theme = useTheme();

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event, newValue) => setTabValue(newValue);

    // Default Date Range: Today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString().slice(0, 16);
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString().slice(0, 16);

    const [filters, setFilters] = useState({
        start_datetime: startOfDay,
        end_datetime: endOfDay,
        owner_id: '',
        vehicle_category_id: '',
        service_type: ''
    });

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

            const response = await PISService.getOperationalAnalytics(params);
            if (response && response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching operational analytics:', error);
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

    if (!data && loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    const peakHourTrends = data?.peak_hour_trends;
    const cancellationReport = data?.cancellation_report;

    return (
        <MainCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconSettingsAutomation size={24} />
                    <Typography variant="h3">Operational Analytics</Typography>
                </Box>
            }
            secondary={
                <Button variant="outlined" startIcon={<IconRefresh />} onClick={fetchData} disabled={loading}>
                    Refresh
                </Button>
            }
        >
            {/* Filters Section */}
            <Box sx={{ mb: 4, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField fullWidth label="Start Date & Time" type="datetime-local" name="start_datetime" value={filters.start_datetime} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField fullWidth label="End Date & Time" type="datetime-local" name="end_datetime" value={filters.end_datetime} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField select fullWidth label="Owner" name="owner_id" value={filters.owner_id} onChange={handleFilterChange} size="small">
                            <MenuItem value="">All Owners</MenuItem>
                            {owners.map((o) => (
                                <MenuItem key={o.id} value={o.id}>{o.users?.[0]?.name || o.owner_name || o.company_name || `Owner ${o.id}`}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField select fullWidth label="Vehicle Category" name="vehicle_category_id" value={filters.vehicle_category_id} onChange={handleFilterChange} size="small">
                            <MenuItem value="">All Categories</MenuItem>
                            {vehicleCategories.map((vc) => (
                                <MenuItem key={vc.id} value={vc.id}>{vc.category}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <TextField select fullWidth label="Service Type" name="service_type" value={filters.service_type} onChange={handleFilterChange} size="small">
                            <MenuItem value="">All Service Types</MenuItem>
                            {serviceTypes.map((st) => (
                                <MenuItem key={st} value={st}>{st}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={() => setFilters({ start_datetime: startOfDay, end_datetime: endOfDay, owner_id: '', vehicle_category_id: '', service_type: '' })}>Reset</Button>
                        <Button variant="contained" color="primary" startIcon={<IconSearch />} onClick={fetchData} disabled={loading}>Apply Filters</Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ width: '100%', typography: 'body1' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="operational analytics tabs" textColor="primary" indicatorColor="primary">
                        <Tab icon={<IconClock size={20} />} iconPosition="start" label="Peak Hour Trends" />
                        <Tab icon={<IconCircleX size={20} />} iconPosition="start" label="Cancellation Report" />
                    </Tabs>
                </Box>

                {/* PEAK HOUR TRENDS TAB */}
                <TabPanel value={tabValue} index={0}>
                    {data && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', bgcolor: 'primary.light' }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" color="primary.dark">Peak Operational Hour</Typography>
                                        <Box sx={{ mt: 3, mb: 2 }}>
                                            <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: 'primary.main', mb: 2 }}>
                                                <IconClock size={40} />
                                            </Avatar>
                                            <Typography variant="h1" color="primary.dark">{peakHourTrends.summary.peak_hour_label || 'N/A'}</Typography>
                                            <Typography variant="subtitle1" sx={{ mt: 1 }}>{peakHourTrends.summary.peak_hour_schedule_count} Schedules</Typography>
                                        </Box>
                                        <Typography variant="caption" color="textSecondary">
                                            Out of {peakHourTrends.summary.total_schedules} total schedules in period.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ mb: 2 }}>Traffic Volume By Hour</Typography>
                                        <Box sx={{ height: 350 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={peakHourTrends.by_hour}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="hour_label" />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} strokeWidth={3} />
                                                    <Area type="monotone" dataKey="completed" stroke={theme.palette.success.main} fill={theme.palette.success.light} strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ mb: 2 }}>Source Stop Utilization</Typography>
                                        <Box sx={{ height: 400 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={peakHourTrends.by_source_stop} layout="vertical" margin={{ left: 50 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="stop_name" type="category" width={150} />
                                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                                    <Legend />
                                                    <Bar dataKey="total" name="Total Schedules" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                                                    <Bar dataKey="completed" name="Completed" fill={theme.palette.success.main} radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </TabPanel>

                {/* CANCELLATION REPORT TAB */}
                <TabPanel value={tabValue} index={1}>
                    {data && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', bgcolor: 'error.light' }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" color="error.dark">Overall Cancellation</Typography>
                                        <Box sx={{ mt: 3, mb: 2 }}>
                                            <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: 'error.main', mb: 2 }}>
                                                <IconCircleX size={40} />
                                            </Avatar>
                                            <Typography variant="h1" color="error.dark">{cancellationReport.summary.cancellation_rate_pct}%</Typography>
                                            <Typography variant="subtitle1" sx={{ mt: 1 }}>{cancellationReport.summary.total_canceled} Canceled</Typography>
                                        </Box>
                                        <Typography variant="caption" color="textSecondary">
                                            Out of {cancellationReport.summary.total_schedules} total schedules.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ mb: 2 }}>Cancellation Trend (By Day)</Typography>
                                        <Box sx={{ height: 350 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={cancellationReport.by_day}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Line type="monotone" dataKey="canceled_count" stroke={theme.palette.error.main} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h4" sx={{ mb: 2, mt: 2 }}>Cancellation Breakdown</Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ mb: 2 }}>By Route (Top 10)</Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Route</TableCell>
                                                        <TableCell align="right">Canceled</TableCell>
                                                        <TableCell align="right">Rate</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {cancellationReport.by_route.slice(0, 10).map((row) => (
                                                        <TableRow key={row.route_id}>
                                                            <TableCell>{row.route_name || row.route_number}</TableCell>
                                                            <TableCell align="right">{row.canceled_count}</TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>{row.cancellation_rate_pct}%</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ mb: 2 }}>By Service Type & Hour</Typography>
                                        <Box sx={{ height: 250 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={cancellationReport.by_service_type}>
                                                    <XAxis dataKey="service_type" />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Bar dataKey="canceled_count" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h5" sx={{ mb: 2 }}>Hour-wise Impact</Typography>
                                        <Box sx={{ height: 200 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={cancellationReport.by_hour}>
                                                    <XAxis dataKey="hour_label" />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Bar dataKey="canceled_count" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </TabPanel>
            </Box>
        </MainCard>
    );
};

export default OperationalAnalytics;
