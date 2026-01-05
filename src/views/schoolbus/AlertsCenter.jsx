import React, { useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Tabs,
    Tab,
    Alert,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from '../../ui-component/cards/MainCard';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { gridSpacing } from '../../store/constant';
import SchoolBusService from '../../services/SchoolBusService';

const AlertsCenter = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        let mounted = true;
        setError('');
        setLoading(true);

        SchoolBusService.getAlertsFeed()
            .then((res) => {
                if (!mounted) return;
                setAlerts(Array.isArray(res?.data) ? res.data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e?.message || 'Failed to load alerts');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const columns = [
        { name: 'time', label: 'Time' },
        { name: 'vehicleRegNo', label: 'Vehicle' },
        { name: 'route', label: 'Route' },
        { name: 'type', label: 'Alert Type' },
        {
            name: 'severity',
            label: 'Severity',
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        size="small"
                        color={value === 'Critical' ? 'error' : value === 'Warning' ? 'warning' : 'info'}
                    />
                )
            }
        },
        { name: 'message', label: 'Message' }
    ];

    const filtered = alerts.filter((a) => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return a.category === 'Trip';
        if (tabValue === 2) return a.category === 'Driving';
        if (tabValue === 3) return a.category === 'SOS';
        return true;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <MainCard>
                        <Box>
                            <Typography variant="h3" fontWeight={700}>Alerts Center</Typography>
                            <Typography variant="body2" color="text.secondary">Trip deviation, driving behaviour alerts, SOS and more</Typography>
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
                        <Alert severity="info" sx={{ borderRadius: 2 }}>Loading alerts...</Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <MainCard>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                <Tab label="All" />
                                <Tab label="Trip" />
                                <Tab label="Driving" />
                                <Tab label="SOS" />
                            </Tabs>
                        </Box>
                        <DynamicDatatables
                            tableTitle="Alerts"
                            rows={filtered}
                            columns={columns}
                            options={{ selectableRows: 'none', filter: true, search: true }}
                        />
                    </MainCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AlertsCenter;
