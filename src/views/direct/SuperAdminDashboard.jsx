// SuperAdminDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    alpha,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

// OpenLayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';

// Services
import HomePageService from 'services/HomePage';
import UserServices from 'services/UserServices';

// --- Reusable Map Component ---
const DashboardMap = ({ data, getStyle, center = [91.7362, 26.1445], zoom = 10 }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;

        const createBhuvanWms = () =>
            new TileLayer({
                source: new TileWMS({
                    url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
                    params: {
                        LAYERS: 'basemap%3Aadmin_group',
                        TILED: true,
                        VERSION: '1.1.1',
                        FORMAT: 'image/png',
                        TRANSPARENT: 'true',
                        SRS: 'EPSG:4326'
                    },
                    serverType: 'geoserver',
                    projection: 'EPSG:4326'
                }),
                opacity: 1
            });

        const vectorSource = new VectorSource();
        const vector = new VectorLayer({
            source: vectorSource,
            zIndex: 200
        });

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                createBhuvanWms(),
                vector
            ],
            view: new View({
                center: fromLonLat(center),
                zoom: zoom
            })
        });

        setMap(initialMap);
        setVectorLayer(vector);

        // Resize observer to handle container size changes
        const resizeObserver = new ResizeObserver(() => {
            initialMap.updateSize();
        });
        resizeObserver.observe(mapRef.current);

        return () => {
            resizeObserver.disconnect();
            initialMap.setTarget(null);
        };
    }, []); // Init once

    // Update Markers
    useEffect(() => {
        if (!map || !vectorLayer || !data) return;

        const source = vectorLayer.getSource();
        source.clear();

        const features = data.map((item, index) => {
            // Support both direct lat/lon properties and nested location arrays if needed
            // Assuming item has latitude/longitude or we pass a normalized structure
            const lat = Number(item.latitude);
            const lon = Number(item.longitude);

            if (isNaN(lat) || isNaN(lon)) return null;

            const coords = fromLonLat([lon, lat]);
            const f = new Feature({
                geometry: new Point(coords),
                data: item
            });

            if (getStyle) {
                f.setStyle(getStyle(item));
            }
            return f;
        }).filter(Boolean);

        source.addFeatures(features);
    }, [map, vectorLayer, data, getStyle]);

    return (
        <Box
            ref={mapRef}
            sx={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                '& .ol-viewport': { borderRadius: '0 0 12px 12px' }
            }}
        />
    );
};

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
                src: `${process.env.REACT_APP_BASE_URL}static/logo/green-skytron-transparent.png`,
                scale: 0.20
            })
        }),
        red: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: `${process.env.REACT_APP_BASE_URL}static/logo/red-skytron-transparent.png`,
                scale: 0.20
            })
        }),
        blue: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: `${process.env.REACT_APP_BASE_URL}static/logo/blue-skytron-transparent.png`,
                scale: 0.20
            })
        }),
        yellow: new Style({ // Using Orange icon for alerts/yellow status
            image: new Icon({
                anchor: [0.5, 1],
                src: `${process.env.REACT_APP_BASE_URL}static/logo/orange-skytron-transparent.png`,
                scale: 0.20
            })
        }),
        grey: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: `${process.env.REACT_APP_BASE_URL}static/logo/grey-skytron-transparent.png`,
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

    // Small UI components
    const MetricCard = ({ label, value }) => (
        <Box
            sx={{
                p: 1.5,
                bgcolor: alpha('#fff', 0.08),
                borderRadius: 2,
                border: `1px solid ${alpha('#fff', 0.12)}`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: alpha('#fff', 0.12), transform: 'translateY(-2px)' }
            }}
        >
            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.75, display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                {value}
            </Typography>
        </Box>
    );

    const DashboardCard = ({ title, subtitle, children, bgGradient, mapComponent }) => (
        <Box
            sx={{
                height: '100%',
                minHeight: '600px',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${bgGradient[0]} 0%, ${bgGradient[1]} 100%)`,
                border: `1px solid ${alpha('#fff', 0.18)}`,
                color: 'white',
                boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha('#fff', 0.15)}`, background: alpha('#fff', 0.05) }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    {subtitle}
                </Typography>
            </Box>

            <Box sx={{ p: 2.5 }}>{children}</Box>

            {mapComponent && (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: '400px',
                        width: '100%',
                        position: 'relative',
                        borderTop: `1px solid ${alpha('#fff', 0.1)}`,
                        '& canvas': { display: 'block !important' }
                    }}
                >
                    {mapComponent}
                </Box>
            )}
        </Box>
    );

    return (
        <MainCard sx={{ bgcolor: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5
                    }}
                >
                    SuperAdmin Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: '#8b92b0', fontSize: '0.9rem' }}>
                    Real-time monitoring across all emergency services • Auto-refresh enabled
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="Statewide Public Transport Live View"
                        subtitle="Real-time vehicle monitoring"
                        bgGradient={['rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)']}
                        mapComponent={
                            <DashboardMap
                                data={vehicleData}
                                getStyle={getVehicleStyle}
                            />
                        }
                    >
                        <Grid container spacing={1.5}>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Total" value={loading ? '...' : vehicleStats.total} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Online" value={loading ? '...' : vehicleStats.online} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Emergency" value={loading ? '...' : vehicleStats.emergency} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard label="Offline" value={loading ? '...' : vehicleStats.offline} />
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="Live Police Patrol Deployment Map"
                        subtitle="On-duty metrics and assignments"
                        bgGradient={['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.8)']}
                        mapComponent={
                            <DashboardMap
                                data={policeMarkers}
                                getStyle={() => iconStyles.blue}
                            />
                        }
                    >
                        <Grid container spacing={1.5}>
                            <Grid item xs={6}>
                                <MetricCard label="Total Vehicles" value={policeStats.totalVehicles} />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="On Duty" value={policeStats.onDuty} />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Incidents" value={policeStats.assignedToIncidents} />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Patrolling" value={policeStats.patrolling} />
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="Real-Time Ambulance Availability Map"
                        subtitle="Fleet status and availability"
                        bgGradient={['rgba(236, 72, 153, 0.8)', 'rgba(219, 39, 119, 0.8)']}
                        mapComponent={
                            <DashboardMap
                                data={ambulanceMarkers}
                                getStyle={() => iconStyles.red}
                            />
                        }
                    >
                        <Grid container spacing={1.5}>
                            <Grid item xs={6}>
                                <MetricCard label="Total Fleet" value={ambulanceStats.totalAmbulances} />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Available" value={`${ambulanceStats.available} (65%)`} />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Occupied" value={ambulanceStats.occupied} />
                            </Grid>
                            <Grid item xs={6}>
                                <MetricCard label="Emergency" value={ambulanceStats.emergencyMode} />
                            </Grid>
                        </Grid>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <DashboardCard
                        title="SOS Alerts & Emergency Response"
                        subtitle="Active incidents and call management"
                        bgGradient={['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 0.8)']}
                    >
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid item xs={4}>
                                <MetricCard label="Active SOS" value={sosLoading ? '...' : sosData.activeSOS} />
                            </Grid>
                            <Grid item xs={4}>
                                <MetricCard label="Pending" value={sosLoading ? '...' : sosData.pendingSOS} />
                            </Grid>
                            <Grid item xs={4}>
                                <MetricCard label="Closed" value={sosLoading ? '...' : sosData.closedSOS} />
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                overflow: 'auto',
                                bgcolor: alpha('#000', 0.2),
                                borderRadius: 2,
                                border: `1px solid ${alpha('#fff', 0.12)}`,
                                backdropFilter: 'blur(10px)',
                                minHeight: '400px'
                            }}
                        >
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ bgcolor: alpha('#000', 0.5), color: '#fff', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                                ID
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#000', 0.5), color: '#fff', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#000', 0.5), color: '#fff', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                                Location
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#000', 0.5), color: '#fff', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                                Time
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sosLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ color: '#fff', py: 3 }}>
                                                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                                                </TableCell>
                                            </TableRow>
                                        ) : sosCalls.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ color: '#8b92b0', py: 3, fontSize: '0.8rem' }}>
                                                    No active SOS calls
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sosCalls.map((call, index) => (
                                                <TableRow key={call.id || index} hover sx={{ '&:hover': { bgcolor: alpha('#fff', 0.05) } }}>
                                                    <TableCell sx={{ color: '#fff', fontSize: '0.75rem', py: 1 }}>#{call.id || index + 1}</TableCell>
                                                    <TableCell sx={{ py: 1 }}>
                                                        <Chip
                                                            label={call.status || 'pending'}
                                                            size="small"
                                                            sx={{
                                                                fontSize: '0.65rem',
                                                                height: 20,
                                                                bgcolor: call.status === 'active' ? '#4caf50' : call.status === 'pending' ? '#ff9800' : '#f44336',
                                                                color: '#fff'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#8b92b0', fontSize: '0.75rem', py: 1 }}>{call.location || 'Unknown'}</TableCell>
                                                    <TableCell sx={{ color: '#8b92b0', fontSize: '0.75rem', py: 1 }}>
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
