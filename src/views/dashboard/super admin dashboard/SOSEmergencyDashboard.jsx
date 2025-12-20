import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  StatBarChart,
  useSosDashboardData
} from './SuperAdminCommon';

const SOSEmergencyDashboard = () => {
  const { sosData, sosCalls, sosLoading } = useSosDashboardData();

  const sosChartData = [
    { name: 'Active', value: sosData.activeSOS, color: '#ef4444' },
    { name: 'Pending', value: sosData.pendingSOS, color: '#f97316' },
    { name: 'Closed', value: sosData.closedSOS, color: '#22c55e' }
  ];

  return (
    <PageWrapper
      title="SOS & Emergency"
      description="Live incident management for SOS calls across the network."
    >
      <DashboardCard
        title="SOS & Emergency"
        subtitle="Incident Management"
        accentColor="#ef4444"
        animationDelay="0.4s"
        chartComponent={<StatBarChart data={sosChartData} />}
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <MetricCard label="Active SOS" value={sosLoading ? '...' : sosData.activeSOS} color="#ef4444" />
          </Grid>
          <Grid item xs={4}>
            <MetricCard label="Pending" value={sosLoading ? '...' : sosData.pendingSOS} color="#f97316" />
          </Grid>
          <Grid item xs={4}>
            <MetricCard label="Closed" value={sosLoading ? '...' : sosData.closedSOS} color="#22c55e" />
          </Grid>
        </Grid>

        <Box
          sx={{
            overflow: 'auto',
            bgcolor: '#ffffff',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            minHeight: '400px'
          }}
        >
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: '#f8fafc',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: '#f8fafc',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: '#f8fafc',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    Location
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: '#f8fafc',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sosLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#1e293b', py: 4 }}>
                      <CircularProgress size={24} sx={{ color: '#1e293b' }} />
                    </TableCell>
                  </TableRow>
                ) : sosCalls.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ color: '#64748b', py: 4, fontSize: '0.875rem' }}
                    >
                      No active SOS calls
                    </TableCell>
                  </TableRow>
                ) : (
                  sosCalls.map((call, index) => (
                    <TableRow key={call.id || index} hover sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <TableCell sx={{ color: '#1e293b', fontSize: '0.8rem', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                        #{call.id || index + 1}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                        <Chip
                          label={call.status || 'pending'}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 600,
                            bgcolor:
                              call.status === 'active'
                                ? alpha('#ef4444', 0.1)
                                : call.status === 'pending'
                                ? alpha('#f97316', 0.1)
                                : alpha('#22c55e', 0.1),
                            color:
                              call.status === 'active'
                                ? '#ef4444'
                                : call.status === 'pending'
                                ? '#f97316'
                                : '#22c55e',
                            border:
                              call.status === 'active'
                                ? `1px solid ${alpha('#ef4444', 0.2)}`
                                : call.status === 'pending'
                                ? `1px solid ${alpha('#f97316', 0.2)}`
                                : `1px solid ${alpha('#22c55e', 0.2)}`
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.8rem', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                        {call.location || 'Unknown'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.8rem', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                        {call.created_at ? new Date(call.created_at).toLocaleTimeString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DashboardCard>
    </PageWrapper>
  );
};

export default SOSEmergencyDashboard;
