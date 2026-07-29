
import React, { useState, useEffect } from 'react';
import { Grid, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { IconDeviceAnalytics, IconEmergencyBed, IconTruck } from '@tabler/icons';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchMorthDashboardData } from 'services/MorthService';

const MorthDashboard = () => {
    // Mock data for the dashboard (used as initial and fallback values)
    const [stats, setStats] = useState({
        totalPanicPress: 1250,
        panicActionTaken: 1180,
        alerts: [
            { category: 'Overspeed', count: 450 },
            { category: 'Harsh Breaking', count: 120 },
            { category: 'Route Deviation', count: 85 },
            { category: 'Tampering', count: 45 },
            { category: 'Geofence Violation', count: 210 }
        ],
        vltStatus: {
            total: 5000,
            active: 4200,
            inactive: 650,
            maintenance: 150
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

const vltPieData = [
  { name: 'Active', value: stats.vltStatus.active, color: '#6fb0f1ff' },     // Blue
  { name: 'Inactive', value: stats.vltStatus.inactive, color: '#eeb3b3ff' }, // Red
  { name: 'Maintenance', value: stats.vltStatus.maintenance, color: '#eec88aff' } // Yellow
];


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchMorthDashboardData();

                // Map API response to local stats shape with safe fallbacks.
                // Adjust these mappings once the exact API response structure is confirmed.
                const mappedStats = {
                    totalPanicPress: Number(data?.total_panic_press ?? data?.totalPanicPress ?? stats.totalPanicPress) || 0,
                    panicActionTaken: Number(data?.panic_action_taken ?? data?.panicActionTaken ?? stats.panicActionTaken) || 0,
                    alerts: Array.isArray(data?.alerts)
                        ? data.alerts.map((item) => ({
                            category: item.category || item.name || 'Unknown',
                            count: Number(item.count ?? item.value ?? 0) || 0
                        }))
                        : stats.alerts,
                    vltStatus: {
                        total: Number(data?.vlt_total ?? data?.vltStatus?.total ?? stats.vltStatus.total) || 0,
                        active: Number(data?.vlt_active ?? data?.vltStatus?.active ?? stats.vltStatus.active) || 0,
                        inactive: Number(data?.vlt_inactive ?? data?.vltStatus?.inactive ?? stats.vltStatus.inactive) || 0,
                        maintenance: Number(data?.vlt_maintenance ?? data?.vltStatus?.maintenance ?? stats.vltStatus.maintenance) || 0
                    }
                };

                setStats(mappedStats);
            } catch (err) {
                console.error('Failed to load MoRTH dashboard data:', err);
                setError('Failed to load MoRTH dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Typography variant="h3" gutterBottom>MoRTH Dashboard</Typography>
            </Grid>

            {/* Top Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <IconEmergencyBed stroke={1.5} size="2.5rem" color="#f44336" />
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h4">{stats.totalPanicPress}</Typography>
                                <Typography variant="subtitle2" color="textSecondary">Total Panic Press</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </MainCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <IconDeviceAnalytics stroke={1.5} size="2.5rem" color="#4caf50" />
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h4">{stats.panicActionTaken}</Typography>
                                <Typography variant="subtitle2" color="textSecondary">Action Taken by ERSS</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </MainCard>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <IconTruck stroke={1.5} size="2.5rem" color="#2196f3" />
                            </Grid>
                            <Grid item xs>
                                <Grid container>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">{stats.vltStatus.total}</Typography>
                                        <Typography variant="subtitle2" color="textSecondary">Total VLT</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">{stats.vltStatus.active}</Typography>
                                        <Typography variant="subtitle2" color="textSecondary">Active</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">{stats.vltStatus.inactive}</Typography>
                                        <Typography variant="subtitle2" color="textSecondary">Inactive</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">{stats.vltStatus.maintenance}</Typography>
                                        <Typography variant="subtitle2" color="textSecondary">Maint.</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </MainCard>
            </Grid>

            {/* Charts Row */}
            <Grid item xs={12} md={6}>
                <MainCard title="Alerts Distribution">
                    <Box sx={{ height: 350, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.alerts}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" angle={-45} textAnchor="end" height={70} interval={0} fontSize={12} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#D32F2F" name="Alert Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </MainCard>
            </Grid>

            {/* VLT Details Chart */}
            <Grid item xs={12} md={6}>
                <MainCard title="VLT Status Overview">
                    <Box sx={{ height: 350, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={vltPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {vltPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </MainCard>
            </Grid>

            {/* Alerts Table */}
            <Grid item xs={12}>
                <MainCard title="Alerts Details">
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Count</TableCell>
                                    <TableCell align="right">Percentage (approx)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.alerts.map((alert, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {alert.category}
                                        </TableCell>
                                        <TableCell align="right">{alert.count}</TableCell>
                                        <TableCell align="right">{((alert.count / stats.alerts.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default MorthDashboard;
