import React, { useState } from 'react';
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

const ParentTracking = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);

    // Mock data
    const alertLogs = [
        { id: 1, type: 'Geofence Entry', stop: 'Sector 5 Main Gate', time: '2025-01-26 14:30:22', distance: '3.0 KM' },
        { id: 2, type: 'Arrival', stop: 'Sector 5 Main Gate', time: '2025-01-26 14:35:10', distance: '0.0 KM' },
        { id: 3, type: 'Departure', stop: 'Sector 5 Main Gate', time: '2025-01-26 14:36:05', distance: '0.1 KM' },
    ];

    const tripHistory = [
        { id: 1, date: '2025-01-26', trip: 'Morning Pickup', startTime: '07:30 AM', endTime: '08:15 AM', status: 'Completed' },
        { id: 2, date: '2025-01-26', trip: 'Evening Drop', startTime: '14:20 PM', endTime: '15:10 PM', status: 'In-Progress' },
    ];

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

                {/* Live Map & Status */}
                <Grid item xs={12} lg={8}>
                    <MainCard title="Live Journey Monitor">
                        <Paper variant="outlined" sx={{ height: 450, position: 'relative', bgcolor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" color="text.secondary">Live Map Placeholder</Typography>
                            <Alert severity="info" sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1 }}>
                                Bus DL 1PC 1234 is currently <strong>1.5 KM</strong> away from <strong>Main Street Stop</strong>. Expected Arrival in <strong>4 mins</strong>.
                            </Alert>
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
                                        <Typography variant="h4">Aarav Kumar</Typography>
                                        <Typography variant="body2" color="text.secondary">Class 5th - Section A</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle2" color="text.secondary">Assigned Bus Stop</Typography>
                                <Typography variant="h5">Sector 5 Main Gate</Typography>
                            </MainCard>
                        </Grid>
                        <Grid item xs={12}>
                            <MainCard title="Vehicle Information">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                    <DirectionsBusIcon color="primary" />
                                    <Typography variant="h4">DL 1PC 1234</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">Driver: <strong>Suresh Kumar</strong></Typography>
                                <Typography variant="body2" color="text.secondary">Contact: <strong>+91 9876543210</strong></Typography>
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
