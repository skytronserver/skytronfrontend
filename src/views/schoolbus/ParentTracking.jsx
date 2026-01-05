import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Alert,
    Divider,
    Paper,
    Tabs,
    Tab,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MainCard from '../../ui-component/cards/MainCard';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { gridSpacing } from '../../store/constant';
import SchoolBusService from '../../services/SchoolBusService';

const ParentTracking = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tracking, setTracking] = useState({
        live: null,
        alerts: [],
        tripHistory: []
    });

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        // For now we use a fixed studentId; once auth/profile wiring exists, pass actual studentId.
        SchoolBusService.getParentTracking('1')
            .then((res) => {
                if (!mounted) return;
                const data = res?.data?.tracking || res?.data || {};
                setTracking({
                    live: data?.live || null,
                    alerts: Array.isArray(data?.alerts) ? data.alerts : [],
                    tripHistory: Array.isArray(data?.tripHistory) ? data.tripHistory : []
                });
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load tracking data');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const live = tracking?.live;
    const alertLogs = tracking?.alerts || [];
    const tripHistory = tracking?.tripHistory || [];

    const alertColumns = [
        { name: 'type', label: 'Alert Type' },
        { name: 'stop', label: 'Bus Stop' },
        { name: 'time', label: 'Timestamp' },
        { name: 'distance', label: 'Distance from Stop' },
    ];

    const historyColumns = [
        { name: 'date', label: 'Date' },
        { name: 'trip', label: 'Trip Type' },
        { name: 'startTime', label: 'Start Time' },
        { name: 'endTime', label: 'End Time' },
        {
            name: 'status',
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip label={value} color={value === 'Completed' ? 'success' : 'primary'} size="small" />
                )
            }
        },
    ];

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                {/* Header */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: theme.palette.info.light, borderRadius: 2 }}>
                                <TrackChangesIcon fontSize="large" color="info" />
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>Parent Real-Time Tracking</Typography>
                                <Typography variant="body2" color="text.secondary">Live monitoring of your ward's school bus journey</Typography>
                            </Box>
                        </Box>
                    </MainCard>
                </Grid>

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    </Grid>
                )}

                {loading && (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Loading tracking data...
                        </Alert>
                    </Grid>
                )}

                {/* Live Map & Status */}
                <Grid item xs={12} lg={8}>
                    <MainCard title="Live Journey Monitor">
                        <Paper
                            variant="outlined"
                            sx={{
                                height: 450,
                                position: 'relative',
                                bgcolor: '#f0f4f8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {live ? (
                                <>
                                    <Typography variant="h4" color="text.secondary">Live Map Placeholder</Typography>
                                    <Alert severity="info" sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1 }}>
                                        Bus <strong>{live?.vehicleRegNo || 'N/A'}</strong> is currently{' '}
                                        <strong>{live?.distanceKm ?? 'N/A'} KM</strong> away from <strong>{live?.stopName || 'N/A'}</strong>. Expected Arrival in{' '}
                                        <strong>{live?.etaMinutes ?? 'N/A'} mins</strong>.
                                    </Alert>
                                </>
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>
                                        No active trip right now
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Live tracking is available only during an active trip. When the bus is off-duty or not operational, it will not be visible.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </MainCard>
                </Grid>

                {/* Info Column */}
                <Grid item xs={12} lg={4}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <MainCard title="Student Details">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Paper sx={{ p: 1, bgcolor: theme.palette.primary.light }}>
                                        <Typography variant="h2">A</Typography>
                                    </Paper>
                                    <Box>
                                        <Typography variant="h4">{live?.studentName || '-'}</Typography>
                                        <Typography variant="body2" color="text.secondary">Class {live?.studentClass || '-'} - Section {live?.studentSection || '-'}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle2" color="text.secondary">Assigned Bus Stop</Typography>
                                <Typography variant="h5">{live?.stopName || '-'}</Typography>
                            </MainCard>
                        </Grid>
                        <Grid item xs={12}>
                            <MainCard title="Vehicle Information">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                    <DirectionsBusIcon color="primary" />
                                    <Typography variant="h4">{live?.vehicleRegNo || '-'}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">Driver: <strong>{live?.driverName || '-'}</strong></Typography>
                                <Typography variant="body2" color="text.secondary">Contact: <strong>{live?.driverMobile || '-'}</strong></Typography>
                            </MainCard>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Logs & History */}
                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                                <Tab label="Live Alert Logs" icon={<NotificationsActiveIcon />} iconPosition="start" />
                                <Tab label="Recent Trip History" icon={<HistoryIcon />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        {tabValue === 0 && (
                            <DynamicDatatables
                                tableTitle="Live Geofence Notifications"
                                rows={alertLogs}
                                columns={alertColumns}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {tabValue === 1 && (
                            <DynamicDatatables
                                tableTitle="Historical Journey Logs"
                                rows={tripHistory}
                                columns={historyColumns}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}
                    </MainCard>
                </Grid>

                {/* System Constraints */}
                <Grid item xs={12}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        <strong>Usage Notice:</strong> Tracking is only available during active trips scheduled for your ward. Off-day or non-operational buses will not show live location.
                    </Alert>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ParentTracking;
