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

import { PageWrapper } from './SuperAdminCommon';

const COLORS = {
  border: alpha('#0f172a', 0.08),
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  chipBg: alpha('#0f172a', 0.04),

  ambulance: '#3b82f6',
  police: '#f97316',
  offline: '#64748b',
  notReporting: '#94a3b8',
  emergency: '#ef4444',
  enRoute: '#a855f7',
  available: '#22c55e'
};

const FILTERS = {
  state: ['All', 'Assam'],
  district: ['All', 'Kamrup Metro', 'Kamrup Rural', 'Nagaon', 'Dibrugarh'],
  hospital: ['All', 'GMC', 'Apollo', 'Red Cross'],
  vehicleType: ['All', 'Ambulance', 'Police'],
  ambulanceType: ['All', 'BLS', 'ALS'],
  status: ['All', 'Available', 'On Emergency', 'En-Route Hospital', 'Offline', 'Not Reporting']
};

const metricTileColors = {
  total: { from: '#0ea5e9', to: '#2563eb' },
  loggedIn: { from: '#0ea5e9', to: '#2563eb' },
  online: { from: '#22c55e', to: '#16a34a' },
  available: { from: '#22c55e', to: '#16a34a' },
  onEmergency: { from: '#ef4444', to: '#dc2626' },
  enRoute: { from: '#a855f7', to: '#7c3aed' },
  offline: { from: '#334155', to: '#64748b' },
  notReporting: { from: '#64748b', to: '#94a3b8' }
};

const DISTRICTS = [
  { name: 'Kamrup Metro', center: [91.7362, 26.1445] },
  { name: 'Nagaon', center: [92.6850, 26.3569] },
  { name: 'Dibrugarh', center: [94.9110, 27.4728] },
  { name: 'Kamrup Rural', center: [91.3700, 26.0500] },
  { name: 'Jorhat', center: [94.2037, 26.7465] },
  { name: 'Silchar', center: [92.7789, 24.8333] }
];

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
      {helper ? <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.65rem' } }}>{helper}</Typography> : null}
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

const buildDummyErssVehicles = () => {
  const vehicles = [];
  const total = 420;

  const pickDistrict = (idx) => DISTRICTS[idx % DISTRICTS.length];
  const pickType = (idx) => (idx % 3 === 0 ? 'police' : 'ambulance');
  const pickStatus = (idx) => {
    const mod = idx % 16;
    if (mod === 0) return 'on_emergency';
    if (mod === 1) return 'en_route_hospital';
    if (mod === 2) return 'offline';
    if (mod === 3) return 'not_reporting';
    if (mod === 4) return 'available';
    return 'online';
  };

  for (let i = 0; i < total; i += 1) {
    const district = pickDistrict(i);
    const type = pickType(i);

    const spreadLat = (Math.sin(i * 0.83) + Math.cos(i * 0.17)) * 0.03;
    const spreadLon = (Math.cos(i * 0.58) + Math.sin(i * 0.29)) * 0.05;

    vehicles.push({
      id: `${type === 'ambulance' ? 'AMB' : 'POL'}-${String(10000 + i).slice(-5)}`,
      regNo: `AS-${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).slice(-4)}`,
      type,
      district: district.name,
      latitude: district.center[1] + spreadLat,
      longitude: district.center[0] + spreadLon,
      status: pickStatus(i)
    });
  }

  return vehicles;
};

const ErssVehicleMap = ({ vehicles, selectedDistrict, selectedType, onSelectCluster, onBack, mode }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const districtLayerRef = useRef(null);
  const vehicleLayerRef = useRef(null);
  const clickHandlerRef = useRef(null);

  const districtStylesRef = useRef({});
  const vehicleStylesRef = useRef({});

  const districtSummary = useMemo(() => {
    const base = new Map();
    DISTRICTS.forEach((d) => {
      base.set(d.name, {
        name: d.name,
        center: d.center,
        ambulanceCount: 0,
        policeCount: 0
      });
    });

    (Array.isArray(vehicles) ? vehicles : []).forEach((v) => {
      const entry = base.get(v.district);
      if (!entry) return;
      if (v.type === 'ambulance') entry.ambulanceCount += 1;
      if (v.type === 'police') entry.policeCount += 1;
    });

    return Array.from(base.values()).filter((d) => d.ambulanceCount + d.policeCount > 0);
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
        zoom: 7
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
      const clusterType = clickedFeature.get('clusterType');
      if (!districtName || !clusterType) return;

      if (!selectedDistrict) {
        onSelectCluster({ district: districtName, type: clusterType });
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
  }, [onSelectCluster, selectedDistrict]);

  useEffect(() => {
    const districtLayer = districtLayerRef.current;
    const vehicleLayer = vehicleLayerRef.current;
    const map = mapRef.current;
    if (!districtLayer || !vehicleLayer || !map) return;

    const districtSource = districtLayer.getSource();
    const vehicleSource = vehicleLayer.getSource();
    districtSource.clear();
    vehicleSource.clear();

    const makeClusterStyle = ({ color, count }) => {
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
            stroke: new Stroke({ color: alpha('#0f172a', 0.45), width: 4 }),
            font: '800 13px Inter, sans-serif'
          })
        });
      }
      return districtStylesRef.current[key];
    };

    const makeVehicleStyle = ({ label, color }) => {
      const key = `${label}-${color}`;
      if (!vehicleStylesRef.current[key]) {
        vehicleStylesRef.current[key] = new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color }),
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
        const baseCoords = d.center;

        if (d.ambulanceCount > 0) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([baseCoords[0] - 0.12, baseCoords[1]])),
            districtName: d.name,
            clusterType: 'ambulance'
          });
          feature.setStyle(makeClusterStyle({ color: COLORS.ambulance, count: d.ambulanceCount }));
          districtSource.addFeature(feature);
        }

        if (d.policeCount > 0) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([baseCoords[0] + 0.12, baseCoords[1]])),
            districtName: d.name,
            clusterType: 'police'
          });
          feature.setStyle(makeClusterStyle({ color: COLORS.police, count: d.policeCount }));
          districtSource.addFeature(feature);
        }
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
    const filteredByType = selectedType ? districtVehicles.filter((v) => v.type === selectedType) : districtVehicles;

    filteredByType.forEach((v) => {
      const lat = Number(v.latitude);
      const lon = Number(v.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;

      const baseTypeColor = v.type === 'ambulance' ? COLORS.ambulance : COLORS.police;
      const statusColor =
        v.status === 'offline'
          ? COLORS.offline
          : v.status === 'not_reporting'
            ? COLORS.notReporting
            : v.status === 'on_emergency'
              ? COLORS.emergency
              : v.status === 'en_route_hospital'
                ? COLORS.enRoute
                : v.status === 'available'
                  ? COLORS.available
                  : baseTypeColor;

      const feature = new Feature({
        geometry: new Point(fromLonLat([lon, lat]))
      });
      feature.setStyle(makeVehicleStyle({ label: v.regNo, color: alpha(statusColor, 0.92) }));
      vehicleSource.addFeature(feature);
    });

    districtLayer.setVisible(false);
    vehicleLayer.setVisible(true);
  }, [districtSummary, selectedDistrict, selectedType, vehicles]);

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
          boxShadow: `0 12px 30px -20px ${alpha(COLORS.ambulance, 0.55)}`,
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

