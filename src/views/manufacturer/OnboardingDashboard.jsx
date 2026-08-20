import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import MUIDataTable from "mui-datatables";

// Dummy Data for Metrics
const dashboardMetrics = [
  { title: 'Total Models', count: 12, color: '#1e88e5' },
  { title: 'Pending Requests', count: 3, color: '#fb8c00' },
  { title: 'Testing In Progress', count: 2, color: '#43a047' },
  { title: 'Passed Models', count: 8, color: '#00acc1' },
];

// Dummy Data for Recent Requests
const recentRequestsData = [
  { id: 'REQ-2026-001', model: 'SkyTrack X1', submittedAt: '2026-08-15', stage: 'Group 3', status: 'Testing' },
  { id: 'REQ-2026-002', model: 'SkyTrack Pro', submittedAt: '2026-08-18', stage: 'Group 1', status: 'Blocked' },
  { id: 'REQ-2026-003', model: 'Tracker Basic', submittedAt: '2026-08-10', stage: 'Completed', status: 'Passed' },
  { id: 'REQ-2026-004', model: 'FleetMaster', submittedAt: '2026-08-19', stage: 'Awaiting Receipt', status: 'In Transit' },
];

const columns = [
  { name: 'id', label: 'Request ID' },
  { name: 'model', label: 'Model Name' },
  { name: 'submittedAt', label: 'Submitted Date' },
  { name: 'stage', label: 'Current Stage' },
  { 
    name: 'status', 
    label: 'Status',
    options: {
      customBodyRender: (value) => {
        let color = 'default';
        if (value === 'Passed') color = 'success';
        if (value === 'Testing') color = 'primary';
        if (value === 'Blocked') color = 'error';
        if (value === 'In Transit') color = 'warning';
        return <Chip label={value} color={color} size="small" />;
      }
    }
  }
];

const options = {
  filterType: 'checkbox',
  elevation: 0,
  selectableRows: 'none',
  viewColumns: false,
  download: false,
  print: false,
  pagination: false,
  search: false
};

const OnboardingDashboard = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Metrics Row */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {dashboardMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ borderTop: `4px solid ${metric.color}`, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography variant="h3" sx={{ color: metric.color }}>
                      {metric.count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Activity Table */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
              <Typography variant="h5">Recent Onboarding Requests</Typography>
            </Box>
            <MUIDataTable
              data={recentRequestsData}
              columns={columns}
              options={options}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OnboardingDashboard;
