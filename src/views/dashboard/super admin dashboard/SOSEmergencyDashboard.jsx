import { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';

import {
  PageWrapper,
  DashboardCard,
  MetricCard,
  StatPieChart,
  MonthlyTrendsChart,
  useSosDashboardData
} from './SuperAdminCommon';
import UserServices from 'services/UserServices';

const rippleExpand = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.25); opacity: 0.8; }
  70% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(1.25); opacity: 0; }
`;

const ripplePulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
`;

const COLORS = {
  primary: '#ef4444',
  warning: '#f97316',
  success: '#22c55e',
  surface: alpha('#ef4444', 0.06),
  border: alpha('#ef4444', 0.18),
  textPrimary: '#1e1b4b',
  textSecondary: '#475569'
};

const fadeUpAnimation = {
  animation: 'fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1)',
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(14px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
};

const SearchingLoader = () => (
  <Stack spacing={1.25} alignItems="center" justifyContent="center">
    <Box
      sx={{
        position: 'relative',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '68%',
          height: '68%',
          borderRadius: '50%',
          border: `1px solid ${alpha(COLORS.primary, 0.35)}`,
          boxShadow: `0 0 22px ${alpha(COLORS.primary, 0.25)}`,
          backdropFilter: 'blur(2px)'
        }}
      />

      {[0, 0.4, 0.85].map((delay, index) => (
        <Box
          key={delay}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${72 + index * 14}%`,
            height: `${72 + index * 14}%`,
            borderRadius: '50%',
            border: `2px solid ${alpha(COLORS.primary, 0.28 - index * 0.06)}`,
            animation: `${rippleExpand} 1.9s ease-out infinite`,
            animationDelay: `${delay}s`,
            transformOrigin: 'center',
            willChange: 'transform, opacity'
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          width: 22,
          height: 22,
          borderRadius: '50%',
          top: '50%',
          left: '50%',
          background: `radial-gradient(circle, ${alpha(COLORS.primary, 0.9)} 0%, ${alpha(COLORS.primary, 0.25)} 60%, transparent 100%)`,
          animation: `${ripplePulse} 1.4s ease-in-out infinite`,
          transformOrigin: 'center',
          willChange: 'transform, opacity'
        }}
      />
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        letterSpacing: 1.25,
        textTransform: 'uppercase',
        color: COLORS.textPrimary,
        textAlign: 'center'
      }}
    >
      scanning for new sos calls
    </Typography>
  </Stack>
);

const SOSEmergencyDashboard = () => {
  const { sosData, sosCalls, sosLoading } = useSosDashboardData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedCallKey, setSelectedCallKey] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const resolveCallKey = useCallback((call, fallbackIndex) => {
    if (!call) {
      return fallbackIndex !== undefined ? `fallback-${fallbackIndex}` : undefined;
    }

    return (
      call.id ??
      call.reference ??
      call.case_id ??
      call.uuid ??
      call._id ??
      (fallbackIndex !== undefined ? `fallback-${fallbackIndex}` : undefined)
    );
  }, []);

  const dummyCalls = useMemo(
    () => [
      {
        id: 'SOS-201',
        status: 'active',
        location: 'GS Road, Guwahati',
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        reporter_name: 'Traffic Control',
        notes: 'Multi-vehicle collision reported'
      },
      {
        id: 'SOS-189',
        status: 'pending',
        location: 'Dispur Police Station',
        created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        reporter_name: 'Civic Helpline',
        notes: 'Distress call awaiting verification'
      },
      {
        id: 'SOS-176',
        status: 'active',
        location: 'NH-27, Jalukbari',
        created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        reporter_name: 'Emergency Watch',
        notes: 'Ambulance requested for medical emergency'
      },
      {
        id: 'SOS-168',
        status: 'closed',
        location: 'Lachit Nagar',
        created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        reporter_name: 'Local Resident',
        notes: 'Resolved after medical assistance'
      }
    ],
    []
  );

  const hasLiveCalls = sosCalls.length > 0;

  const baseCalls = useMemo(
    () => (hasLiveCalls ? sosCalls : dummyCalls),
    [hasLiveCalls, sosCalls, dummyCalls]
  );

  const aggregatedCounts = useMemo(() => {
    return baseCalls.reduce(
      (acc, call) => {
        const status = (call.status || 'pending').toLowerCase();
        if (status === 'active' || status === 'pending' || status === 'closed') {
          acc[status] += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { active: 0, pending: 0, closed: 0 }
    );
  }, [baseCalls]);

  const displayTotals = useMemo(() => {
    if (hasLiveCalls) {
      return {
        activeSOS: sosData.activeSOS ?? aggregatedCounts.active,
        pendingSOS: sosData.pendingSOS ?? aggregatedCounts.pending,
        closedSOS: sosData.closedSOS ?? aggregatedCounts.closed
      };
    }

    return {
      activeSOS: aggregatedCounts.active,
      pendingSOS: aggregatedCounts.pending,
      closedSOS: aggregatedCounts.closed
    };
  }, [hasLiveCalls, sosData.activeSOS, sosData.pendingSOS, sosData.closedSOS, aggregatedCounts]);

  const sosChartData = useMemo(
    () => [
      { name: 'Active', value: displayTotals.activeSOS, color: '#ef4444' },
      { name: 'Pending', value: displayTotals.pendingSOS, color: '#f97316' },
      { name: 'Closed', value: displayTotals.closedSOS, color: '#22c55e' }
    ],
    [displayTotals]
  );

  const filteredCalls = useMemo(() => {
    if (statusFilter === 'all') return baseCalls;
    return baseCalls.filter((call) => {
      const status = (call.status || 'pending').toLowerCase();
      return status === statusFilter;
    });
  }, [baseCalls, statusFilter]);

  const handleStatusFilterChange = (_, value) => {
    if (value !== null) {
      setStatusFilter(value);
      setSelectedCall(null);
      setSelectedCallKey(null);
      setActionFeedback(null);
    }
  };

  const handleRowClick = (call, fallbackIndex) => {
    const key = resolveCallKey(call, fallbackIndex);
    setSelectedCall(call);
    setSelectedCallKey(key);
    setActionFeedback(null);
  };

  const handleAction = (action) => {
    if (!selectedCall) return;
    setActionFeedback({
      action,
      timestamp: new Date().toISOString(),
      reference: selectedCallKey || resolveCallKey(selectedCall)
    });
  };

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        const response = await UserServices.getSOSMonthlyMetrics(new Date().getFullYear());
        if (response.data) {
          const { months, calls, performance } = response.data;
          const processed = months.map((month, index) => ({
            month,
            total: calls?.total?.[index] || 0,
            genuine: calls?.genuine?.[index] || 0,
            fake: calls?.fake?.[index] || 0,
            police_avg: performance?.police_avg_seconds?.[index] || null,
            ambulance_avg: performance?.ambulance_avg_seconds?.[index] || null,
            executive_avg: performance?.executive_accept_avg_seconds?.[index] || null,
          }));
          setMonthlyData(processed);
        }
      } catch (err) {
        console.error('Failed to fetch monthly metrics', err);
      }
    };
    fetchMonthly();
  }, []);

  useEffect(() => {
    if (!selectedCallKey) return;

    const selectionStillVisible = filteredCalls.some((call, idx) => resolveCallKey(call, idx) === selectedCallKey);

    if (!selectionStillVisible) {
      setSelectedCall(null);
      setSelectedCallKey(null);
      setActionFeedback(null);
    }
  }, [filteredCalls, selectedCallKey, resolveCallKey]);

  const metricValue = useCallback(
    (value) => (sosLoading && hasLiveCalls ? '...' : value),
    [sosLoading, hasLiveCalls]
  );

  return (
    <PageWrapper
      title="SOS & Emergency"
      description="Live incident management for SOS calls across the network."
    >
      <DashboardCard
        title="SOS & Emergency"
        subtitle="Incident Management"
        accentColor={COLORS.primary}
        animationDelay="0.4s"
        sx={{ flex: 1, minHeight: 0 }}
        chartComponent={
          <Stack spacing={4} sx={{ height: '100%', justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ width: '100%', textAlign: 'center', flexShrink: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: 0.5 }}>
                DAILY CALL DETAILS
                <br />
                <span style={{ fontSize: '0.85em', fontWeight: 500, opacity: 0.8 }}>12.00 AM TO 11.59 PM</span>
              </Typography>
              <Box sx={{ height: 180, width: '100%' }}>
                <StatPieChart data={sosChartData} height={200} />
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  Monthly Analytics
                </Typography>
                <Chip label={`${new Date().getFullYear()}`} size="small" sx={{ height: 30, fontSize: '0.7rem', bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 600 }} />
              </Box>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <MonthlyTrendsChart data={monthlyData} height="100%" />
              </Box>
            </Box>
          </Stack>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <MetricCard label="Active SOS" value={metricValue(displayTotals.activeSOS)} color={COLORS.primary} />
          </Grid>
          <Grid item xs={4}>
            <MetricCard label="Pending" value={metricValue(displayTotals.pendingSOS)} color={COLORS.warning} />
          </Grid>
          <Grid item xs={4}>
            <MetricCard label="Closed" value={metricValue(displayTotals.closedSOS)} color={COLORS.success} />
          </Grid>
        </Grid>

        <Box
          sx={{
            mb: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
              Status Filter
            </Typography>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              size="small"
              onChange={handleStatusFilterChange}
              aria-label="sos status filter"
              sx={{ height: 32 }}
            >
              <ToggleButton value="all" sx={{ py: 0.5 }}>All</ToggleButton>
              <ToggleButton value="active" sx={{ py: 0.5 }}>Active</ToggleButton>
              <ToggleButton value="pending" sx={{ py: 0.5 }}>Pending</ToggleButton>
              <ToggleButton value="closed" sx={{ py: 0.5 }}>Closed</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Tooltip title="Click a row to view quick actions">
            <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
              {filteredCalls.length} call{filteredCalls.length === 1 ? '' : 's'} in view
            </Typography>
          </Tooltip>
        </Box>

        <Box
          sx={{
            ...fadeUpAnimation,
            overflow: 'hidden',
            bgcolor: '#ffffff',
            borderRadius: 3,
            border: `1px solid ${alpha(COLORS.primary, 0.16)}`,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}
        >
          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: alpha(COLORS.primary, 0.08),
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: `1px solid ${alpha(COLORS.primary, 0.18)}`
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(COLORS.primary, 0.08),
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: `1px solid ${alpha(COLORS.primary, 0.18)}`
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(COLORS.primary, 0.08),
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: `1px solid ${alpha(COLORS.primary, 0.18)}`
                    }}
                  >
                    Location
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(COLORS.primary, 0.08),
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      borderBottom: `1px solid ${alpha(COLORS.primary, 0.18)}`
                    }}
                  >
                    Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sosLoading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: COLORS.textPrimary, py: 4 }}>
                      <SearchingLoader />
                    </TableCell>
                  </TableRow>
                )}

                {!sosLoading && filteredCalls.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ color: COLORS.textSecondary, py: 4, fontSize: '0.875rem' }}
                    >
                      No SOS calls match the selected filters
                    </TableCell>
                  </TableRow>
                )}

                {!sosLoading &&
                  filteredCalls.length > 0 &&
                  filteredCalls.map((call, index) => {
                    const rowKey = resolveCallKey(call, index);
                    const isSelected = selectedCallKey === rowKey;

                    const status = (call.status || 'pending').toLowerCase();
                    const statusConfig = {
                      active: { color: COLORS.primary, surface: alpha(COLORS.primary, 0.1) },
                      pending: { color: COLORS.warning, surface: alpha(COLORS.warning, 0.12) },
                      closed: { color: COLORS.success, surface: alpha(COLORS.success, 0.12) }
                    }[status] || { color: COLORS.warning, surface: alpha(COLORS.warning, 0.12) };

                    return (
                      <TableRow
                        key={rowKey || index}
                        hover
                        onClick={() => handleRowClick(call, index)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isSelected ? alpha(COLORS.primary, 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha(COLORS.primary, 0.06) },
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ color: COLORS.textPrimary, fontSize: '0.8rem', py: 1.5, borderBottom: `1px solid ${alpha(COLORS.primary, 0.08)}` }}>
                          #{call.id || index + 1}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${alpha(COLORS.primary, 0.08)}` }}>
                          <Chip
                            label={status}
                            size="small"
                            sx={{
                              textTransform: 'capitalize',
                              fontSize: '0.7rem',
                              height: 22,
                              fontWeight: 600,
                              bgcolor: statusConfig.surface,
                              color: statusConfig.color,
                              border: `1px solid ${alpha(statusConfig.color, 0.2)}`
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.8rem', py: 1.5, borderBottom: `1px solid ${alpha(COLORS.primary, 0.08)}` }}>
                          {call.location || 'Unknown'}
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.8rem', py: 1.5, borderBottom: `1px solid ${alpha(COLORS.primary, 0.08)}` }}>
                          {call.created_at ? new Date(call.created_at).toLocaleTimeString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {selectedCall && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
              bgcolor: alpha(COLORS.primary, 0.04),
              display: 'grid',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Focused SOS #{selectedCallKey || '—'}
              </Typography>
              <Chip
                size="small"
                label={(selectedCall.status || 'pending').toUpperCase()}
                sx={{
                  fontWeight: 600,
                  bgcolor: alpha(COLORS.primary, 0.15),
                  color: COLORS.primary
                }}
              />
            </Box>

            <Stack spacing={0.75} sx={{ color: COLORS.textSecondary, fontSize: '0.85rem' }}>
              <span>
                Location:&nbsp;
                <strong>{selectedCall.location || 'Unknown'}</strong>
              </span>
              <span>
                Reporter:&nbsp;
                <strong>{selectedCall.reporter_name || selectedCall.caller || 'Not available'}</strong>
              </span>
              <span>
                Created:&nbsp;
                <strong>
                  {selectedCall.created_at
                    ? new Date(selectedCall.created_at).toLocaleString()
                    : 'N/A'}
                </strong>
              </span>
              {selectedCall.notes && (
                <span>
                  Notes:&nbsp;
                  <strong>{selectedCall.notes}</strong>
                </span>
              )}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleAction('acknowledged')}
              >
                Mark as Acknowledged
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleAction('dispatch_initiated')}
              >
                Dispatch Nearest Unit
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleAction('resolved')}
              >
                Mark Resolved
              </Button>
            </Stack>

            {actionFeedback && (
              <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                Last action “{actionFeedback.action.replace(/_/g, ' ')}” for reference{' '}
                {actionFeedback.reference || 'N/A'} at{' '}
                {new Date(actionFeedback.timestamp).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        )}
      </DashboardCard>
    </PageWrapper>
  );
};

export default SOSEmergencyDashboard;