const ERSSVehiclesDashboard = () => {
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

  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    hospital: 'All',
    vehicleType: 'All',
    ambulanceType: 'All',
    status: 'All'
  });

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const vehicles = useMemo(() => buildDummyErssVehicles(), []);

  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    if (filters.district && filters.district !== 'All') {
      result = result.filter((v) => v.district === filters.district);
    }

    if (filters.vehicleType && filters.vehicleType !== 'All') {
      const desiredType = filters.vehicleType === 'Police' ? 'police' : 'ambulance';
      result = result.filter((v) => v.type === desiredType);
    }

    if (filters.status && filters.status !== 'All') {
      const mapStatus = {
        Available: 'available',
        'On Emergency': 'on_emergency',
        'En-Route Hospital': 'en_route_hospital',
        Offline: 'offline',
        'Not Reporting': 'not_reporting'
      };
      const desired = mapStatus[filters.status];
      if (desired) result = result.filter((v) => v.status === desired);
    }

    return result;
  }, [vehicles, filters.district, filters.vehicleType, filters.status]);

  useEffect(() => {
    if (filters.district && filters.district !== 'All') {
      setSelectedDistrict(filters.district);
      return;
    }
    setSelectedDistrict(null);
    setSelectedType(null);
  }, [filters.district]);

  useEffect(() => {
    if (selectedType) {
      setFilters((prev) => ({ ...prev, vehicleType: selectedType === 'police' ? 'Police' : 'Ambulance' }));
    }
  }, [selectedType]);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleReset = () => {
    setFilters({
      state: 'All',
      district: 'All',
      hospital: 'All',
      vehicleType: 'All',
      ambulanceType: 'All',
      status: 'All'
    });
  };

  const handleSelectCluster = useCallback(({ district, type }) => {
    setFilters((prev) => ({ ...prev, district }));
    setSelectedDistrict(district);
    setSelectedType(type);
  }, []);

  const handleBackToDistricts = useCallback(() => {
    setFilters((prev) => ({ ...prev, district: 'All' }));
    setSelectedDistrict(null);
    setSelectedType(null);
  }, []);

  const kpis = useMemo(() => {
    const selectedLabel =
      filters.vehicleType === 'Police' ? 'Police Vehicles' : filters.vehicleType === 'Ambulance' ? 'Ambulances' : 'Vehicles';
    const selectedVehicles = filteredVehicles;

    const totals = {
      total: selectedVehicles.length,
      loggedIn: selectedVehicles.length,
      online: 0,
      available: 0,
      onEmergency: 0,
      enRoute: 0,
      offline: 0,
      notReporting: 0
    };

    selectedVehicles.forEach((v) => {
      if (v.status === 'online') totals.online += 1;
      if (v.status === 'available') totals.available += 1;
      if (v.status === 'on_emergency') totals.onEmergency += 1;
      if (v.status === 'en_route_hospital') totals.enRoute += 1;
      if (v.status === 'offline') totals.offline += 1;
      if (v.status === 'not_reporting') {
        totals.notReporting += 1;
        totals.offline += 1;
      }
    });

    return [
      { key: 'total', label: `Total ${selectedLabel}`, value: totals.total, helper: null },
      { key: 'loggedIn', label: 'Logged In', value: totals.loggedIn, helper: null },
      { key: 'online', label: 'Online', value: totals.online, helper: null },
      { key: 'available', label: 'Available', value: totals.available, helper: null },
      { key: 'onEmergency', label: 'On Emergency', value: totals.onEmergency, helper: null },
      { key: 'enRoute', label: 'En-Route Hospital', value: totals.enRoute, helper: null },
      { key: 'offline', label: 'Offline', value: totals.offline, helper: null },
      { key: 'notReporting', label: 'Not Reporting', value: totals.notReporting, helper: ' (> 90 min)' }
    ];
  }, [filteredVehicles, filters.vehicleType]);

  return (
    <PageWrapper
      title="ERSS Vehicles Monitoring"
      // description="Ambulance & Police live monitoring across districts (dummy data)."
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
              <Grid key={key} item xs={12} sm={6} md={3} lg={2.4}>
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
            <Grid item xs={12} sm={6} md={3} lg={1.2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleReset}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: COLORS.ambulance,
                  '&:hover': { bgcolor: '#2563eb' }
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 0.75 }, flexWrap: 'wrap', flexShrink: 0 }}>
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
            <LegendChip label="Ambulance Cluster" color={COLORS.ambulance} tokens={tokens} />
            <LegendChip label="Police Cluster" color={COLORS.police} tokens={tokens} />
            <LegendChip label="Online" color={COLORS.available} tokens={tokens} />
            <LegendChip label="Offline" color={COLORS.offline} tokens={tokens} />
            <LegendChip label="Not Reporting" color={COLORS.notReporting} tokens={tokens} />
            <LegendChip label="On Emergency" color={COLORS.emergency} tokens={tokens} />
            <LegendChip label="En-Route" color={COLORS.enRoute} tokens={tokens} />
            <LegendChip label="Available" color={COLORS.available} tokens={tokens} />
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
                  borderColor: alpha(COLORS.ambulance, 0.35),
                  color: mode === 'dark' ? '#93c5fd' : '#2563eb',
                  '&:hover': { borderColor: COLORS.ambulance, bgcolor: alpha(COLORS.ambulance, 0.06) }
                }}
              >
                Back to Districts
              </Button>
            ) : null}
            <Typography sx={{ fontWeight: 800, color: tokens.muted, fontSize: '0.9rem' }}>
              {selectedDistrict ? `${selectedDistrict}${selectedType ? ` (${selectedType})` : ''}` : 'District Clusters'}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: { xs: 420, md: 0 }, display: 'flex', flexDirection: 'column' }}>
          <ErssVehicleMap
            vehicles={filteredVehicles}
            selectedDistrict={selectedDistrict}
            selectedType={selectedType}
            onSelectCluster={handleSelectCluster}
            onBack={handleBackToDistricts}
            mode={mode}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default ERSSVehiclesDashboard;
