import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableContainer, TableRow, Select, MenuItem, FormControl,
  Divider, Chip, Button
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from 'recharts';
import MemoryIcon from '@mui/icons-material/Memory';
import WifiIcon from '@mui/icons-material/Wifi';
import BlockIcon from '@mui/icons-material/Block';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';
import UserServices from '../../../services/UserServices';
// Mock Data
// const stats = [
//   {
//     id: 1, count: 2631, label: 'INSTALLED VLTDs IN ALL VEHICLES',
//     Icon: MemoryIcon, bg: 'linear-gradient(135deg, #6c3bfc, #9b6bfe)',
//     darkBg: 'rgba(0,0,0,0.15)'
//   },
//   {
//     id: 2, count: 2612, label: 'VLTDs IN REGISTERED VEHICLES',
//     Icon: DirectionsCarIcon, bg: 'linear-gradient(135deg, #3b9afc, #6bcafe)',
//     darkBg: 'rgba(0,0,0,0.15)'
//   },
//   {
//     id: 3, count: 1410, label: 'ACTIVE VLTDs', subtitle: '(Within Last 10 Min)',
//     Icon: WifiIcon, bg: 'linear-gradient(135deg, #2dc76d, #5ae89a)',
//     darkBg: 'rgba(0,0,0,0.15)'
//   },
//   {
//     id: 4, count: 1155, label: 'INACTIVE VLTDs', subtitle: '(For more than 10 Min)',
//     Icon: BlockIcon, bg: 'linear-gradient(135deg, #fc8b2b, #ffb97a)',
//     darkBg: 'rgba(0,0,0,0.15)'
//   },
//   {
//     id: 5, count: 47, label: 'NEVER ACTIVE VLTDs',
//     Icon: CancelIcon, bg: 'linear-gradient(135deg, #fc3b6b, #ff7a9a)',
//     darkBg: 'rgba(0,0,0,0.15)'
//   },
//   {
//     id: 6, count: 375, label: 'E-SIM VALIDITY EXHAUSTED',
//     Icon: HourglassEmptyIcon, bg: 'linear-gradient(135deg, #2bbbe0, #7ee8ff)',
//     darkBg: 'rgba(0,0,0,0.15)'
//   }
// ];

// const vendorWiseData = [
//   { name: 'AEPL', value: 46 },
//   { name: 'APM', value: 152 },
//   { name: 'BBOX', value: 243 },
//   { name: 'EGAS', value: 0 },
//   { name: 'INTE4G', value: 0 },
//   { name: 'INTENA', value: 0 },
//   { name: 'TRIANGLE', value: 0 },
//   { name: 'NIPP', value: 1358 },
//   { name: 'RA10', value: 159 },
//   { name: 'VLT1', value: 660 },
//   { name: 'WTEX', value: 13 }
// ];

// const inactiveVltdsData = [
//   { name: 'from 15 to 30 Days (34)', value: 34, color: '#e74c3c' },
//   { name: 'From More than 30 Days (478)', value: 478, color: '#f39c12' },
//   { name: 'from 7 to 15 Days (42)', value: 42, color: '#9b59b6' },
//   { name: 'from 24 Hours to 7 Days (79)', value: 79, color: '#3498db' },
//   { name: 'From 10 Min to 24 Hours (522)', value: 522, color: '#1abc9c' }
// ];

const renderCustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 5} fill="#333" textAnchor="middle" fontSize={10} fontWeight="bold">
      {value}
    </text>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomPieLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="600">
      {name}
    </text>
  );
};

