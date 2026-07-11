import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Tabs,
    Tab,
    Alert,
    Button,
    Stack,
    Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from '../../ui-component/cards/MainCard';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { gridSpacing } from '../../store/constant';
import SchoolBusService from '../../services/SchoolBusService';

const SchoolReports = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [unplanned, setUnplanned] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [traffic, setTraffic] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        Promise.allSettled([
            SchoolBusService.getTripManagementReport(),
        ])
            .then(([ t]) => {

                // if (a.status === 'fulfilled') {
                //     setAttendance(a.value?.data || []);
                // }

                if (t.status === 'fulfilled') {
                    console.log('Trips:', t.value?.data);

                    setTrips(
                        Array.isArray(t.value?.data?.data)
                            ? t.value.data.data
                            : []
                    );
                }

            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load reports');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);



    const handleInitializeAttendance = async (tripId) => {
        try {

            const initRes =
                await SchoolBusService.initializeAttendance(tripId);

            const attendanceRes =
                await SchoolBusService.getRawAttendance(tripId);

            const attendanceData =
                attendanceRes?.data?.data?.raw_attendance?.map(
                    (item) => ({
                        attendance_id: item.attendance_id,

                        student_name: item.student?.name || '',

                        roll_number: item.student?.roll_number || '',

                        class_name: item.student?.class_name || '',

                        section: item.student?.section || '',

                        pickup_status: item.pickup_status,

                        drop_status: item.drop_status,

                        pickup_time: item.pickup_time || '-',

                        drop_time: item.drop_time || '-',

                        pickup_stop: item.pickup_stop,

                        drop_stop: item.drop_stop,

                        created_at: item.created_at,

                        student: item.student
                    })
                ) || [];

            setAttendance(attendanceData);

            setSelectedTripId(tripId);

            setTabValue(0);

            setSnackbar({
                open: true,
                message:
                    initRes?.data?.message ||
                    'Attendance initialized successfully',
                severity: 'success'
            });

        } catch (error) {

            setSnackbar({
                open: true,
                message:
                    error?.response?.data?.message ||
                    'Failed to initialize attendance',
                severity: 'error'
            });
        }
    };

    const refreshAttendance = async () => {

        if (!selectedTripId) return;

        const res =
            await SchoolBusService.getRawAttendance(
                selectedTripId
            );

        const attendanceData =
            res?.data?.data?.raw_attendance?.map(
                (item) => ({
                    attendance_id: item.attendance_id,
                    student_name: item.student?.name || '',
                    roll_number: item.student?.roll_number || '',
                    class_name: item.student?.class_name || '',
                    section: item.student?.section || '',
                    pickup_status: item.pickup_status,
                    drop_status: item.drop_status,
                    pickup_time: item.pickup_time || '-',
                    drop_time: item.drop_time || '-',
                    pickup_stop: item.pickup_stop,
                    drop_stop: item.drop_stop,
                    created_at: item.created_at,
                    student: item.student
                })
            ) || [];

        setAttendance(attendanceData);
    };
    const handleOpenAttendance = async (tripId) => {

    try {

        const attendanceRes =
            await SchoolBusService.getRawAttendance(
                tripId
            );

        const attendanceData =
            attendanceRes?.data?.data?.raw_attendance?.map(
                (item) => ({
                    attendance_id: item.attendance_id,
                    student_name: item.student?.name || '',
                    roll_number: item.student?.roll_number || '',
                    class_name: item.student?.class_name || '',
                    section: item.student?.section || '',
                    pickup_status: item.pickup_status,
                    drop_status: item.drop_status,
                    pickup_time: item.pickup_time || '-',
                    drop_time: item.drop_time || '-',
                    pickup_stop: item.pickup_stop,
                    drop_stop: item.drop_stop,
                    created_at: item.created_at,
                    student: item.student
                })
            ) || [];

        setAttendance(attendanceData);

        setSelectedTripId(tripId);

        setTabValue(0);

    } catch (error) {

        setSnackbar({
            open: true,
            message:
                error?.response?.data?.message ||
                'Failed to load attendance',
            severity: 'error'
        });
    }
};
    const handleCancelTrip = async (tripId) => {
        try {
            const res = await SchoolBusService.validateHoliday();

            setSnackbar({
                open: true,
                message:
                    res?.data?.message ||
                    'Trip cancelled successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message:
                    error?.response?.data?.message ||
                    'Failed to cancel trip',
                severity: 'error'
            });
        }
    };

    const handlePickup = async (studentId) => {

        try {

            const res =
                await SchoolBusService.markPickup(
                    selectedTripId,
                    {
                        student_id: studentId
                    }
                );

            await refreshAttendance();

            setSnackbar({
                open: true,
                message:
                    res?.data?.message ||
                    'Pickup marked successfully',
                severity: 'success'
            });

        } catch (error) {

            setSnackbar({
                open: true,
                message:
                    error?.response?.data?.message ||
                    'Pickup failed',
                severity: 'error'
            });
        }
    };

    const handleDrop = async (studentId) => {

        try {

            const res =
                await SchoolBusService.markDrop(
                    selectedTripId,
                    {
                        student_id: studentId
                    }
                );

            await refreshAttendance();

            setSnackbar({
                open: true,
                message:
                    res?.data?.message ||
                    'Drop marked successfully',
                severity: 'success'
            });

        } catch (error) {

            setSnackbar({
                open: true,
                message:
                    error?.response?.data?.message ||
                    'Drop failed',
                severity: 'error'
            });
        }
    };
    const unplannedCols = [
        { name: 'date', label: 'Date' },
        { name: 'vehicleRegNo', label: 'Vehicle' },
        { name: 'reason', label: 'Reason' },
        { name: 'distanceKm', label: 'Distance (KM)' },
        { name: 'remarks', label: 'Remarks' }
    ];

    const attendanceCols = [
        {
            name: 'attendance_id',
            label: 'Attendance ID'
        },
        {
            name: 'student_name',
            label: 'Student Name'
        },
        {
            name: 'roll_number',
            label: 'Roll No'
        },
        {
            name: 'class_name',
            label: 'Class'
        },
        {
            name: 'pickup_status',
            label: 'Pickup Status',
            options: {
                customBodyRender: (value) =>
                    value ? 'Picked Up' : 'Pending'
            }
        },
        {
            name: 'drop_status',
            label: 'Drop Status',
            options: {
                customBodyRender: (value) =>
                    value ? 'Dropped' : 'Pending'
            }
        },
        {
            name: 'pickup_time',
            label: 'Pickup Time'
        },
        {
            name: 'drop_time',
            label: 'Drop Time'
        },
        {
            name: 'pickup_stop',
            label: 'Pickup Stop'
        },
        {
            name: 'drop_stop',
            label: 'Drop Stop'
        },
        {
            name: 'actions',
            label: 'Actions',
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {

                    const row = attendance[dataIndex];

                    return (
                        <Stack
                            direction="row"
                            spacing={1}
                        >

                            <Button
                                variant="contained"
                                size="small"
                                disabled={
                                    row.pickup_status
                                }
                                onClick={() =>
                                    handlePickup(
                                        row.student.id
                                    )
                                }
                            >
                                Pickup
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                disabled={
                                    !row.pickup_status ||
                                    row.drop_status
                                }
                                onClick={() =>
                                    handleDrop(
                                        row.student.id
                                    )
                                }
                            >
                                Drop
                            </Button>

                        </Stack>
                    );
                }
            }
        }
    ];

    const tripsCols = [
        {
            name: 'id',
            label: 'Trip ID'
        },
        {
            name: 'bus',
            label: 'Bus'
        },
        {
            name: 'route',
            label: 'Route'
        },
        {
            name: 'trip_date',
            label: 'Trip Date'
        },
        {
            name: 'start_time',
            label: 'Start Time'
        },
        {
            name: 'end_time',
            label: 'End Time'
        },
        {
            name: 'status',
            label: 'Status'
        },
        {
            name: 'actions',
            label: 'Actions',
            options: {
                filter: false,
                sort: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = trips[dataIndex];

                    if (row?.status !== 'PLANNED') {
                        return null;
                    }
return (
    <Stack direction="row" spacing={1}>

        {row.attendance_initialized ? (
            <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() =>
                    handleOpenAttendance(row.id)
                }
            >
                Open Attendance
            </Button>
        ) : (
            <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() =>
                    handleInitializeAttendance(row.id)
                }
            >
                Initialize
            </Button>
        )}

        <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() =>
                handleCancelTrip(row.id)
            }
        >
            Cancel
        </Button>

    </Stack>
);
                }
            }
        }
    ];

    const trafficCols = [
        { name: 'date', label: 'Date' },
        { name: 'route', label: 'Route' },
        { name: 'avgSpeed', label: 'Avg Speed' },
        { name: 'congestionIndex', label: 'Congestion' },
        { name: 'delayMinutes', label: 'Delay (mins)' }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <MainCard>
                        <Box>
                            <Typography variant="h3" fontWeight={700}>School Reports</Typography>
                            <Typography variant="body2" color="text.secondary"> attendance, trip management</Typography>
                        </Box>
                    </MainCard>
                </Grid>

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                    </Grid>
                )}

                {loading && (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>Loading reports...</Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                <Tab label="Attendance" />
                                <Tab label="Trip Management" />
                                <Tab label="Unplanned Usage" />
                                {/* <Tab label="Traffic" /> */}
                            </Tabs>
                        </Box>

                        {tabValue === 2 && (
                            <DynamicDatatables
                                tableTitle="Unplanned Usage"
                                rows={unplanned}
                                columns={unplannedCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {tabValue === 0 && (
    attendance.length > 0 ? (
        <DynamicDatatables
            tableTitle="Attendance"
            rows={attendance}
            columns={attendanceCols}
            options={{
                selectableRows: 'none',
                filter: true,
                search: true
            }}
        />
    ) : (
        <Alert
            severity="info"
            sx={{
                mt: 2,
                borderRadius: 2
            }}
        >
            No attendance selected. Please click
            <strong> Open Attendance </strong>
            or
            <strong> Initialize </strong>
            from the Trip Management tab to view attendance records.
        </Alert>
    )
)}

                        {tabValue === 1 && (
                            <DynamicDatatables
                                tableTitle="Trip Management"
                                rows={trips}
                                columns={tripsCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {/* {tabValue === 3 && (
                            <DynamicDatatables
                                tableTitle="Traffic"
                                rows={traffic}
                                columns={trafficCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )} */}
                    </MainCard>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar((prev) => ({
                        ...prev,
                        open: false
                    }))
                }
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
            >
                <Alert
                    onClose={() =>
                        setSnackbar((prev) => ({
                            ...prev,
                            open: false
                        }))
                    }
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        minWidth: 350
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SchoolReports;
