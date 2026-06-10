import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, useTheme, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { IconBus, IconRoute, IconMapPin, IconCalendarEvent } from '@tabler/icons';

const SummaryDashboard = () => {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('today');

  // Mock Data
  const summaryCards = [
    { title: 'Total Buses', value: '1,245', icon: <IconBus size={40} color={theme.palette.primary.main} /> },
    { title: 'Active Routes', value: '184', icon: <IconRoute size={40} color={theme.palette.secondary.main} /> },
    { title: 'Total Stops', value: '8,432', icon: <IconMapPin size={40} color={theme.palette.success.main} /> },
    { title: 'Trips Today', value: '3,102', icon: <IconCalendarEvent size={40} color={theme.palette.warning.main} /> }
  ];

  const tripStatusData = [
    { name: 'Completed', value: 2400 },
    { name: 'Scheduled', value: 500 },
    { name: 'Canceled', value: 202 },
    { name: 'In Progress', value: 300 }
  ];

  const tripTrendsData = [
    { name: '06:00', trips: 150 },
    { name: '09:00', trips: 850 },
    { name: '12:00', trips: 400 },
    { name: '15:00', trips: 500 },
    { name: '18:00', trips: 920 },
    { name: '21:00', trips: 310 }
  ];

  const COLORS = [theme.palette.success.main, theme.palette.info.main, theme.palette.error.main, theme.palette.warning.main];

  return (
    <MainCard title="State Transport Summary Dashboard">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeFilter}
            label="Time Range"
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    {card.title}
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Trip Status Pie Chart */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Trip Status Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tripStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {tripStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trip Trends Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Trips by Time of Day</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tripTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="trips" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default SummaryDashboard;
