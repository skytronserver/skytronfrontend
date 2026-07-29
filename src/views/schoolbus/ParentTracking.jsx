import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Alert,
    Divider,
    Paper,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import SchoolBusService from '../../services/SchoolBusService';
import LiveMap from './ParentLiveMap';

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

    const [students, setStudents] = useState([]);

//     useEffect(() => {
//         let mounted = true;
//         setError('');
//         setLoading(true);

//         // For now we use a fixed studentId; once auth/profile wiring exists, pass actual studentId.
//         // SchoolBusService.getParentTracking('1')
//         //     .then((res) => {
//         //         if (!mounted) return;
//         //         const data = res?.data?.tracking || res?.data || {};
//         //         setTracking({
//         //             live: data?.live || null,
//         //             alerts: Array.isArray(data?.alerts) ? data.alerts : [],
//         //             tripHistory: Array.isArray(data?.tripHistory) ? data.tripHistory : []
//         //         });
//         //     })
//         SchoolBusService.getParentTracking()
//     .then((res) => {
//         if (!mounted) return;

// const responseData = Array.isArray(res?.data)
//     ? res.data
//     : [];
//         setStudents(responseData);
//     })
//             .catch((e) => {
//                 if (!mounted) return;
//                 setError(e?.message || 'Failed to load tracking data');
//             })
//             .finally(() => {
//                 if (!mounted) return;
//                 setLoading(false);
//             });

//         return () => {
//             mounted = false;
//         };
//     }, []);
useEffect(() => {
    let mounted = true;

    const loadTracking = async () => {
        try {
            setError('');

            const res = await SchoolBusService.getParentTracking();

            if (!mounted) return;

            const responseData = Array.isArray(res?.data)
                ? res.data
                : [];

            setStudents(responseData);
        } catch (e) {
            if (!mounted) return;
            setError(e?.message || 'Failed to load tracking data');
        }
    };

    // Initial load
    loadTracking();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
        loadTracking();
    }, 30000);

    return () => {
        mounted = false;
        clearInterval(interval);
    };
}, []);

    const live = students?.length > 0 ? students[0] : null;
    const liveStudents = students || [];
    const alertLogs = tracking?.alerts || [];
    const tripHistory = tracking?.tripHistory || [];

    const gpsData = live?.lat && live?.lon
        ? [
            {
                latitude: Number(live.lat),
                longitude: Number(live.lon),
                vehicle_reg_no: live?.vehicleRegNo || 'BUS',
            }
        ]
        : [];

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
                {liveStudents.map((live, index) => {

    const studentColors = [
'#1976d2',
'#d32f2f',
'#388e3c',
'#f57c00',
'#7b1fa2'
];

const studentColor =
studentColors[index % studentColors.length];

const routePoints =
live?.route?.route_points?.map((point) => ({
type: 'route',
latitude: Number(point.lat),
longitude: Number(point.lng),
color: studentColor,
label: live?.route?.name || 'Route'
})) || [];

const stopPoints =
live?.route?.stops?.map((stop) => ({
type: 'stop',
latitude: Number(stop.latitude),
longitude: Number(stop.longitude),
color: '#ff9800',
label: stop.name
})) || [];

const pickupPoint =
live?.pickup_stop?.latitude &&
live?.pickup_stop?.longitude
? [{
type: 'pickup',
latitude: Number(live.pickup_stop.latitude),
longitude: Number(live.pickup_stop.longitude),
color: '#4caf50',
label: `Pickup - ${live.pickup_stop.name}`
}]
: [];

const dropPoint =
live?.drop_stop?.latitude &&
live?.drop_stop?.longitude
? [{
type: 'drop',
latitude: Number(live.drop_stop.latitude),
longitude: Number(live.drop_stop.longitude),
color: '#f44336',
label: `Drop - ${live.drop_stop.name}`
}]
: [];

const busPoint =
live?.location?.latitude &&
live?.location?.longitude
? [{
type: 'bus',
latitude: Number(live.location.latitude),
longitude: Number(live.location.longitude),
color: '#000',
label: live?.bus?.vehicle_reg_no || 'Bus'
}]
: [];

const gpsData = [
...routePoints,
...stopPoints,
...pickupPoint,
...dropPoint,
...busPoint
];


    return (
        <React.Fragment key={live.student_id || index}>
            {/* Live Map */}
            <Grid item xs={12} lg={8}>
                <MainCard title={`Live Journey Monitor - ${live?.student_name}`}>
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
                        {gpsData.length > 0 ? (
                            <>
                                <Box sx={{ position: 'absolute', inset: 0 }}>
                                    <LiveMap
                                        gpsData={gpsData}
                                        autoFit={gpsData.length > 0}
                                        width="100%"
                                        height="100%"
                                    />
                                </Box>

                                <Alert
                                    severity="info"
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        left: 16,
                                        right: 16,
                                        zIndex: 1
                                    }}
                                >
                                    Bus{' '}
                                    <strong>
                                        {live?.bus?.vehicle_reg_no || 'N/A'}
                                    </strong>{' '}
                                    assigned to{' '}
                                    <strong>{live?.student_name}</strong>
                                </Alert>
                            </>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography
                                    variant="h4"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    No active trip right now
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {live?.message ||
                                        'No live tracking available'}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </MainCard>
            </Grid>

            {/* Student Details */}
            <Grid item xs={12} lg={4}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <MainCard title="Student Details">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2
                                }}
                            >
                                <Paper
                                    sx={{
                                        p: 1,
                                        bgcolor: theme.palette.primary.light
                                    }}
                                >
                                    <Typography variant="h2">
                                        {live?.student_name?.charAt(0) || 'S'}
                                    </Typography>
                                </Paper>

                                <Box>
                                    <Typography variant="h4">
                                        {live?.student_name || '-'}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Class {live?.class_name || '-'} -
                                        Section {live?.section || '-'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Pickup Stop
                            </Typography>

                            <Typography variant="h5">
                                {live?.pickup_stop?.name || '-'}
                            </Typography>

                            <Divider sx={{ my: 1.5 }} />

                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Drop Stop
                            </Typography>

                            <Typography variant="h5">
                                {live?.drop_stop?.name || '-'}
                            </Typography>
                        </MainCard>
                    </Grid>

                    <Grid item xs={12}>
                        <MainCard title="Vehicle Information">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 1
                                }}
                            >
                                <DirectionsBusIcon color="primary" />

                                <Typography variant="h4">
                                    {live?.bus?.vehicle_reg_no || '-'}
                                </Typography>
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Driver:{' '}
                                <strong>
                                    {live?.driver?.name || 'Not Assigned'}
                                </strong>
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Contact:{' '}
                                <strong>
                                    {live?.driver?.phone_no || '-'}
                                </strong>
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Route:{' '}
                                <strong>
                                    {live?.route?.name || '-'}
                                </strong>
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Status:{' '}
                                <strong>
                                    {live?.status || '-'}
                                </strong>
                            </Typography>
                        </MainCard>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    );
})}

               

                {/* Logs & History */}
                {/* <Grid item xs={12}>
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
                </Grid> */}

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
