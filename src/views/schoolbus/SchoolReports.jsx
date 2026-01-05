import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Tabs,
    Tab,
    Alert
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
    const [trips, setTrips] = useState([]);
    const [traffic, setTraffic] = useState([]);

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        Promise.all([
            SchoolBusService.getUnplannedUsageReport(),
            SchoolBusService.getAttendanceReport(),
            SchoolBusService.getTripManagementReport(),
            SchoolBusService.getTrafficReport()
        ])
            .then(([u, a, t, tr]) => {
                if (!mounted) return;
                setUnplanned(Array.isArray(u?.data) ? u.data : []);
                setAttendance(Array.isArray(a?.data) ? a.data : []);
                setTrips(Array.isArray(t?.data) ? t.data : []);
                setTraffic(Array.isArray(tr?.data) ? tr.data : []);
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

    const unplannedCols = [
        { name: 'date', label: 'Date' },
        { name: 'vehicleRegNo', label: 'Vehicle' },
        { name: 'reason', label: 'Reason' },
        { name: 'distanceKm', label: 'Distance (KM)' },
        { name: 'remarks', label: 'Remarks' }
    ];

    const attendanceCols = [
        { name: 'date', label: 'Date' },
        { name: 'route', label: 'Route' },
        { name: 'student', label: 'Student' },
        { name: 'pickup', label: 'Pickup' },
        { name: 'drop', label: 'Drop' }
    ];

    const tripsCols = [
        { name: 'date', label: 'Date' },
        { name: 'vehicleRegNo', label: 'Vehicle' },
        { name: 'route', label: 'Route' },
        { name: 'tripType', label: 'Trip Type' },
        { name: 'status', label: 'Status' }
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
                            <Typography variant="body2" color="text.secondary">Unplanned usage, attendance, trip management, and traffic measurement</Typography>
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
                                <Tab label="Unplanned Usage" />
                                <Tab label="Attendance" />
                                <Tab label="Trip Management" />
                                <Tab label="Traffic" />
                            </Tabs>
                        </Box>

                        {tabValue === 0 && (
                            <DynamicDatatables
                                tableTitle="Unplanned Usage"
                                rows={unplanned}
                                columns={unplannedCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {tabValue === 1 && (
                            <DynamicDatatables
                                tableTitle="Attendance"
                                rows={attendance}
                                columns={attendanceCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {tabValue === 2 && (
                            <DynamicDatatables
                                tableTitle="Trip Management"
                                rows={trips}
                                columns={tripsCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}

                        {tabValue === 3 && (
                            <DynamicDatatables
                                tableTitle="Traffic"
                                rows={traffic}
                                columns={trafficCols}
                                options={{ selectableRows: 'none', filter: true, search: true }}
                            />
                        )}
                    </MainCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SchoolReports;
