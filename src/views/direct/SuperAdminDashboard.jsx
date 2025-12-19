// SuperAdminDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Grid,
    Stack,
    Typography,
    alpha,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    useTheme
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import BhuvanMapComponent from '../../components/Map/BhuvanMapComponent';

// Services
import HomePageService from 'services/HomePage';
import UserServices from 'services/UserServices';

// --- Reusable Map Component ---
const DashboardMap = ({ data, getStyle, center = [91.7362, 26.1445], zoom = 10 }) => {
    const mapRef = useRef(null);
    const vectorLayerRef = useRef(null);
    const latestStyleRef = useRef(getStyle);
    latestStyleRef.current = getStyle;

    const handleMapReady = ({ map, vectorLayer }) => {
        mapRef.current = map;
        vectorLayerRef.current = vectorLayer || null;
    };

    // Update Markers
    useEffect(() => {
        const vectorLayer = vectorLayerRef.current;
        if (!vectorLayer || !data) return;

        const source = vectorLayer.getSource?.();
        if (!source) return;

        source.clear();

        const styleFn = latestStyleRef.current;
        const features = data
            .map((item) => {
                const lat = Number(item.latitude);
                const lon = Number(item.longitude);

                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

                const f = new Feature({
                    geometry: new Point([lon, lat]),
                    data: item,
                });

                if (styleFn) {
                    f.setStyle(styleFn(item));
                }

                return f;
            })
            .filter(Boolean);

        source.addFeatures(features);
    }, [data, getStyle]);

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                '& .ol-viewport': { borderRadius: '0 0 12px 12px' }
            }}
        >
            <BhuvanMapComponent
                width="100%"
                height="100%"
                gpsData={[]}
                policeData={[]}
                pois={[]}
                showDrawControls={false}
                showLogos={false}
                showMapTypeToggle={true}
                defaultMapType="normal"
                center={center}
                zoom={zoom}
                onMapReady={handleMapReady}
            />
        </Box>
    );
};

// --- Chart Components ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                p: 2,
                borderRadius: 3,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)'
            }}>
                <Typography variant="subtitle2" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>{label || payload[0].name}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {`${payload[0].value} Units`}
                </Typography>
            </Box>
        );
    }
    return null;
};

const StatPieChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={240}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: '20px', fontFamily: 'Inter, sans-serif' }}
            />
        </PieChart>
    </ResponsiveContainer>
);

const StatBarChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                dy={10}
            />
            <YAxis
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

