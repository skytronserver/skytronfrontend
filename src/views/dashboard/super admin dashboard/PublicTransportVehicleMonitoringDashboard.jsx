import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';

import {
  PageWrapper,
  useVehicleData
} from './SuperAdminCommon';

const COLORS = {
  surface: '#f8fafc',
  border: alpha('#0f172a', 0.08),
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  chipBg: alpha('#0f172a', 0.04),

  online: '#22c55e',
  offline: '#64748b',
  battery: '#f59e0b',
  gpsIssue: '#8b5cf6',
  alerts: '#ef4444',
  localAlerts: '#06b6d4'
};

const FILTERS = {
  state: ['All', 'Assam'],
  district: ['All', 'Kamrup Metro', 'Kamrup Rural', 'Nagaon'],
  vehicleType: ['All', 'Bus', 'Taxi', 'Truck'],
  operator: ['All', 'ASTC', 'Private'],
  reserved: ['All', 'Yes', 'No'],
  stateVids: ['All', 'Enabled', 'Disabled'],
  fastStatus: ['All', 'Active', 'Inactive']
};

const metricTileColors = {
  total: { from: '#0ea5e9', to: '#2563eb' },
  offline: { from: '#334155', to: '#64748b' },
  online: { from: '#22c55e', to: '#16a34a' },
  alerts: { from: '#ef4444', to: '#dc2626' },
  alertsActive: { from: '#f97316', to: '#ea580c' },
  gps: { from: '#8b5cf6', to: '#7c3aed' },
  powerCut: { from: '#0f766e', to: '#14b8a6' },
  notReporting: { from: '#64748b', to: '#94a3b8' }
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  try {
    return Number(value).toLocaleString('en-IN');
  } catch {
    return String(value);
  }
};

