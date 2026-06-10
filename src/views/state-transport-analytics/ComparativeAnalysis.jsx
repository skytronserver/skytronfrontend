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
    Chip,
    Avatar,
    IconButton,
    Collapse
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import {
    IconArrowRight,
    IconBus,
    IconMapPin,
    IconRoute,
    IconSearch,
    IconRefresh,
    IconChartBar,
    IconScale,
    IconTimeline,
    IconChevronDown,
    IconChevronUp,
    IconClock,
    IconCircleCheck,
    IconCircleX
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
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts';
import PISService from '../../services/PISServices';
import SettingService from '../../services/SettingService';

const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
);

const TripRow = ({ trip }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Typography variant="subtitle1">{trip.bus_reg_no}</Typography>
                    <Typography variant="caption" color="textSecondary">{trip.route_number} | {trip.service_type}</Typography>
                </TableCell>
                <TableCell>{trip.route_name}</TableCell>
                <TableCell>{new Date(trip.start_datetime).toLocaleString()}</TableCell>
                <TableCell align="right">
                    <Chip
                        label={trip.status}
                        size="small"
                        color={trip.status === 'completed' ? 'success' : trip.status === 'canceled' ? 'error' : 'warning'}
                    />
                </TableCell>
                <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{trip.trip_summary.avg_stop_delay_min} mins</Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">Stop-Level ETA Analysis</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order</TableCell>
                                        <TableCell>Stop Name</TableCell>
                                        <TableCell>Sch. Arrival</TableCell>
                                        <TableCell>Act. Arrival</TableCell>
                                        <TableCell>Delay (Min)</TableCell>
                                        <TableCell>Punctuality</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trip.stops.map((stop) => (
                                        <TableRow key={`${trip.schedule_id}-${stop.stop_id}`}>
                                            <TableCell>{stop.order}</TableCell>
                                            <TableCell>{stop.stop_name}</TableCell>
                                            <TableCell>{new Date(stop.scheduled_arrival).toLocaleTimeString()}</TableCell>
                                            <TableCell>{new Date(stop.actual_arrival).toLocaleTimeString()}</TableCell>
                                            <TableCell>{stop.delay_minutes}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={stop.punctuality}
                                                    size="small"
                                                    variant="outlined"
                                                    color={stop.punctuality === 'on_time' ? 'success' : stop.punctuality === 'late' ? 'error' : 'secondary'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const ComparativeAnalysis = () => {
    const theme = useTheme();

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event, newValue) => setTabValue(newValue);

    // Default Date Range: Last 7 days
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    const startOfPeriod = defaultStartDate.toISOString().slice(0, 16);
    const endOfPeriod = new Date().toISOString().slice(0, 16);

    const [filters, setFilters] = useState({
        start_datetime: startOfPeriod,
        end_datetime: endOfPeriod,
        state_id: '',
        district_id: '',
        service_type: '',
        route_id: ''
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [routes, setRoutes] = useState([]);

    const serviceTypes = ['Express', 'Ordinary', 'AC', 'City_Bus', 'Sleeper', 'Deluxe'];

    const fetchDropdowns = useCallback(async () => {
        try {
            const [stateRes, routeRes] = await Promise.all([
                SettingService.filter_settings_State({}),
                PISService.getBusRoutes()
            ]);
            setStates(stateRes.data || []);
            setRoutes(routeRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdowns:', error);
        }
    }, []);

    useEffect(() => {
        fetchDropdowns();
    }, [fetchDropdowns]);

    const handleStateChange = async (e) => {
        const stateId = e.target.value;
        setFilters(prev => ({ ...prev, state_id: stateId, district_id: '' }));
        if (stateId) {
            try {
                const res = await SettingService.filter_settings_District({ state: stateId });
                setDistricts(res.data || []);
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        } else {
            setDistricts([]);
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                start_datetime: new Date(filters.start_datetime).toISOString(),
                end_datetime: new Date(filters.end_datetime).toISOString()
            };
            if (filters.state_id) params.state_id = filters.state_id;
            if (filters.district_id) params.district_id = filters.district_id;
            if (filters.service_type) params.service_type = filters.service_type;
            if (filters.route_id) params.route_id = filters.route_id;

            const response = await PISService.getComparativeAnalysis(params);
            if (response && response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching comparative analysis:', error);
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

    return (
        <MainCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconScale size={24} />
                    <Typography variant="h3">Comparative Transport Analysis</Typography>
                </Box>
            }
            secondary={
                <Button variant="outlined" startIcon={<IconRefresh />} onClick={fetchData} disabled={loading}>
                    Refresh
                </Button>
            }
        >
            {/* Filters */}
            <Box sx={{ mb: 4, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth label="Start Range" type="datetime-local" name="start_datetime" value={filters.start_datetime} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth label="End Range" type="datetime-local" name="end_datetime" value={filters.end_datetime} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField select fullWidth label="State" name="state_id" value={filters.state_id} onChange={handleStateChange} size="small">
                            <MenuItem value="">All States</MenuItem>
                            {states.map((s) => (<MenuItem key={s.id} value={s.id}>{s.state}</MenuItem>))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField select fullWidth label="District" name="district_id" value={filters.district_id} onChange={handleFilterChange} size="small" disabled={!filters.state_id}>
                            <MenuItem value="">All Districts</MenuItem>
                            {districts.map((d) => (<MenuItem key={d.id} value={d.id}>{d.district}</MenuItem>))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField select fullWidth label="Service Type" name="service_type" value={filters.service_type} onChange={handleFilterChange} size="small">
                            <MenuItem value="">All Services</MenuItem>
                            {serviceTypes.map((st) => (<MenuItem key={st} value={st}>{st}</MenuItem>))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField select fullWidth label="Route" name="route_id" value={filters.route_id} onChange={handleFilterChange} size="small">
                            <MenuItem value="">All Routes</MenuItem>
                            {routes.map((r) => (<MenuItem key={r.id} value={r.id}>{r.route_number} - {r.route_name}</MenuItem>))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="contained" color="primary" startIcon={<IconSearch />} onClick={fetchData} disabled={loading}>Analyze</Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="Depot Comparison" />
                        <Tab label="Route performance" />
                        <Tab label="Inter-City Corridors" />
                        <Tab label="Detailed Trip Analysis" />
                    </Tabs>
                </Box>

                {data && (
                    <>
                        {/* DEPOT COMPARISON */}
                        <TabPanel value={tabValue} index={0}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h5" sx={{ mb: 2 }}>Performance Matrix by Source Stop (Depot)</Typography>
                                    <Box sx={{ height: 400 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.source_stop_comparison}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="source_stop_name" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend />
                                                <Bar dataKey="completion_rate_pct" name="Completion Rate %" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="on_time_start_rate_pct" name="On-Time Start %" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <TableContainer component={Paper} elevation={2}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell>Depot Name</TableCell>
                                                    <TableCell>District</TableCell>
                                                    <TableCell align="right">Routes</TableCell>
                                                    <TableCell align="right">Buses</TableCell>
                                                    <TableCell align="right">Schedules</TableCell>
                                                    <TableCell align="right">Comp. %</TableCell>
                                                    <TableCell align="right">On-Time %</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.source_stop_comparison.map((depot) => (
                                                    <TableRow key={depot.source_stop_id}>
                                                        <TableCell sx={{ fontWeight: 600 }}>{depot.source_stop_name}</TableCell>
                                                        <TableCell>{depot.district}</TableCell>
                                                        <TableCell align="right">{depot.unique_routes}</TableCell>
                                                        <TableCell align="right">{depot.unique_buses}</TableCell>
                                                        <TableCell align="right">{depot.total_schedules}</TableCell>
                                                        <TableCell align="right">{depot.completion_rate_pct}%</TableCell>
                                                        <TableCell align="right">{depot.on_time_start_rate_pct}%</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* ROUTE PERFORMANCE */}
                        <TabPanel value={tabValue} index={1}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TableContainer component={Paper} elevation={2}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell>Route Info</TableCell>
                                                    <TableCell>Corridor</TableCell>
                                                    <TableCell align="right">Buses</TableCell>
                                                    <TableCell align="right">Schedules</TableCell>
                                                    <TableCell align="right">Comp. %</TableCell>
                                                    <TableCell align="right">Avg. Delay</TableCell>
                                                    <TableCell align="right">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.inter_route_comparison.map((route) => (
                                                    <TableRow key={route.route_id}>
                                                        <TableCell>
                                                            <Typography variant="subtitle1">{route.route_number}</Typography>
                                                            <Typography variant="caption">{route.route_name}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="body2">{route.source_stop}</Typography>
                                                                <IconArrowRight size={14} />
                                                                <Typography variant="body2">{route.destination_stop}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">{route.unique_buses}</TableCell>
                                                        <TableCell align="right">{route.total_schedules}</TableCell>
                                                        <TableCell align="right">{route.completion_rate_pct}%</TableCell>
                                                        <TableCell align="right">{route.avg_stop_delay_minutes}m</TableCell>
                                                        <TableCell align="right">
                                                            <Chip
                                                                label={route.completion_rate_pct > 90 ? 'Excellent' : route.completion_rate_pct > 70 ? 'Fair' : 'Poor'}
                                                                size="small"
                                                                color={route.completion_rate_pct > 90 ? 'success' : route.completion_rate_pct > 70 ? 'warning' : 'error'}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* INTER-CITY CORRIDORS */}
                        <TabPanel value={tabValue} index={2}>
                            <Grid container spacing={3}>
                                {data.inter_city_corridor.map((corridor, idx) => (
                                    <Grid item xs={12} md={6} key={idx}>
                                        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h5">{corridor.source_district_name}</Typography>
                                                        <IconArrowRight size={20} />
                                                        <Typography variant="h5">{corridor.destination_district_name}</Typography>
                                                    </Box>
                                                    <Chip label={`${corridor.total_routes} Routes`} variant="outlined" size="small" />
                                                </Box>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2 }}>
                                                            <Typography variant="caption" color="primary.dark">Completion Rate</Typography>
                                                            <Typography variant="h4" color="primary.dark">{corridor.completion_rate_pct}%</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 2 }}>
                                                            <Typography variant="caption" color="success.dark">Punctuality</Typography>
                                                            <Typography variant="h4" color="success.dark">{corridor.on_time_start_rate_pct}%</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Top Routes in Corridor:</Typography>
                                                    {corridor.routes.map(r => (
                                                        <Box key={r.route_id} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', py: 0.5 }}>
                                                            <Typography variant="body2">{r.route_name}</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.completed}/{r.schedules} Trips</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </TabPanel>

                        {/* TRIP ANALYSIS */}
                        <TabPanel value={tabValue} index={3}>
                            <TableContainer component={Paper} elevation={3}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                                            <TableCell />
                                            <TableCell>Vehicle / Info</TableCell>
                                            <TableCell>Route</TableCell>
                                            <TableCell>Start Time</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                            <TableCell align="right">Avg. Stop Delay</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.trip_analysis.map((trip) => (
                                            <TripRow key={trip.schedule_id} trip={trip} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                    </>
                )}
            </Box>
        </MainCard>
    );
};

export default ComparativeAnalysis;