const SystemAdminDashboard = () => {
  const [vendorFilter, setVendorFilter] = useState('All Vendors');

  const [vltdSummary, setVltdSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVltDSummary = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await UserServices.getVltDSummary();

      console.log('VLTD Summary API Response:', response);

      setVltdSummary(response?.data);
    } catch (err) {
      console.error('VLTD Summary API Error:', err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Failed to load VLTD summary data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVltDSummary();
  }, []);

  // =====================================================
  // API DATA MAPPING
  // =====================================================

  const summary = vltdSummary?.vltd_summary || {};

  const stats = [
    {
      id: 1,
      count: summary.installed_vltds_in_all_vehicles ?? 0,
      label: 'INSTALLED VLTDs IN ALL VEHICLES',
      Icon: MemoryIcon,
      bg: 'linear-gradient(135deg, #6c3bfc, #9b6bfe)',
    },
    {
      id: 2,
      count: summary.vltds_in_registered_vehicles ?? 0,
      label: 'VLTDs IN REGISTERED VEHICLES',
      Icon: DirectionsCarIcon,
      bg: 'linear-gradient(135deg, #3b9afc, #6bcafe)',
    },
    {
      id: 3,
      count: summary.active_vltds ?? 0,
      label: 'ACTIVE VLTDs',
      subtitle: '(Within Last 10 Min)',
      Icon: WifiIcon,
      bg: 'linear-gradient(135deg, #2dc76d, #5ae89a)',
    },
    {
      id: 4,
      count: summary.inactive_vltds ?? 0,
      label: 'INACTIVE VLTDs',
      subtitle: '(For more than 10 Min)',
      Icon: BlockIcon,
      bg: 'linear-gradient(135deg, #fc8b2b, #ffb97a)',
    },
    {
      id: 5,
      count: summary.never_active_vltds ?? 0,
      label: 'NEVER ACTIVE VLTDs',
      Icon: CancelIcon,
      bg: 'linear-gradient(135deg, #fc3b6b, #ff7a9a)',
    },
    {
      id: 6,
      count: summary.esim_validity_exhausted ?? 0,
      label: 'E-SIM VALIDITY EXHAUSTED',
      Icon: HourglassEmptyIcon,
      bg: 'linear-gradient(135deg, #2bbbe0, #7ee8ff)',
    }
  ];

  // Vendor-wise chart
  const vendorWiseData = (vltdSummary?.vendor_wise_vltds || []).map(
    (item) => ({
      name: item.vendor_name,
      value: item.installed_vltd_count,
    })
  );

  // Inactive VLTD breakdown
  const inactiveBreakdown = vltdSummary?.inactive_breakdown || {};

  const inactiveVltdsData = [
    {
      name: 'From 15 to 30 Days',
      value: inactiveBreakdown['15_to_30_days'] ?? 0,
      color: '#e74c3c',
    },
    {
      name: 'More than 30 Days',
      value: inactiveBreakdown['more_than_30_days'] ?? 0,
      color: '#f39c12',
    },
    {
      name: 'From 7 to 15 Days',
      value: inactiveBreakdown['7_to_15_days'] ?? 0,
      color: '#9b59b6',
    },
    {
      name: 'From 24 Hours to 7 Days',
      value: inactiveBreakdown['24_hours_to_7_days'] ?? 0,
      color: '#3498db',
    },
    {
      name: 'From 10 Min to 24 Hours',
      value: inactiveBreakdown['10_min_to_24_hours'] ?? 0,
      color: '#1abc9c',
    }
  ];

  // Health status
  const healthStatus = vltdSummary?.vltd_health_status || {};

  const healthData = [
    {
      label: 'Health Request Sent',
      value: healthStatus.health_request_sent ?? 0,
      color: '#7c4dff',
    },
    {
      label: 'Health Response Received',
      value: healthStatus.health_response_received ?? 0,
      color: '#28b463',
    },
    {
      label: 'Health Response Awaited',
      value: healthStatus.health_response_awaited ?? 0,
      color: '#fc8b2b',
    }
  ];

  // Manufacturer details
  const manufacturerDetails = vltdSummary?.manufacturer_details || {};

  const manufacturerData = [
    {
      label: 'Total VLTD Manufacturers',
      value: manufacturerDetails.total_vltd_manufacturers ?? 0,
      color: '#7c4dff',
    },
    {
      label: 'Total RFCs',
      value: manufacturerDetails.total_rfcs ?? 0,
      color: '#1abc9c',
    },
    {
      label: 'Total VLTD Models',
      value: manufacturerDetails.total_vltd_models ?? 0,
      color: '#28b463',
    }
  ];

  // eSIM validity
  const esimValidity = vltdSummary?.esim_validity || {};

  const esimValidityData = [
    {
      count: esimValidity['0_7_days_remaining'] ?? 0,
      label: '0-7 Days\nRemaining',
    },
    {
      count: esimValidity['8_15_days_remaining'] ?? 0,
      label: '8-15 Days\nRemaining',
    },
    {
      count: esimValidity['16_30_days_remaining'] ?? 0,
      label: '16-30 Days\nRemaining',
    }
  ];

  const vendorOptions = vltdSummary?.vendor_wise_vltds || [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Box sx={{ bgcolor: '#f4f6fb', minHeight: '100vh', p: 0 }}>
      {/* Top Header Bar */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 2, py: 1.5, bgcolor: '#fff', borderBottom: '1px solid #e8ecf4',
        flexWrap: 'wrap', gap: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon sx={{ color: '#7c4dff', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#444' }}>{dateStr}</Typography>
          <AccessTimeIcon sx={{ color: '#7c4dff', fontSize: 20, ml: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#444' }}>{timeStr}</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Welcome + Map Banner */}
        <Box sx={{
          bgcolor: '#fff',
          borderRadius: 3, px: 3, py: 2, mb: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 1, position: 'relative', overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#4a00c8', mb: 0.5 }}>
              Welcome to SkyTron
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Assam State AIS 140 VLTD Monitoring &amp; Management Platform
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 700, color: '#7c4dff', fontSize: '13px' }}>
              সুৰক্ষিত যাত্ৰা, সুৰক্ষিত অসম
            </Typography>
            <Typography variant="caption" sx={{ color: '#888' }}>Safer Journeys, Safer Assam</Typography>
          </Box>
          {/* Decorative Assam silhouette placeholder */}
          <Box sx={{
            position: 'absolute', right: 170, top: 0, bottom: 0, width: 80,
            opacity: 0.1, display: { xs: 'none', md: 'flex' }, alignItems: 'center',
          }}>
            <Typography sx={{ fontSize: 60, color: '#7c4dff' }}>🗺</Typography>
          </Box>
        </Box>

        {/* Top 6 Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {stats.map((s) => (
            <Grid item xs={6} sm={4} md={2} key={s.id}>
              <Card sx={{
                background: s.bg, color: '#fff', borderRadius: 3,
                position: 'relative', overflow: 'hidden', height: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column'
              }}>
                <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.15 }}>
                  <s.Icon sx={{ fontSize: 90 }} />
                </Box>
                <CardContent sx={{ p: '14px !important', flexGrow: 1, zIndex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', lineHeight: 1 }}>{s.count}</Typography>
                  <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', lineHeight: 1.3, mt: 0.5, opacity: 0.95, fontWeight: 600 }}>
                    {s.label}
                  </Typography>
                  {s.subtitle && (
                    <Typography sx={{ fontSize: '9px', opacity: 0.85 }}>{s.subtitle}</Typography>
                  )}
                </CardContent>
                <Box sx={{
                  bgcolor: 'rgba(0,0,0,0.18)', py: 0.5, px: 1.5,
                  display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.25)' }
                }}>
                  <Typography sx={{ fontSize: '11px', color: '#fff', fontWeight: 500 }}>More info</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#fff' }}>→</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Bar Chart */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon sx={{ color: '#7c4dff', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Number of Installed VLTDs Vendor Wise
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small">
                    <Select
                      value={vendorFilter}
                      onChange={(e) => setVendorFilter(e.target.value)}
                      sx={{
                        fontSize: '12px',
                        height: 30,
                        borderRadius: 2,
                        minWidth: 150
                      }}
                    >
                      <MenuItem value="All Vendors">
                        All Vendors
                      </MenuItem>

                      {vendorOptions.map((vendor) => (
                        <MenuItem
                          key={vendor.manufacturer_id}
                          value={String(vendor.manufacturer_id)}
                        >
                          {vendor.vendor_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <MoreVertIcon sx={{ color: '#aaa', cursor: 'pointer' }} />
                </Box>
              </Box>
              <Box sx={{ height: 300, px: 1, pb: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorWiseData} margin={{ top: 20, right: 20, left: -10, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={55} interval={0} fontSize={10} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#28b463" barSize={22} radius={[3, 3, 0, 0]}>
                      <LabelList dataKey="value" content={renderCustomBarLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 1.5, gap: 0.8 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28b463' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', fontSize: '11px' }}>
                  Count of Installed VLTDs
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#7c4dff', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    VLTDs Not Sending Data / Inactive VLTDs
                  </Typography>
                </Box>
                <MoreVertIcon sx={{ color: '#aaa', cursor: 'pointer' }} />
              </Box>
              <Box sx={{ height: 360, width: '100%', overflow: 'visible' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <Pie
                      data={inactiveVltdsData}
                      cx="50%"
                      cy="50%"
                      labelLine={{ stroke: '#999', strokeWidth: 1 }}
                      label={renderCustomPieLabel}
                      outerRadius={75}
                      dataKey="value"
                    >
                      {inactiveVltdsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom 3 Cards */}
        <Grid container spacing={2}>
          {/* VLTD Health Status */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #fc3b6b, #ff7aaa)',
                px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1
              }}>
                <FavoriteBorderIcon sx={{ color: '#fff', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>VLTD Health Status</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {healthData.map((row, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          '&:nth-of-type(even)': {
                            bgcolor: '#fafafa'
                          }
                        }}
                      >
                        <TableCell
                          sx={{
                            color: '#555',
                            py: 1,
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '13px'
                          }}
                        >
                          {row.label}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            py: 1,
                            borderBottom: '1px solid #f0f0f0'
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: row.color,
                              color: 'white',
                              px: 1,
                              py: 0.2,
                              borderRadius: '4px',
                              display: 'inline-block',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              minWidth: 28,
                              textAlign: 'center'
                            }}
                          >
                            {row.value}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* VLTD Manufacturer Details */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #6c3bfc, #a87bfe)',
                px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1
              }}>
                <SettingsIcon sx={{ color: '#fff', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>VLTD Manufacturer Details</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {manufacturerData.map((row, i) => (
                      <TableRow key={i} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ color: '#555', py: 1, borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                          {row.label}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1, borderBottom: '1px solid #f0f0f0' }}>
                          <Box sx={{
                            bgcolor: row.color, color: 'white', px: 1, py: 0.2, borderRadius: '4px',
                            display: 'inline-block', fontSize: '12px', fontWeight: 'bold', minWidth: 28, textAlign: 'center'
                          }}>
                            {row.value}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* VLTD eSIM Validity Expiring Soon */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #fc8b2b, #ffb97a)',
                px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1
              }}>
                <TimerIcon sx={{ color: '#fff', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>VLTD eSIM Validity Expiring Soon</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container textAlign="center">
                  {esimValidityData.map((item, i) => (
                    <Grid item xs={4} key={i} sx={{ borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#333', lineHeight: 1.2 }}>
                        {item.count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#777', whiteSpace: 'pre-line', lineHeight: 1.3, display: 'block', mt: 0.5 }}>
                        {item.label}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SystemAdminDashboard;