const MetricTile = ({ label, value, colorKey, helper }) => {
  const colors = metricTileColors[colorKey] || metricTileColors.total;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: 140, md: 130 },
        borderRadius: 2,
        p: { xs: 1.5, md: 1.25 },
        color: '#fff',
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
        boxShadow: `0 8px 20px -12px ${alpha(colors.to, 0.75)}`,
        border: `1px solid ${alpha('#ffffff', 0.18)}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 0.5
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.7rem' }, letterSpacing: '0.02em' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.35rem' }, lineHeight: 1.05 }}>{formatNumber(value)}</Typography>
      {helper ? (
        <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.65rem' } }}>{helper}</Typography>
      ) : null}
    </Box>
  );
};

const LegendChip = ({ label, color, tokens }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      px: 1.25,
      py: 0.75,
      borderRadius: 2,
      bgcolor: tokens?.chipBg || COLORS.chipBg,
      border: `1px solid ${tokens?.border || COLORS.border}`
    }}
  >
    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: tokens?.muted || COLORS.textSecondary }}>{label}</Typography>
  </Box>
);

const DISTRICTS = [
  { name: 'Kamrup Metro', center: [91.7362, 26.1445], color: '#22c55e' },
  { name: 'Nagaon', center: [92.6850, 26.3569], color: '#38bdf8' },
  { name: 'Dibrugarh', center: [94.9110, 27.4728], color: '#a855f7' },
  { name: 'Kamrup Rural', center: [91.3700, 26.0500], color: '#f59e0b' },
  { name: 'Jorhat', center: [94.2037, 26.7465], color: '#ef4444' },
  { name: 'Silchar', center: [92.7789, 24.8333], color: '#64748b' }
];

const buildDummyVehicles = (seed = []) => {
  const vehicles = [];
  const total = 320;

  const pickDistrict = (idx) => DISTRICTS[idx % DISTRICTS.length];
  const pickStatus = (idx) => {
    const mod = idx % 14;
    if (mod === 0) return 'ea_alert';
    if (mod === 1) return 'normal_alert';
    if (mod === 2) return 'gps_issue';
    if (mod === 3) return 'battery_low';
    if (mod === 4) return 'power_cut';
    if (mod === 5) return 'not_reporting';
    if (mod === 6) return 'offline';
    return 'online';
  };

  for (let i = 0; i < total; i += 1) {
    const district = pickDistrict(i);

    const spreadLat = (Math.sin(i * 0.85) + Math.cos(i * 0.23)) * 0.035;
    const spreadLon = (Math.cos(i * 0.62) + Math.sin(i * 0.31)) * 0.055;

    vehicles.push({
      regNo: `AS01AB${String(1000 + i).slice(-4)}`,
      district: district.name,
      latitude: district.center[1] + spreadLat,
      longitude: district.center[0] + spreadLon,
      status: pickStatus(i)
    });
  }

  if (Array.isArray(seed) && seed.length) {
    seed.slice(0, 40).forEach((entry, idx) => {
      const district = pickDistrict(idx + 3);
      const lat = Number(entry.latitude);
      const lon = Number(entry.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;

      vehicles.push({
        regNo: entry.vehicle_reg_no || entry.regNo || `SKY${String(9000 + idx).slice(-4)}`,
        district: entry.district || district.name,
        latitude: lat,
        longitude: lon,
        status: 'online'
      });
    });
  }

  return vehicles;
};

const DistrictVehicleMap = ({ vehicles, selectedDistrict, onSelectDistrict, mode }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const districtLayerRef = useRef(null);
  const vehicleLayerRef = useRef(null);
  const clickHandlerRef = useRef(null);

  const districtStylesRef = useRef({});
  const vehicleStylesRef = useRef({});

  const districtSummary = useMemo(() => {
    const summary = new Map();
    DISTRICTS.forEach((d) => {
      summary.set(d.name, {
        name: d.name,
        center: d.center,
        color: d.color,
        count: 0
      });
    });

    (Array.isArray(vehicles) ? vehicles : []).forEach((v) => {
      const entry = summary.get(v.district);
      if (entry) entry.count += 1;
    });

    return Array.from(summary.values()).filter((entry) => entry.count > 0);
  }, [vehicles]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const baseLayer = new TileLayer({ source: new OSM() });

    const districtLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 40
    });

    const vehicleLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 60
    });

    const map = new OLMap({
      target: containerRef.current,
      layers: [baseLayer, districtLayer, vehicleLayer],
      view: new View({
        center: fromLonLat([91.7362, 26.1445]),
        zoom: 11
      })
    });

    mapRef.current = map;
    districtLayerRef.current = districtLayer;
    vehicleLayerRef.current = vehicleLayer;

    const resizeObserver = new ResizeObserver(() => {
      map.updateSize();
    });
    resizeObserver.observe(containerRef.current);

    const handleWindowResize = () => {
      if (!mapRef.current) return;
      mapRef.current.updateSize();
      setTimeout(() => {
        if (mapRef.current) mapRef.current.updateSize();
      }, 0);
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    const handleClick = (evt) => {
      if (!mapRef.current) return;

      const clickedFeature = mapRef.current.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (!clickedFeature) return;

      const districtName = clickedFeature.get('districtName');
      if (!districtName) return;

      if (!selectedDistrict) {
        onSelectDistrict(districtName);
      }
    };

    clickHandlerRef.current = handleClick;
    map.on('singleclick', handleClick);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      if (clickHandlerRef.current) {
        map.un('singleclick', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      map.setTarget(null);
      mapRef.current = null;
      districtLayerRef.current = null;
      vehicleLayerRef.current = null;
    };
  }, [onSelectDistrict, selectedDistrict]);

  useEffect(() => {
    const districtLayer = districtLayerRef.current;
    const vehicleLayer = vehicleLayerRef.current;
    const map = mapRef.current;
    if (!districtLayer || !vehicleLayer || !map) return;

    const districtSource = districtLayer.getSource();
    const vehicleSource = vehicleLayer.getSource();
    districtSource.clear();
    vehicleSource.clear();

    const makeDistrictStyle = (color, count) => {
      const key = `${color}-${count}`;
      if (!districtStylesRef.current[key]) {
        districtStylesRef.current[key] = new Style({
          image: new CircleStyle({
            radius: 18,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#ffffff', width: 3 })
          }),
          text: new Text({
            text: String(count),
            fill: new Fill({ color: '#ffffff' }),
            stroke: new Stroke({ color: alpha('#0f172a', 0.4), width: 4 }),
            font: '800 13px Inter, sans-serif'
          })
        });
      }
      return districtStylesRef.current[key];
    };

    const makeVehicleStyle = (label, statusColor) => {
      const key = `veh-${label}-${statusColor}`;
      if (!vehicleStylesRef.current[key]) {
        vehicleStylesRef.current[key] = new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: statusColor }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: label,
            offsetY: -18,
            fill: new Fill({ color: mode === 'dark' ? '#e5e7eb' : '#0f172a' }),
            stroke: new Stroke({ color: mode === 'dark' ? alpha('#000000', 0.75) : alpha('#ffffff', 0.95), width: 5 }),
            font: '700 11px Inter, sans-serif'
          })
        });
      }
      return vehicleStylesRef.current[key];
    };

    if (!selectedDistrict) {
      districtSummary.forEach((d) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat(d.center)),
          districtName: d.name
        });
        feature.setStyle(makeDistrictStyle(d.color, d.count));
        districtSource.addFeature(feature);
      });

      districtLayer.setVisible(true);
      vehicleLayer.setVisible(false);
      map.getView().animate({ center: fromLonLat([91.7362, 26.1445]), zoom: 7, duration: 450 });
      return;
    }

    const district = DISTRICTS.find((d) => d.name === selectedDistrict);
    if (district) {
      map.getView().animate({ center: fromLonLat(district.center), zoom: 10, duration: 450 });
    }

    const districtVehicles = (Array.isArray(vehicles) ? vehicles : []).filter((v) => v.district === selectedDistrict);
    districtVehicles.forEach((v) => {
      const lat = Number(v.latitude);
      const lon = Number(v.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;

      const statusColor =
        v.status === 'offline' || v.status === 'not_reporting'
          ? alpha(COLORS.offline, 0.92)
          : v.status === 'battery_low'
            ? alpha(COLORS.battery, 0.92)
            : v.status === 'gps_issue'
              ? alpha(COLORS.gpsIssue, 0.92)
              : v.status === 'ea_alert'
                ? alpha(COLORS.alerts, 0.92)
                : v.status === 'normal_alert'
                  ? alpha(COLORS.localAlerts, 0.92)
                  : v.status === 'power_cut'
                    ? alpha('#14b8a6', 0.92)
                    : alpha(COLORS.online, 0.92);

      const feature = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        districtName: selectedDistrict
      });
      feature.setStyle(makeVehicleStyle(v.regNo, statusColor));
      vehicleSource.addFeature(feature);
    });

    districtLayer.setVisible(false);
    vehicleLayer.setVisible(true);
  }, [districtSummary, selectedDistrict, vehicles, mode]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 2.5,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
          bgcolor: '#fff',
          boxShadow: `0 12px 30px -20px ${alpha('#0ea5e9', 0.55)}`,
          '& .ol-viewport': { borderRadius: 2.5 },
          '& .ol-attribution': { display: 'none' }
        }}
      />
      <img
        src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '10px',
          width: '180px',
          zIndex: 1000,
          pointerEvents: 'none',
          opacity: 0.8
        }}
        alt="Skytron Logo"
      />
    </Box>
  );
};

const PublicTransportVehicleMonitoringDashboard = () => {
  // Using existing live data hook to seed dummy points (fallback to generated)
  const { vehicleData } = useVehicleData();

  const [mode, setMode] = useState('light');

  const tokens = useMemo(() => {
    if (mode === 'dark') {
      return {
        pageBg: '#1a1f2e',
        cardBg: '#0f1419',
        border: alpha('#475569', 0.3),
        text: '#e5e7eb',
        muted: alpha('#e5e7eb', 0.7),
        chipBg: alpha('#ffffff', 0.06)
      };
    }

    return {
      pageBg: '#f8fafc',
      cardBg: '#ffffff',
      border: alpha('#0f172a', 0.08),
      text: '#0f172a',
      muted: '#475569',
      chipBg: COLORS.chipBg
    };
  }, [mode]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    vehicleType: 'All',
    operator: 'All',
    reserved: 'All',
    stateVids: 'All',
    fastStatus: 'All'
  });

  const vehicles = useMemo(() => buildDummyVehicles(vehicleData), [vehicleData]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    if (filters.district && filters.district !== 'All') {
      result = result.filter((v) => v.district === filters.district);
    }
    return result;
  }, [vehicles, filters.district]);

  useEffect(() => {
    if (filters.district && filters.district !== 'All') {
      setSelectedDistrict(filters.district);
      return;
    }
    setSelectedDistrict(null);
  }, [filters.district]);

  const handleSelectDistrict = useCallback(
    (districtName) => {
      setFilters((prev) => ({ ...prev, district: districtName }));
      setSelectedDistrict(districtName);
    },
    []
  );

  const handleBackToDistricts = useCallback(() => {
    setFilters((prev) => ({ ...prev, district: 'All' }));
    setSelectedDistrict(null);
  }, []);

  const kpis = useMemo(() => {
    const totals = {
      total: filteredVehicles.length,
      online: 0,
      offline: 0,
      eaAlerts: 0,
      normalAlerts: 0,
      gpsIssue: 0,
      powerCut: 0,
      notReporting: 0,
      batteryLow: 0
    };

    filteredVehicles.forEach((v) => {
      if (v.status === 'online') totals.online += 1;
      if (v.status === 'offline') totals.offline += 1;
      if (v.status === 'not_reporting') {
        totals.notReporting += 1;
        totals.offline += 1;
      }
      if (v.status === 'ea_alert') totals.eaAlerts += 1;
      if (v.status === 'normal_alert') totals.normalAlerts += 1;
      if (v.status === 'gps_issue') totals.gpsIssue += 1;
      if (v.status === 'power_cut') totals.powerCut += 1;
      if (v.status === 'battery_low') totals.batteryLow += 1;
    });

    const alertsTotal = totals.eaAlerts + totals.normalAlerts;

    return [
      { key: 'total', label: 'Total Devices', value: totals.total, helper: null },
      { key: 'offline', label: 'Offline', value: totals.offline, helper: null },
      { key: 'online', label: 'Online', value: totals.online, helper: null },
      { key: 'alerts', label: 'EA Alerts', value: totals.eaAlerts, helper: null },
      { key: 'alertsActive', label: 'Normal Alerts', value: totals.normalAlerts, helper: null },
      { key: 'gps', label: 'GPS Issue', value: totals.gpsIssue, helper: null },
      { key: 'powerCut', label: 'Power Cut Detected', value: totals.powerCut, helper: null },
      { key: 'notReporting', label: 'Not Reporting', value: totals.notReporting, helper: '(> 90 min)' }
    ];
  }, [filteredVehicles]);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <PageWrapper
      title="Skytron – Public Transport Vehicle Monitoring"
      description="All vehicles/devices on board Skytron platform (dummy data)."
      sx={{
        bgcolor: tokens.pageBg,
        backgroundImage: 'none',
        minHeight: '100vh',
        height: { xs: 'auto', md: '100%' },
        maxHeight: { xs: 'none', md: '100%' },
        overflow: { xs: 'auto', md: 'hidden' }
      }}
      titleSx={{ color: tokens.text, fontSize: { xs: '1.5rem', md: '1.75rem' }, mb: 0.5 }}
      descriptionSx={{ color: tokens.muted, fontSize: { xs: '0.85rem', md: '0.875rem' } }}
      headerSx={{ mb: { xs: 2, md: 1.5 } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 1 }, height: { xs: 'auto', md: '100%' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 0, md: -0.5 } }}>
          <IconButton
            size="small"
            onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            sx={{
              color: tokens.text,
              bgcolor: alpha(tokens.text, mode === 'dark' ? 0.08 : 0.06),
              border: `1px solid ${alpha(tokens.text, 0.12)}`,
              borderRadius: 1.5,
              '&:hover': { bgcolor: alpha(tokens.text, mode === 'dark' ? 0.12 : 0.08) }
            }}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </IconButton>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 1.25 },
            borderRadius: 2,
            border: `1px solid ${tokens.border}`,
            bgcolor: tokens.cardBg,
            flexShrink: 0
          }}
        >
          <Grid container spacing={{ xs: 2, md: 1.5 }} alignItems="center">
            {Object.entries(FILTERS).map(([key, options]) => (
              <Grid key={key} item xs={12} sm={6} md={3} lg={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{key.replace(/([A-Z])/g, ' $1')}</InputLabel>
                  <Select value={filters[key]} label={key.replace(/([A-Z])/g, ' $1')} onChange={handleFilterChange(key)}>
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  height: 40,
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: '#0ea5e9',
                  '&:hover': { bgcolor: '#0284c7' }
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, md: 0.75 },
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          {kpis.map((tile) => (
            <MetricTile key={tile.key} label={tile.label} value={tile.value} helper={tile.helper} colorKey={tile.key} />
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 0.875 },
            borderRadius: 2,
            border: `1px solid ${tokens.border}`,
            bgcolor: tokens.cardBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2, md: 1 },
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <LegendChip label="Local Alerts" color={COLORS.localAlerts} tokens={tokens} />
            <LegendChip label="Online" color={COLORS.online} tokens={tokens} />
            <LegendChip label="Offline" color={COLORS.offline} tokens={tokens} />
            <LegendChip label="Normal Alert" color={COLORS.normalAlert} tokens={tokens} />
            <LegendChip label="EA Alert" color={COLORS.eaAlert} tokens={tokens} />
            <LegendChip label="Not Reporting" color={COLORS.notReporting} tokens={tokens} />
            <LegendChip label="GPS Issue" color={COLORS.gpsIssue} tokens={tokens} />
            <LegendChip label="Battery Low" color={COLORS.batteryLow} tokens={tokens} />
            <LegendChip label="Power Cut" color={COLORS.powerCut} tokens={tokens} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {selectedDistrict ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleBackToDistricts}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 800,
                  borderColor: alpha('#0ea5e9', 0.35),
                  color: '#0284c7',
                  '&:hover': { borderColor: '#0ea5e9', bgcolor: alpha('#0ea5e9', 0.06) }
                }}
              >
                Back to Districts
              </Button>
            ) : null}
            <Typography sx={{ fontWeight: 800, color: tokens.muted, fontSize: '0.9rem' }}>
              {selectedDistrict ? selectedDistrict : 'District Clusters'}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: { xs: 420, md: 0 }, display: 'flex', flexDirection: 'column' }}>
          <DistrictVehicleMap
            vehicles={filteredVehicles}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleSelectDistrict}
            mode={mode}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default PublicTransportVehicleMonitoringDashboard;
