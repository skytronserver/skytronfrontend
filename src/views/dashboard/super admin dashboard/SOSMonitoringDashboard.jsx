import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { alpha } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import FolderIcon from '@mui/icons-material/Folder';
import DiamondIcon from '@mui/icons-material/Diamond';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CloudIcon from '@mui/icons-material/Cloud';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import { DashboardMap } from './SuperAdminCommon';
import HomePageService from 'services/HomePage';

const formatNumber = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value ?? '—';
  return numeric.toLocaleString();
};

const getStatusChipStyles = (mode, status) => {
  const s = String(status || '').toLowerCase();

  if (s === 'on-scene' || s === 'on-route' || s === 'pending' || s === 'closed') {
    return {
      bgcolor: 'transparent',
      color: '#fff',
      border: 'none',
      fontWeight: 600,
      height: 24,
      fontSize: '0.75rem',
      px: 0,
      '& .MuiChip-label': {
        px: 1
      }
    };
  }

  return {
    bgcolor: 'transparent',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    height: 24,
    fontSize: '0.75rem'
  };
};

const SOSMonitoringDashboard = () => {
  const [mode, setMode] = useState('dark');
  const [activeTab, setActiveTab] = useState(0);

  const initialCases = useMemo(
    () => [
      {
        callId: '#24567',
        age: '12m',
        district: 'Central',
        caseType: 'Panic Alert',
        executive: 'Singh',
        policeStatus: 'On-Scene',
        ambulanceStatus: 'On-Route',
        sla: 0.65,
        policeIcon: 'check',
        ambulanceIcon: 'warning',
        sosType: 'device',
        caseOutcome: ''
      },
      {
        callId: '#24558',
        age: '8m',
        district: 'East',
        caseType: 'Medical Emergency',
        executive: 'Verma',
        policeStatus: 'On-Route',
        ambulanceStatus: 'Accepted',
        sla: 0.45,
        policeIcon: 'check',
        ambulanceIcon: 'check',
        sosType: 'app_unreg',
        caseOutcome: ''
      },
      {
        callId: '#24542',
        age: '22m',
        district: 'North',
        caseType: 'Threat Perception',
        executive: 'Mehta',
        policeStatus: 'Pending',
        ambulanceStatus: 'Pending',
        sla: 0.55,
        policeIcon: 'check',
        ambulanceIcon: 'warning',
        sosType: 'app_reg',
        caseOutcome: ''
      },
      {
        callId: '#24529',
        age: '15m',
        district: 'West',
        caseType: 'False Alarm',
        executive: 'Kumar',
        policeStatus: 'Closed',
        ambulanceStatus: 'Closed',
        sla: 0.6,
        policeIcon: 'check',
        ambulanceIcon: 'check',
        sosType: 'app_trip',
        caseOutcome: 'fake'
      }
    ],
    []
  );

  const [cases, setCases] = useState(initialCases);
  const [dirtyMap, setDirtyMap] = useState({});
  const [saving, setSaving] = useState(false);

  const hasDirty = useMemo(() => Object.values(dirtyMap).some(Boolean), [dirtyMap]);

  const handleSaveAll = async () => {
    const dirtyIds = Object.keys(dirtyMap).filter((id) => dirtyMap[id]);
    const payload = cases
      .filter((c) => dirtyIds.includes(c.callId))
      .map((c) => ({
        callId: c.callId,
        sosType: c.sosType || null,
        caseOutcome: c.caseOutcome || null
      }));

    if (!payload.length) return;

    try {
      setSaving(true);
      await HomePageService.updateSOSCaseMeta({ updates: payload });
      setDirtyMap({});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save SOS meta:', e);
      alert('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sosTypeOptions = useMemo(
    () => [
      { value: 'device', label: 'SOS from Device' },
      { value: 'app_unreg', label: 'SOS from App (Unreg)' },
      { value: 'app_reg', label: 'SOS from App (Reg)' },
      { value: 'app_trip', label: 'SOS from App (Trip)' }
    ],
    []
  );

  const caseOutcomeOptions = useMemo(
    () => [
      { value: 'genuine', label: 'Genuine' },
      { value: 'fake', label: 'Fake' }
    ],
    []
  );

  const tokens = useMemo(() => {
    if (mode === 'dark') {
      return {
        pageBg: '#1a1f2e',
        cardBg: '#0f1419',
        headerBg: '#1e3a5f',
        border: alpha('#475569', 0.3),
        divider: alpha('#475569', 0.2),
        text: '#e5e7eb',
        muted: alpha('#e5e7eb', 0.7),
        panelHeaderBg: alpha('#1e3a5f', 0.4),
        kpiStripBg: alpha('#000', 0.2)
      };
    }

    return {
      pageBg: '#e9eef6',
      cardBg: '#ffffff',
      headerBg: '#1e3a8a',
      border: '#cbd5e1',
      divider: '#e2e8f0',
      text: '#0f172a',
      muted: '#475569',
      panelHeaderBg: alpha('#1e3a8a', 0.08),
      kpiStripBg: '#f8fafc'
    };
  }, [mode]);

  const kpis = useMemo(() => {
    if (mode === 'dark') {
      return [
        { label: 'Total Calls', value: 1256, bg: '#1e3a5f' },
        { label: 'Live Calls', value: 18, bg: '#2a4a7c', emphasis: true },
        { label: 'Pending Calls', value: 7, bg: '#3d4e6b' },
        { label: 'Closed Calls', value: 1231, bg: '#1e3a5f' },
        { label: 'Avg Exec Accept', value: '1.2 min', bg: '#2c5f6f' },
        { label: 'Avg Police On-Scene', value: '8.5 min', bg: '#2c5f6f' },
        { label: 'Escalation Rate', value: '5.2%', bg: '#2c5f6f' }
      ];
    }

    return [
      { label: 'Total Calls', value: 1256, bg: '#eef2ff' },
      { label: 'Live Calls', value: 18, bg: '#dbeafe', emphasis: true },
      { label: 'Pending Calls', value: 7, bg: '#ecfeff' },
      { label: 'Closed Calls', value: 1231, bg: '#f1f5f9' },
      { label: 'Avg Exec Accept', value: '1.2 min', bg: '#fef3c7' },
      { label: 'Avg Police On-Scene', value: '8.5 min', bg: '#ffe4e6' },
      { label: 'Escalation Rate', value: '5.2%', bg: '#dcfce7' }
    ];
  }, [mode]);

  const statusRows = useMemo(
    () => [
      { label: 'Triggered', value: 1256, color: '#3b82f6', width: 100 },
      { label: 'Assigned', value: 1190, color: '#4ade80', width: 95 },
      { label: 'Exec Accepted', value: 1175, color: '#4ade80', width: 93 },
      { label: 'Broadcasted', value: 980, color: '#fb923c', width: 78 },
      { label: 'Police Accepted', value: 920, color: '#ef4444', width: 73 },
      { label: 'Amb Accepted', value: 880, color: '#dc2626', width: 70 },
      { label: 'On-Scene', value: 845, color: '#6366f1', width: 67 },
      { label: 'Closed', value: 1231, color: '#64748b', width: 98 }
    ],
    []
  );

  const incidents = useMemo(
    () => [
      { latitude: 26.1445, longitude: 91.7362, type: 'sos', label: 'SOS' },
      { latitude: 26.165, longitude: 91.77, type: 'green', label: 'OK' },
      { latitude: 26.12, longitude: 91.71, type: 'green', label: 'OK' },
      { latitude: 26.14, longitude: 91.69, type: 'blue', label: 'DS' },
      { latitude: 26.11, longitude: 91.76, type: 'blue', label: 'DS' }
    ],
    []
  );

  const cardSx = {
    bgcolor: tokens.cardBg,
    border: `1px solid ${tokens.border}`,
    borderRadius: 2,
    overflow: 'hidden'
  };

  const kpiTextColor = mode === 'dark' ? '#fff' : tokens.text;
  const kpiLabelColor = mode === 'dark' ? alpha('#fff', 0.8) : tokens.muted;

  const iconBtnSx = {
    color: mode === 'dark' ? alpha('#fff', 0.6) : alpha(tokens.text, 0.7),
    bgcolor: mode === 'dark' ? alpha('#fff', 0.05) : alpha(tokens.text, 0.06)
  };

  const tableHeadBg = mode === 'dark' ? alpha('#000', 0.3) : '#e2e8f0';
  const tableHeadColor = mode === 'dark' ? alpha('#fff', 0.9) : tokens.text;
  const tableRowHoverBg = mode === 'dark' ? alpha('#ffffff', 0.02) : alpha('#0f172a', 0.04);
  const tableText = mode === 'dark' ? alpha('#fff', 0.9) : tokens.text;
  const tableMuted = mode === 'dark' ? alpha('#fff', 0.8) : tokens.muted;
  const slaTrackBg = mode === 'dark' ? alpha('#fff', 0.1) : '#e2e8f0';

  const selectControlSx = {
    '& .MuiInputBase-root, & .MuiOutlinedInput-root': {
      bgcolor: mode === 'dark' ? '#f8fafc' : '#fff',
      color: mode === 'dark' ? '#0f172a' : tokens.text,
      '& .MuiSelect-select': {
        color: mode === 'dark' ? '#0f172a' : tokens.text,
        WebkitTextFillColor: mode === 'dark' ? '#0f172a' : tokens.text
      },
      '& .MuiSvgIcon-root': { color: mode === 'dark' ? alpha('#0f172a', 0.7) : tableMuted },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(tokens.divider, 0.8) }
    },
    '& .MuiInputBase-root.Mui-disabled, & .MuiOutlinedInput-root.Mui-disabled': {
      bgcolor: mode === 'dark' ? alpha('#f8fafc', 0.85) : alpha('#0f172a', 0.03),
      '& .MuiSelect-select': {
        color: mode === 'dark' ? '#334155' : tableMuted,
        WebkitTextFillColor: mode === 'dark' ? '#334155' : tableMuted
      },
      '& .MuiSvgIcon-root': { color: mode === 'dark' ? alpha('#0f172a', 0.55) : tableMuted }
    }
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: mode === 'dark' ? '#ffffff' : '#fff',
        color: mode === 'dark' ? '#0f172a' : tokens.text,
        '& .MuiMenuItem-root': {
          fontSize: 13,
          '&.Mui-selected': {
            bgcolor: mode === 'dark' ? alpha('#1e3a8a', 0.08) : alpha('#1e3a8a', 0.08)
          },
          '&.Mui-selected:hover': {
            bgcolor: mode === 'dark' ? alpha('#1e3a8a', 0.12) : alpha('#1e3a8a', 0.12)
          }
        }
      }
    }
  };

  const mapStyle = useMemo(() => {
    // Lazy-load OpenLayers styling classes only when used in browser
    // to avoid issues in non-DOM environments.
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { default: Style } = require('ol/style/Style');
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { default: CircleStyle } = require('ol/style/Circle');
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { default: Fill } = require('ol/style/Fill');
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { default: Stroke } = require('ol/style/Stroke');
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { default: Text } = require('ol/style/Text');

    const makeCircle = (radius, fillColor, strokeColor, strokeWidth = 2) =>
      new CircleStyle({
        radius,
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: strokeColor, width: strokeWidth })
      });

    const sosCore = new Style({
      image: makeCircle(24, '#ef4444', '#fee2e2', 3),
      text: new Text({
        text: 'SOS',
        font: 'bold 15px system-ui, sans-serif',
        fill: new Fill({ color: '#ffffff' })
      })
    });

    const sosRingInner = new Style({
      image: makeCircle(42, 'rgba(248, 113, 113, 0.12)', 'rgba(248, 113, 113, 0.6)', 2)
    });

    const sosRingOuter = new Style({
      image: makeCircle(60, 'rgba(248, 113, 113, 0.06)', 'rgba(248, 113, 113, 0.25)', 1)
    });

    const greenMarker = new Style({
      image: makeCircle(14, '#22c55e', '#bbf7d0', 2)
    });

    const blueMarker = new Style({
      image: makeCircle(14, '#1d4ed8', '#bfdbfe', 2),
      text: new Text({
        text: 'DS',
        font: 'bold 14px system-ui, sans-serif',
        fill: new Fill({ color: '#ffffff' })
      })
    });

    const getStyle = (item) => {
      if (!item || !item.type) return greenMarker;
      if (item.type === 'sos') {
        // Return array of styles to draw concentric rings + core
        return [sosRingOuter, sosRingInner, sosCore];
      }
      if (item.type === 'green') {
        return greenMarker;
      }
      if (item.type === 'blue') {
        return blueMarker;
      }
      return greenMarker;
    };

    return getStyle;
  }, []);

  return (
    <Box
      sx={{
        height: { xs: 'auto', md: '100%' },
        bgcolor: tokens.pageBg,
        p: { xs: 2, md: 1.5 },
        overflow: { xs: 'auto', md: 'hidden' },
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ ...cardSx, mb: 1.5, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            bgcolor: tokens.headerBg,
            color: '#fff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small" sx={{ color: '#fff' }}>
              <MenuIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontWeight: 700, letterSpacing: 0.5, fontSize: { xs: 15, md: 17 } }}>
              SOS Monitoring Dashboard
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ color: alpha('#fff', 0.8), bgcolor: alpha('#fff', 0.1), borderRadius: 1.5 }}>
              <BarChartIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: alpha('#fff', 0.8), bgcolor: alpha('#fff', 0.1), borderRadius: 1.5 }}>
              <TableChartIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: alpha('#fff', 0.8), bgcolor: alpha('#fff', 0.1), borderRadius: 1.5 }}>
              <FolderIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: alpha('#fff', 0.8), bgcolor: alpha('#fff', 0.1), borderRadius: 1.5 }}>
              <DiamondIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              sx={{ color: '#fff', bgcolor: alpha('#fff', 0.14), borderRadius: 1.5 }}
            >
              {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 1.5 }, bgcolor: tokens.kpiStripBg }}>
          <Grid container spacing={1.5}>
            {kpis.map((kpi) => (
              <Grid key={kpi.label} item xs={12} sm={6} md={12 / 7}>
                <Box
                  sx={{
                    borderRadius: 1,
                    bgcolor: kpi.bg,
                    px: 1.5,
                    py: 1,
                    minHeight: { xs: 80, md: 65 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `1px solid ${tokens.border}`
                  }}
                >
                  <Typography sx={{ fontSize: 11.5, color: kpiLabelColor, fontWeight: 600, mb: 1 }}>
                    {kpi.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: kpi.emphasis ? 32 : 28,
                      fontWeight: 700,
                      color: kpiTextColor,
                      lineHeight: 1
                    }}
                  >
                    {typeof kpi.value === 'number' ? formatNumber(kpi.value) : kpi.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ ...cardSx, mb: 1.5, flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            bgcolor: tokens.cardBg,
            borderBottom: `1px solid ${tokens.divider}`,
            '& .MuiTab-root': {
              color: mode === 'dark' ? alpha('#fff', 0.6) : tokens.muted,
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'none',
              minHeight: 56,
              '&.Mui-selected': {
                color: mode === 'dark' ? '#60a5fa' : '#1e3a8a'
              }
            },
            '& .MuiTabs-indicator': {
              bgcolor: mode === 'dark' ? '#60a5fa' : '#1e3a8a',
              height: 3
            }
          }}
        >
          <Tab label="Dashboard Overview" />
          <Tab label="Active SOS Cases" />
        </Tabs>
      </Box>

      {/* Tab Panel 1: Dashboard Overview */}
      {activeTab === 0 && (
        <Grid container spacing={1.5} sx={{ flexGrow: 1, overflow: { xs: 'visible', md: 'hidden' }, maxHeight: { md: 'calc(100% - 10px)' } }}>
          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: '100%' } }}>
            <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${tokens.divider}`, bgcolor: tokens.panelHeaderBg, flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 700, color: tokens.text, fontSize: 14.5 }}>SOS Call Status</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                <Stack spacing={1.25}>
                  {statusRows.map((row, idx) => {
                    return (
                      <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <Box
                          sx={{
                            width: `${row.width}%`,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            color: '#fff',
                            bgcolor: row.color,
                            position: 'relative',
                            clipPath:
                              idx === 0
                                ? 'polygon(0 0, 100% 0, 96% 100%, 0 100%)'
                                : idx === statusRows.length - 1
                                  ? 'polygon(4% 0, 100% 0, 100% 100%, 0 100%)'
                                  : 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)'
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{row.label}</Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{formatNumber(row.value)}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: '100%' } }}>
            <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderBottom: `1px solid ${tokens.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: tokens.panelHeaderBg,
                  flexShrink: 0
                }}
              >
                <Typography sx={{ fontWeight: 700, color: tokens.text, fontSize: 14.5 }}>Live Incident Map</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CloudIcon sx={{ fontSize: 18, color: alpha('#fff', 0.6) }} />
                  <WbSunnyIcon sx={{ fontSize: 18, color: '#60a5fa' }} />
                  <WaterDropIcon sx={{ fontSize: 18, color: alpha('#fff', 0.9) }} />
                  <AcUnitIcon sx={{ fontSize: 18, color: alpha('#fff', 0.5) }} />
                </Stack>
              </Box>
              <Box sx={{ height: { xs: 320, md: '100%' }, flexGrow: 1 }}>
                <DashboardMap
                  data={incidents}
                  center={[91.7362, 26.1445]}
                  zoom={12}
                  getStyle={mapStyle}
                  autoFit
                  autoFitFilter={(item) => item?.type === 'sos'}
                  autoFitMaxZoom={14}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab Panel 2: Active SOS Cases */}
      {activeTab === 1 && (
        <Grid container spacing={1.5} sx={{ flexGrow: 1, overflow: { xs: 'visible', md: 'hidden' }, maxHeight: { md: 'calc(100% - 10px)' } }}>
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: '100%' } }}>
            <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderBottom: `1px solid ${tokens.divider}`,
                  bgcolor: tokens.panelHeaderBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}
              >
                <Typography sx={{ fontWeight: 700, color: tokens.text, fontSize: 14.5 }}>Active SOS Cases</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveAll}
                    disabled={!hasDirty || saving}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: mode === 'dark' ? '#2563eb' : '#1e3a8a',
                      '&:hover': { bgcolor: mode === 'dark' ? '#1d4ed8' : '#1e40af' },
                      '&.Mui-disabled': {
                        bgcolor: mode === 'dark' ? alpha('#2563eb', 0.25) : alpha('#1e3a8a', 0.18),
                        color: mode === 'dark' ? alpha('#fff', 0.6) : alpha('#0f172a', 0.5)
                      }
                    }}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                  <IconButton size="small" sx={iconBtnSx}>
                    <CloudIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={iconBtnSx}>
                    <WbSunnyIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={iconBtnSx}>
                    <MenuIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              <TableContainer sx={{ maxHeight: { xs: 400, md: '100%' }, flexGrow: 1, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {[
                        'Call ID',
                        'Age',
                        'District',
                        'Case Type',
                        'SOS Type',
                        'Case Outcome',
                        'Executive',
                        'Police Status',
                        'Ambulance Status',
                        'SLA'
                      ].map(
                        (head) => (
                          <TableCell
                            key={head}
                            sx={{
                              bgcolor: tableHeadBg,
                              color: tableHeadColor,
                              fontWeight: 700,
                              fontSize: 12,
                              borderBottom: `1px solid ${tokens.divider}`,
                              py: 1.5
                            }}
                          >
                            {head}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cases.map((row) => {
                      const slaPct = Math.round(Math.min(1, Math.max(0, row.sla)) * 100);
                      const slaColors = [
                        '#ef4444',
                        '#fb923c',
                        '#fbbf24',
                        '#84cc16',
                        '#22c55e',
                        '#10b981'
                      ];

                      const isClosed =
                        String(row.policeStatus || '').toLowerCase() === 'closed' &&
                        String(row.ambulanceStatus || '').toLowerCase() === 'closed';

                      const handleSosTypeChange = (event) => {
                        const next = event.target.value;
                        setCases((prev) => prev.map((c) => (c.callId === row.callId ? { ...c, sosType: next } : c)));
                        setDirtyMap((prev) => ({ ...prev, [row.callId]: true }));
                      };

                      const handleCaseOutcomeChange = (event) => {
                        const next = event.target.value;
                        setCases((prev) => prev.map((c) => (c.callId === row.callId ? { ...c, caseOutcome: next } : c)));
                        setDirtyMap((prev) => ({ ...prev, [row.callId]: true }));
                      };

                      return (
                        <TableRow key={row.callId} hover sx={{ '&:hover': { bgcolor: tableRowHoverBg } }}>
                          <TableCell sx={{ color: tableText, fontWeight: 700, borderBottom: `1px solid ${tokens.divider}`, py: 2 }}>
                            {row.callId}
                          </TableCell>
                          <TableCell sx={{ color: tableMuted, borderBottom: `1px solid ${tokens.divider}` }}>
                            {row.age}
                          </TableCell>
                          <TableCell sx={{ color: tableText, borderBottom: `1px solid ${tokens.divider}` }}>
                            {row.district}
                          </TableCell>
                          <TableCell sx={{ color: tableText, borderBottom: `1px solid ${tokens.divider}` }}>
                            {row.caseType}
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${tokens.divider}` }}>
                            <FormControl size="small" fullWidth sx={selectControlSx}>
                              <Select
                                value={row.sosType || ''}
                                onChange={handleSosTypeChange}
                                disabled={isClosed}
                                displayEmpty
                                MenuProps={selectMenuProps}
                              >
                                <MenuItem value="">
                                  <Typography sx={{ color: mode === 'dark' ? '#475569' : tokens.muted, fontSize: 13 }}>
                                    Select
                                  </Typography>
                                </MenuItem>
                                {sosTypeOptions.map((opt) => (
                                  <MenuItem
                                    key={opt.value}
                                    value={opt.value}
                                    sx={{ color: mode === 'dark' ? '#0f172a' : tokens.text }}
                                  >
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${tokens.divider}` }}>
                            <FormControl size="small" fullWidth sx={selectControlSx}>
                              <Select
                                value={row.caseOutcome || ''}
                                onChange={handleCaseOutcomeChange}
                                disabled={!isClosed}
                                displayEmpty
                                MenuProps={selectMenuProps}
                              >
                                <MenuItem value="">
                                  <Typography sx={{ color: mode === 'dark' ? '#475569' : tokens.muted, fontSize: 13 }}>
                                    {isClosed ? 'Select' : 'After Close'}
                                  </Typography>
                                </MenuItem>
                                {caseOutcomeOptions.map((opt) => (
                                  <MenuItem
                                    key={opt.value}
                                    value={opt.value}
                                    sx={{ color: mode === 'dark' ? '#0f172a' : tokens.text }}
                                  >
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${tokens.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: mode === 'dark' ? '#475569' : '#1e3a8a',
                                  fontSize: 11,
                                  fontWeight: 700
                                }}
                              >
                                {row.executive[0]}
                              </Avatar>
                              <Typography sx={{ color: tableText, fontSize: 13 }}>{row.executive}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${tokens.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                              <Typography sx={{ color: tableText, fontSize: 13 }}>{row.policeStatus}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${tokens.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              {row.ambulanceIcon === 'check' ? (
                                <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                              ) : (
                                <WarningIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                              )}
                              <Typography sx={{ color: tableText, fontSize: 13 }}>{row.ambulanceStatus}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${tokens.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  height: 8,
                                  width: 100,
                                  bgcolor: slaTrackBg,
                                  borderRadius: 99,
                                  overflow: 'hidden',
                                  display: 'flex'
                                }}
                              >
                                {slaColors.map((color, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      width: `${100 / slaColors.length}%`,
                                      height: '100%',
                                      bgcolor: i < (slaPct / 100) * slaColors.length ? color : 'transparent'
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SOSMonitoringDashboard;