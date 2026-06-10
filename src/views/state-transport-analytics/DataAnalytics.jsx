import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Grid, Card, CardContent, useTheme } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DataAnalytics = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];

  // Mock Data
  const resourcePerformanceData = [
    { fleet: 'Central Depot', driverScore: 85, vehicleHealth: 90 },
    { fleet: 'North Depot', driverScore: 78, vehicleHealth: 82 },
    { fleet: 'South Depot', driverScore: 92, vehicleHealth: 88 },
    { fleet: 'East Depot', driverScore: 75, vehicleHealth: 70 },
  ];

  const ticketRevenueData = [
    { type: 'AC Sleeper', revenue: 45000, numbers: 1500 },
    { type: 'Volvo AC', revenue: 38000, numbers: 1200 },
    { type: 'Non-AC', revenue: 25000, numbers: 3500 },
    { type: 'Mini Bus', revenue: 12000, numbers: 800 },
  ];

  const peakHourTrends = [
    { time: '06:00', passengers: 500, cancellations: 5 },
    { time: '09:00', passengers: 3000, cancellations: 12 },
    { time: '12:00', passengers: 1200, cancellations: 2 },
    { time: '18:00', passengers: 4500, cancellations: 15 },
    { time: '21:00', passengers: 1800, cancellations: 4 },
  ];

  const interDepotComparison = [
    { depot: 'Central', onTime: 95, trips: 1200 },
    { depot: 'North', onTime: 82, trips: 850 },
    { depot: 'South', onTime: 88, trips: 920 },
    { depot: 'East', onTime: 76, trips: 600 },
  ];

  return (
    <MainCard title="Micro-Level Data Analytics">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Resource Performance" />
          <Tab label="Ticket Analysis" />
          <Tab label="Operational Analytics" />
          <Tab label="Comparative Analysis" />
        </Tabs>
      </Box>

      {/* Resource Performance */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Driver & Transporter Performance by Fleet</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resourcePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fleet" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="driverScore" name="Driver Performance Score" fill={theme.palette.primary.main} />
                      <Bar dataKey="vehicleHealth" name="Vehicle Health Score" fill={theme.palette.success.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Ticket Analysis */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Revenue by Bus Type</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ticketRevenueData} dataKey="revenue" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
                        {ticketRevenueData.map((entry, index) => (
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
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Ticket Volume by Bus Type</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="numbers" name="Tickets Sold" fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Operational Analytics */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Peak Hour Trends & Cancellations</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={peakHourTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="passengers" name="Passenger Volume" stroke={theme.palette.primary.main} strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="cancellations" name="Cancellations" stroke={theme.palette.error.main} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Comparative Analysis */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Inter-Depot Comparison</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interDepotComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="depot" type="category" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="onTime" name="On-Time Performance (%)" fill={theme.palette.success.main} />
                      <Bar dataKey="trips" name="Total Trips Completed" fill={theme.palette.info.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </MainCard>
  );
};

export default DataAnalytics;
