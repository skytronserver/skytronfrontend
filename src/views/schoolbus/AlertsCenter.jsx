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
                setAlerts(res?.data?.data || []);
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
        {
  name: "timestamp",
  label: "Time",
  options: {
    customBodyRender: (value) => {
      if (!value) return "-";

      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    },
  },
},
  {
    name: "vehicle_reg_no",
    label: "Vehicle"
  },
  {
    name: "alert_type",
    label: "Alert Type"
  },
  {
    name: "alert_title",
    label: "Title"
  },
  {
    name: "message",
    label: "Message"
  },
  {
    name: "latitude",
    label: "Latitude"
  },
  {
    name: "longitude",
    label: "Longitude"
  },
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
