
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { IconAlertTriangle, IconDeviceAnalytics, IconEmergencyBed, IconTruck } from '@tabler/icons';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MorthDashboard = () => {
    // Mock data for the dashboard
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

    const vltPieData = [
        { name: 'Active', value: stats.vltStatus.active, color: '#4caf50' },
        { name: 'Inactive', value: stats.vltStatus.inactive, color: '#f44336' },
        { name: 'Maintenance', value: stats.vltStatus.maintenance, color: '#ff9800' }
    ];

    useEffect(() => {
        // Placeholder for API call
        // const fetchData = async () => {
        //     const data = await UserServices.getMorthData();
        //     setStats(data);
        // };
        // fetchData();
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
                                <Bar dataKey="count" fill="#2196f3" name="Alert Count" />
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