const DashboardCard = ({ title, subtitle, children, accentColor, mapComponent, chartComponent }) => (
    <Box
        sx={{
            height: '100%',
            minHeight: { xs: 'auto', md: 560 },
            borderRadius: 4,
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: alpha(accentColor, 0.12),
            boxShadow: `0 4px 20px 0 ${alpha(accentColor, 0.05)}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 20px 40px -4px ${alpha(accentColor, 0.12)}`,
                borderColor: alpha(accentColor, 0.36)
            }
        }}
    >
        <Box sx={{
            p: { xs: 2.5, md: 3 },
            borderBottom: `1px solid ${alpha(accentColor, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(accentColor, 0.16)} 0%, ${alpha(accentColor, 0.04)} 100%)`,
            position: 'relative'
        }}>
            <Box sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                bgcolor: accentColor
            }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', mb: 0.5, color: '#1e293b', letterSpacing: '0.5px' }}>
                {title}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                {subtitle}
            </Typography>
        </Box>

        {mapComponent ? (
            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
                    gap: { xs: 2.5, md: 3 },
                    p: { xs: 2.5, md: 3 },
                    borderTop: `1px solid ${alpha(accentColor, 0.12)}`
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        minHeight: { xs: 280, md: 420 },
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: `0 18px 40px -20px ${alpha(accentColor, 0.36)}`,
                        '& .ol-viewport': { borderRadius: 3 },
                        '& canvas': { display: 'block !important' }
                    }}
                >
                    {mapComponent}
                </Box>

                <Stack spacing={{ xs: 2, md: 3 }} sx={{ height: '100%' }}>
                    <Box sx={{ flexShrink: 0 }}>{children}</Box>
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: { xs: 240, md: 280 },
                            borderRadius: 3,
                            border: `1px solid ${alpha(accentColor, 0.18)}`,
                            bgcolor: alpha(accentColor, 0.06),
                            p: { xs: 2, md: 2.5 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 18px 36px -18px ${alpha(accentColor, 0.32)}`
                        }}
                    >
                        {chartComponent}
                    </Box>
                </Stack>
            </Box>
        ) : (
            <Box sx={{ p: 3, flex: 1 }}>
                <Grid container spacing={3} sx={{ height: '100%' }}>
                    <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {chartComponent}
                    </Grid>
                </Grid>
            </Box>
        )}
    </Box>
);

const MetricCard = ({ label, value, color }) => (
    <Box
        sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: '#fff',
            border: '1px solid',
            borderColor: alpha(color, 0.18),
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: `0 3px 12px ${alpha(color, 0.06)}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 1.25,
            minHeight: 120,
            '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 14px 28px ${alpha(color, 0.12)}`,
                borderColor: alpha(color, 0.4)
            }
        }}
    >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
                variant="caption"
                sx={{
                    color,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em'
                }}
            >
                {label}
            </Typography>
        </Box>
        <Typography
            variant="h4"
            sx={{
                fontWeight: 800,
                fontSize: { xs: '1.55rem', sm: '1.7rem' },
                color: '#0f172a',
                letterSpacing: '-0.4px',
                position: 'relative',
                zIndex: 1,
                lineHeight: 1.1
            }}
        >
            {value ?? '—'}
        </Typography>
        <Box sx={{
            position: 'absolute',
            right: -32,
            top: -32,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.18)} 0%, transparent 70%)`,
            zIndex: 0
        }} />
    </Box>
);

const SuperAdminDashboard = () => {
    // Data states
    const [vehicleData, setVehicleData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vehicleStats, setVehicleStats] = useState({ total: 0, online: 0, emergency: 0, offline: 0 });

    // SOS states
    const [sosData, setSosData] = useState({ activeSOS: 0, pendingSOS: 0, closedSOS: 0 });
    const [sosCalls, setSosCalls] = useState([]);
    const [sosLoading, setSosLoading] = useState(false);

    // Icon styles
    const iconStyles = useMemo(() => ({
        green: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/green/bus.png"),
                scale: 0.20
            })
        }),
        red: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/red/bus.png"),
                scale: 0.20
            })
        }),
        blue: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/blue/bus.png"),
                scale: 0.20
            })
        }),
        yellow: new Style({ // Using Orange icon for alerts/yellow status
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/orange/bus.png"),
                scale: 0.20
            })
        }),
        grey: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require("../../assets/images/grey/bus.png"),
                scale: 0.20
            })
        })
    }), []);

    const calculateTimeDifference = (entryTime, currentTime) => {
        return Math.abs(currentTime - entryTime) / 60000;
    };

    const getVehicleStyle = (vehicle) => {
        const entryTime = new Date(vehicle.entry_time || Date.now());
        const currentTime = new Date();
        const timeDifference = calculateTimeDifference(entryTime, currentTime);
        const speed = Number(vehicle.speed);
        const ignition = String(vehicle.ignition_status);

        if (vehicle.packet_type === 'EA') return iconStyles.red;
        if (vehicle.packet_type !== 'NR') return iconStyles.yellow; // Other alerts

        if (ignition === '1') {
            return speed > 1 ? iconStyles.green : iconStyles.blue;
        }

        if (timeDifference > 5) return iconStyles.grey;

        return iconStyles.blue;
    };

    // Derived Data for specific maps
    // User requested to show live tracking vehicles in police and ambulance maps.
    // We render the full live dataset in these maps to ensure they are populated.
    const policeMarkers = useMemo(() => {
        return vehicleData;
    }, [vehicleData]);

    const ambulanceMarkers = useMemo(() => {
        return vehicleData;
    }, [vehicleData]);

    // Derived Stats
    const policeStats = useMemo(() => ({
        totalVehicles: vehicleData.length,
        onDuty: vehicleData.filter(v => String(v.ignition_status) === '1').length,
        assignedToIncidents: 0,
        patrolling: vehicleData.length
    }), [vehicleData]);

    const ambulanceStats = useMemo(() => ({
        totalAmbulances: vehicleData.length,
        available: vehicleData.length,
        occupied: 0,
        emergencyMode: vehicleData.filter(v => v.packet_type === 'EA').length
    }), [vehicleData]);

    // Fetch vehicle data
    useEffect(() => {
        let mounted = true;
        const fetchVehicleData = async () => {
            try {
                setLoading(true);
                const response = await HomePageService.getLiveTracking_data({});
                if (!mounted) return;
                if (response?.data?.data && Array.isArray(response.data.data)) {
                    const vehicles = response.data.data;
                    setVehicleData(vehicles);

                    const stats = { total: vehicles.length, online: 0, emergency: 0, offline: 0 };
                    vehicles.forEach((vehicle) => {
                        const entryTime = new Date(vehicle.entry_time || Date.now());
                        const currentTime = new Date();
                        const timeDifference = calculateTimeDifference(entryTime, currentTime);

                        if (vehicle.packet_type === 'EA') stats.emergency++;
                        else if (timeDifference > 5) stats.offline++;
                        else if (String(vehicle.ignition_status) === '1' && vehicle.speed > 1) stats.online++;
                    });
                    setVehicleStats(stats);
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchVehicleData();
        const interval = setInterval(fetchVehicleData, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // Fetch SOS data
    useEffect(() => {
        let mounted = true;
        const fetchSOSData = async () => {
            try {
                setSosLoading(true);
                const [dashboardResponse, callsResponse] = await Promise.all([
                    UserServices.getSOSAdminDashboard(),
                    HomePageService.getPendingSOSCall()
                ]);

                if (!mounted) return;
                const data = dashboardResponse?.data || {};
                const calls = callsResponse?.data?.calls || [];

                setSosData({
                    activeSOS: data.Total_Active_Calls || 0,
                    activeIncidents: data.Total_Pending_Calls || 0,
                    avgResponseTime: parseFloat(data.Average_time_to_Accept) || 0,
                    pendingSOS: data.Total_Pending_Calls || 0,
                    closedSOS: data.Total_Closed_Calls || 0
                });

                setSosCalls(calls.slice(0, 10));
            } catch (error) {
                console.error('Error fetching SOS data:', error);
            } finally {
                if (mounted) setSosLoading(false);
            }
        };

        fetchSOSData();
        const interval = setInterval(fetchSOSData, 10000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // Chart Data Preparation
    const transportChartData = useMemo(() => [
        { name: 'Online', value: vehicleStats.online, color: '#10b981' }, // Emerald
        { name: 'Offline', value: vehicleStats.offline, color: '#64748b' }, // Slate
        { name: 'Emergency', value: vehicleStats.emergency, color: '#ef4444' } // Red
    ], [vehicleStats]);

    const policeChartData = useMemo(() => [
        { name: 'On Duty', value: policeStats.onDuty, color: '#3b82f6' }, // Blue
        { name: 'Patrolling', value: policeStats.patrolling, color: '#8b5cf6' }, // Violet
        { name: 'Incidents', value: policeStats.assignedToIncidents, color: '#f59e0b' } // Amber
    ], [policeStats]);

    const ambulanceChartData = useMemo(() => [
        { name: 'Available', value: ambulanceStats.available, color: '#ec4899' }, // Pink
        { name: 'Occupied', value: ambulanceStats.occupied, color: '#d946ef' }, // Fuchsia
        { name: 'Emergency', value: ambulanceStats.emergencyMode, color: '#f43f5e' } // Rose
    ], [ambulanceStats]);

    const sosChartData = useMemo(() => [
        { name: 'Active', value: sosData.activeSOS, color: '#ef4444' }, // Red
        { name: 'Pending', value: sosData.pendingSOS, color: '#f97316' }, // Orange
        { name: 'Closed', value: sosData.closedSOS, color: '#22c55e' } // Green
    ], [sosData]);

    return (
        <MainCard sx={{
            bgcolor: '#f8fafc', // Slate 50
            backgroundImage: `
                radial-gradient(circle at 0% 0%, ${alpha('#6366f1', 0.03)} 0%, transparent 50%), 
                radial-gradient(circle at 100% 100%, ${alpha('#ec4899', 0.03)} 0%, transparent 50%)
            `,
            minHeight: '100vh',
            border: 'none'
        }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.75rem', md: '2.5rem' },
                        color: '#1e293b',
                        mb: 1,
                        letterSpacing: '-1px'
                    }}
                >
                    SuperAdmin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem', maxWidth: '600px' }}>
                    Real-time monitoring command center for statewide emergency services.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="Public Transport"
                        subtitle="Live Fleet Monitoring"
                        accentColor="#8b5cf6" // Violet
                        chartComponent={<StatPieChart data={transportChartData} />}
                        mapComponent={
                            <DashboardMap
                                data={vehicleData}
                                getStyle={getVehicleStyle}
                            />
                        }
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Total" value={loading ? '...' : vehicleStats.total} color="#8b5cf6" />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Online" value={loading ? '...' : vehicleStats.online} color="#10b981" />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Emergency" value={loading ? '...' : vehicleStats.emergency} color="#ef4444" />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Offline" value={loading ? '...' : vehicleStats.offline} color="#64748b" />
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="Police Patrol"
                        subtitle="Deployment & Incidents"
                        accentColor="#3b82f6" // Blue
                        chartComponent={<StatBarChart data={policeChartData} />}
                        mapComponent={
                            <DashboardMap
                                data={policeMarkers}
                                getStyle={() => iconStyles.blue}
                            />
                        }
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <MetricCard label="Total Vehicles" value={policeStats.totalVehicles} color="#3b82f6" />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="On Duty" value={policeStats.onDuty} color="#10b981" />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Incidents" value={policeStats.assignedToIncidents} color="#f59e0b" />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Patrolling" value={policeStats.patrolling} color="#8b5cf6" />
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="Ambulance Fleet"
                        subtitle="Availability & Response"
                        accentColor="#ec4899" // Pink
                        chartComponent={<StatPieChart data={ambulanceChartData} />}
                        mapComponent={
                            <DashboardMap
                                data={ambulanceMarkers}
                                getStyle={() => iconStyles.red}
                            />
                        }
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <MetricCard label="Total Fleet" value={ambulanceStats.totalAmbulances} color="#ec4899" />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Available" value={`${ambulanceStats.available}`} color="#10b981" />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Occupied" value={ambulanceStats.occupied} color="#d946ef" />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Emergency" value={ambulanceStats.emergencyMode} color="#f43f5e" />
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="SOS & Emergency"
                        subtitle="Incident Management"
                        accentColor="#ef4444" // Red
                        chartComponent={<StatBarChart data={sosChartData} />}
                    >
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={4}>
                                <MetricCard label="Active SOS" value={sosLoading ? '...' : sosData.activeSOS} color="#ef4444" />
                            </Grid>
                            <Grid item xs={4}>
                                <MetricCard label="Pending" value={sosLoading ? '...' : sosData.pendingSOS} color="#f97316" />
                            </Grid>
                            <Grid item xs={4}>
                                <MetricCard label="Closed" value={sosLoading ? '...' : sosData.closedSOS} color="#22c55e" />
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                overflow: 'auto',
                                bgcolor: '#ffffff',
                                borderRadius: 3,
                                border: `1px solid #e2e8f0`,
                                minHeight: '400px'
                            }}
                        >
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                                                ID
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                                                Location
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                                                Time
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sosLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ color: '#1e293b', py: 4 }}>
                                                    <CircularProgress size={24} sx={{ color: '#1e293b' }} />
                                                </TableCell>
                                            </TableRow>
                                        ) : sosCalls.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ color: '#64748b', py: 4, fontSize: '0.875rem' }}>
                                                    No active SOS calls
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sosCalls.map((call, index) => (
                                                <TableRow key={call.id || index} hover sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                    <TableCell sx={{ color: '#1e293b', fontSize: '0.8rem', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>#{call.id || index + 1}</TableCell>
                                                    <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                                                        <Chip
                                                            label={call.status || 'pending'}
                                                            size="small"
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                height: 22,
                                                                fontWeight: 600,
                                                                bgcolor: call.status === 'active' ? alpha('#ef4444', 0.1) : call.status === 'pending' ? alpha('#f97316', 0.1) : alpha('#22c55e', 0.1),
                                                                color: call.status === 'active' ? '#ef4444' : call.status === 'pending' ? '#f97316' : '#22c55e',
                                                                border: `1px solid ${call.status === 'active' ? alpha('#ef4444', 0.2) : call.status === 'pending' ? alpha('#f97316', 0.2) : alpha('#22c55e', 0.2)}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b', fontSize: '0.8rem', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>{call.location || 'Unknown'}</TableCell>
                                                    <TableCell sx={{ color: '#64748b', fontSize: '0.8rem', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                                                        {call.created_at ? new Date(call.created_at).toLocaleTimeString() : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </DashboardCard>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default SuperAdminDashboard;
