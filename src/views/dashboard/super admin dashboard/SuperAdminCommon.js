import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Grid, Stack, Typography, alpha } from '@mui/material';
import { keyframes } from '@mui/system';
import MainCard from 'ui-component/cards/MainCard';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

// OpenLayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';
import { createEmpty, extend as extendExtent, isEmpty as isEmptyExtent } from 'ol/extent';

// Services
import HomePageService from 'services/HomePage';
import UserServices from 'services/UserServices';

// Assets
import greenBusIcon from 'assets/images/green/bus.png';
import redBusIcon from 'assets/images/red/bus.png';
import blueBusIcon from 'assets/images/blue/bus.png';
import orangeBusIcon from 'assets/images/orange/bus.png';
import greyBusIcon from 'assets/images/grey/bus.png';

const gradientPulse = keyframes`
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.75;
  }
  50% {
    transform: translate3d(8px, -8px, 0) scale(1.03);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.75;
  }
`;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const floatY = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
`;

const VEHICLE_FAKE_LOADING_DELAY = 650;
const SOS_FAKE_LOADING_DELAY = 30000;
const SOS_REFRESH_INTERVAL = 90000;

const DashboardMap = ({
  data,
  getStyle,
  center = [91.7362, 26.1445],
  zoom = 10,
  autoFit = false,
  autoFitFilter,
  autoFitPadding = [60, 60, 60, 60],
  autoFitMaxZoom = 15
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return undefined;

    const createBhuvanWms = () =>
      new TileLayer({
        source: new TileWMS({
          url:
            process.env.REACT_APP_BHUVAN_URL ||
            'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
          params: {
            LAYERS: 'basemap%3Aadmin_group',
            TILED: true,
            VERSION: '1.1.1',
            FORMAT: 'image/png',
            TRANSPARENT: 'true',
            SRS: 'EPSG:4326'
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326'
        }),
        opacity: 1
      });

    const vectorSource = new VectorSource();
    const vector = new VectorLayer({
      source: vectorSource,
      zIndex: 200
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), createBhuvanWms(), vector],
      view: new View({
        center: fromLonLat(center),
        zoom
      })
    });

    setMap(initialMap);
    setVectorLayer(vector);

    const resizeObserver = new ResizeObserver(() => {
      initialMap.updateSize();
    });
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      initialMap.setTarget(null);
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map || !vectorLayer || !data) return;

    const source = vectorLayer.getSource();
    source.clear();

    const features = data
      .map((item) => {
        const lat = Number(item.latitude);
        const lon = Number(item.longitude);

        if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

        const coords = fromLonLat([lon, lat]);
        const feature = new Feature({
          geometry: new Point(coords),
          data: item
        });

        if (getStyle) {
          feature.setStyle(getStyle(item));
        }
        return feature;
      })
      .filter(Boolean);

    source.addFeatures(features);

    if (!autoFit) return;

    const extent = createEmpty();
    let matched = 0;
    for (const item of data) {
      if (autoFitFilter && !autoFitFilter(item)) continue;

      const lat = Number(item.latitude);
      const lon = Number(item.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

      extendExtent(extent, new Point(fromLonLat([lon, lat])).getExtent());
      matched += 1;
    }

    if (!matched || isEmptyExtent(extent)) return;

    map.getView().fit(extent, {
      padding: autoFitPadding,
      maxZoom: autoFitMaxZoom,
      duration: 450
    });
  }, [map, vectorLayer, data, getStyle, autoFit, autoFitFilter, autoFitPadding, autoFitMaxZoom]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        '& .ol-viewport': { borderRadius: '0 0 12px 12px' }
      }}
    />
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          p: 2,
          borderRadius: 3,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>
          {label || payload[0].name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
          {`${payload[0].value} Units`}
        </Typography>
      </Box>
    );
  }
  return null;
};

const StatPieChart = ({ data, height = 240 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        width="90%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={4}
        dataKey="value"
        stroke="none"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <RechartsTooltip content={<CustomTooltip />} />
      <Legend
        verticalAlign="bottom"
        align="center"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: '10px', fontFamily: 'Inter, sans-serif' }}
      />
    </PieChart>
  </ResponsiveContainer>
);

const StatBarChart = ({ data, height = 240 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
      <XAxis
        dataKey="name"
        tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
        axisLine={false}
        tickLine={false}
        interval={0}
        dy={10}
      />
      <YAxis
        tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
        axisLine={false}
        tickLine={false}
      />
      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const MonthlyTrendsChart = ({ data, height = 320 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
        dy={10}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
      />
      <RechartsTooltip
        content={<CustomTooltip />}
        cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
      />
      <Legend
        verticalAlign="top"
        align="right"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: '12px', color: '#475569', paddingBottom: '20px', fontFamily: 'Inter, sans-serif' }}
      />
      <Bar dataKey="total" name="Total Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
      <Bar dataKey="genuine" name="Genuine" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={16} />
      <Bar dataKey="fake" name="Fake" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
    </BarChart>
  </ResponsiveContainer>
);

const MonthlyPerformanceChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="month"
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
        dy={10}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
      />
      <RechartsTooltip
        content={<CustomTooltip />}
        cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }}
      />
      <Legend
        verticalAlign="top"
        align="right"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: '12px', color: '#475569', paddingBottom: '20px', fontFamily: 'Inter, sans-serif' }}
      />
      <Line
        type="monotone"
        dataKey="police_avg"
        name="Police Avg (s)"
        stroke="#3b82f6"
        strokeWidth={3}
        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 6, strokeWidth: 0 }}
      />
      <Line
        type="monotone"
        dataKey="ambulance_avg"
        name="Ambulance Avg (s)"
        stroke="#f59e0b"
        strokeWidth={3}
        dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 6, strokeWidth: 0 }}
      />
      <Line
        type="monotone"
        dataKey="executive_avg"
        name="Executive Avg (s)"
        stroke="#8b5cf6"
        strokeWidth={3}
        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 6, strokeWidth: 0 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

const DashboardCard = ({ title, subtitle, children, accentColor, mapComponent, chartComponent, animationDelay = '0s', sx = {} }) => (
  <Box
    sx={{
      height: '100%',
      minHeight: { xs: 'auto', md: 560 },
      borderRadius: 4,
      bgcolor: '#ffffff',
      border: '1px solid',
      borderColor: alpha(accentColor, 0.12),
      boxShadow: `0 4px 20px 0 ${alpha(accentColor, 0.05)}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      opacity: 0,
      animation: `${fadeInUp} 0.6s ease forwards`,
      animationDelay,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 20px 40px -4px ${alpha(accentColor, 0.12)}`,
        borderColor: alpha(accentColor, 0.36)
      },
      ...sx
    }}
  >
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderBottom: `1px solid ${alpha(accentColor, 0.12)}`,
        background: `linear-gradient(135deg, ${alpha(accentColor, 0.16)} 0%, ${alpha(accentColor, 0.04)} 100%)`,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          bgcolor: accentColor
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: '-40% -10% auto auto',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accentColor, 0.24)} 0%, transparent 65%)`,
          filter: 'blur(0.5px)',
          animation: `${gradientPulse} 6s ease-in-out infinite`
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', mb: 0.5, color: '#1e293b', letterSpacing: '0.5px' }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
        {subtitle}
      </Typography>
    </Box>

    {mapComponent ? (
      <Box
        sx={{
          flex: 1,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
          gap: { xs: 2.5, md: 3 },
          p: { xs: 2.5, md: 3 },
          borderTop: `1px solid ${alpha(accentColor, 0.12)}`
        }}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 280, md: 420 },
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: `0 18px 40px -20px ${alpha(accentColor, 0.36)}`,
            '& .ol-viewport': { borderRadius: 3 },
            '& canvas': { display: 'block !important' },
            isolation: 'isolate',
            background: `radial-gradient(circle at 15% 20%, ${alpha(accentColor, 0.08)} 0%, transparent 55%), radial-gradient(circle at 85% 80%, ${alpha(accentColor, 0.04)} 0%, transparent 60%)`
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid ${alpha(accentColor, 0.25)}`,
              background: alpha('#ffffff', 0.28),
              backdropFilter: 'blur(6px)',
              animation: `${floatY} 5s ease-in-out infinite`,
              zIndex: 1
            }}
          />
          {mapComponent}
        </Box>

        <Stack spacing={{ xs: 2, md: 3 }} sx={{ height: '100%' }}>
          <Box sx={{ flexShrink: 0 }}>{children}</Box>
          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 240, md: 280 },
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center'
            }}
          >
            {chartComponent}
          </Box>
        </Stack>
      </Box>
    ) : (
      <Box sx={{ p: 3, flex: 1, minHeight: 0 }}>
        <Grid container spacing={3} sx={{ height: '100%', minHeight: 0 }}>
          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {children}
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              minHeight: 0
            }}
          >
            {chartComponent}
          </Grid>
        </Grid>
      </Box>
    )}
  </Box>
);

const MetricCard = ({ label, value, color }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 3,
      bgcolor: `linear-gradient(135deg, ${alpha(color, 0.14)} 0%, ${alpha('#ffffff', 0.9)} 70%)`,
      border: '1px solid',
      borderColor: alpha(color, 0.18),
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.35s ease',
      boxShadow: `0 3px 15px ${alpha(color, 0.12)}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 1.25,
      minHeight: 120,
      '&:hover': {
        transform: 'translateY(-4px) scale(1.01)',
        boxShadow: `0 16px 32px ${alpha(color, 0.2)}`,
        borderColor: alpha(color, 0.4),
        '& .sparkle': {
          transform: 'scale(1.3)',
          opacity: 0.9
        }
      }
    }}
  >
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color,
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em'
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        fontSize: { xs: '1.55rem', sm: '1.7rem' },
        color: '#0f172a',
        letterSpacing: '-0.4px',
        position: 'relative',
        zIndex: 1,
        lineHeight: 1.1
      }}
    >
      {value ?? '—'}
    </Typography>
    <Box
      sx={{
        position: 'absolute',
        right: -32,
        top: -32,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(color, 0.18)} 0%, transparent 70%)`,
        zIndex: 0,
        transition: 'all 0.35s ease'
      }}
    />
    <Box
      className="sparkle"
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 24,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: alpha(color, 0.35),
        filter: 'blur(1px)',
        transformOrigin: 'center',
        transition: 'all 0.35s ease',
        animation: `${floatY} 4.5s ease-in-out infinite`
      }}
    />
  </Box>
);

const useVehicleData = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const [vehicleStats, setVehicleStats] = useState({ total: 0, online: 0, emergency: 0, offline: 0 });
  const [loading, setLoading] = useState(false);
  const fakeDelayRef = useRef(null);

  const iconStyles = useMemo(
    () => ({
      green: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: greenBusIcon,
          scale: 0.2
        })
      }),
      red: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: redBusIcon,
          scale: 0.2
        })
      }),
      blue: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: blueBusIcon,
          scale: 0.2
        })
      }),
      yellow: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: orangeBusIcon,
          scale: 0.2
        })
      }),
      grey: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: greyBusIcon,
          scale: 0.2
        })
      })
    }),
    []
  );

  const calculateTimeDifference = useCallback((entryTime, currentTime) => {
    return Math.abs(currentTime - entryTime) / 60000;
  }, []);

  const getVehicleStyle = useCallback(
    (vehicle) => {
      const entryTime = new Date(vehicle.entry_time || Date.now());
      const currentTime = new Date();
      const timeDifference = calculateTimeDifference(entryTime, currentTime);
      const speed = Number(vehicle.speed);
      const ignition = String(vehicle.ignition_status);

      if (vehicle.packet_type === 'EA') return iconStyles.red;
      if (vehicle.packet_type !== 'NR') return iconStyles.yellow;

      if (ignition === '1') {
        return speed > 1 ? iconStyles.green : iconStyles.blue;
      }

      if (timeDifference > 5) return iconStyles.grey;

      return iconStyles.blue;
    },
    [calculateTimeDifference, iconStyles]
  );

  useEffect(() => {
    let mounted = true;

    const clearScheduledFinish = () => {
      if (fakeDelayRef.current) {
        clearTimeout(fakeDelayRef.current);
        fakeDelayRef.current = null;
      }
    };

    const scheduleLoadingComplete = () => {
      clearScheduledFinish();
      fakeDelayRef.current = setTimeout(() => {
        if (mounted) {
          setLoading(false);
        }
      }, VEHICLE_FAKE_LOADING_DELAY);
    };

    const fetchVehicleData = async () => {
      try {
        clearScheduledFinish();
        if (mounted) {
          setLoading(true);
        }

        // Fetch both vehicle tracking data and status metrics
        const http = HomePageService.getLiveTracking_data({}).then(res => res);
        const metricsHttp = UserServices.getVehicleStatusMetrics ?
          UserServices.getVehicleStatusMetrics() :
          Promise.resolve(null);

        const [trackingResponse, metricsResponse] = await Promise.all([
          http,
          metricsHttp.catch(() => null)
        ]);

        if (!mounted) return;

        const vehicles = trackingResponse?.data?.data;
        if (!Array.isArray(vehicles)) {
          setVehicleData([]);
          setVehicleStats({ total: 0, online: 0, emergency: 0, offline: 0 });
          return;
        }

        setVehicleData(vehicles);

        // Use metrics API data if available, otherwise fall back to calculated stats
        const metricsData = metricsResponse?.data;
        if (metricsData && metricsData.total_registered_vehicles !== undefined) {
          const stats = {
            total: metricsData.total_registered_vehicles || 0,
            online: metricsData.online_vehicles || 0,
            emergency: metricsData.live_sos_calls || 0,
            offline: metricsData.offline_vehicles || 0
          };
          setVehicleStats(stats);
        } else {
          // Fallback to original calculation
          const stats = {
            total: vehicles.length,
            online: 0,
            emergency: 0,
            offline: 0
          };

          vehicles.forEach((vehicle) => {
            const entryTime = new Date(vehicle.entry_time || Date.now());
            const currentTime = new Date();
            const diff = calculateTimeDifference(entryTime, currentTime);
            const ignition = String(vehicle.ignition_status);
            const speed = Number(vehicle.speed);

            if (vehicle.packet_type === 'EA') {
              stats.emergency += 1;
            } else if (diff > 5) {
              stats.offline += 1;
            } else if (ignition === '1' && speed > 1) {
              stats.online += 1;
            }
          });

          setVehicleStats(stats);
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      } finally {
        scheduleLoadingComplete();
      }
    };

    fetchVehicleData();
    const interval = setInterval(fetchVehicleData, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
      clearScheduledFinish();
    };
  }, [calculateTimeDifference]);

  return {
    vehicleData,
    vehicleStats,
    loading,
    getVehicleStyle,
    iconStyles
  };
};

const useSosDashboardData = () => {
  const [sosData, setSosData] = useState({
    activeSOS: 0,
    pendingSOS: 0,
    closedSOS: 0
  });
  const [sosCalls, setSosCalls] = useState([]);
  const [sosLoading, setSosLoading] = useState(false);
  const fakeDelayRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const clearScheduledFinish = () => {
      if (fakeDelayRef.current) {
        clearTimeout(fakeDelayRef.current);
        fakeDelayRef.current = null;
      }
    };

    const scheduleLoadingComplete = () => {
      clearScheduledFinish();
      fakeDelayRef.current = setTimeout(() => {
        if (mounted) {
          setSosLoading(false);
        }
        fakeDelayRef.current = null;
      }, SOS_FAKE_LOADING_DELAY);
    };

    const fetchSOSData = async () => {
      try {
        clearScheduledFinish();
        if (mounted) {
          setSosLoading(true);
        }
        const [dashboardResponse, leadDashboardResponse, callsResponse] = await Promise.all([
          UserServices.getSOSAdminDashboard(),
          UserServices.getSOSLeadDashboard ? UserServices.getSOSLeadDashboard() : Promise.resolve(null),
          HomePageService.getPendingSOSCall()
        ]);

        if (!mounted) return;

        const dashboard = dashboardResponse?.data || {};
        const leadDashboard = leadDashboardResponse?.data || {};
        const calls = callsResponse?.data?.calls || [];

        const totalsSource =
          leadDashboard &&
          (leadDashboard.Total_Active_Calls !== undefined ||
            leadDashboard.Total_Pending_Calls !== undefined ||
            leadDashboard.Total_Closed_Calls !== undefined)
            ? leadDashboard
            : dashboard;

        setSosData({
          activeSOS: totalsSource.Total_Active_Calls || 0,
          pendingSOS: totalsSource.Total_Pending_Calls || 0,
          closedSOS: totalsSource.Total_Closed_Calls || 0
        });

        const normalizedCalls = Array.isArray(calls)
          ? calls.slice(0, 10).map((entry) => {
              const status = (entry?.call?.status || entry?.status || 'pending').toLowerCase();
              const vehicleRegNo = entry?.call?.device?.vehicle_reg_no;
              const imei = entry?.call?.device?.device?.imei;
              const ownerName = entry?.call?.device?.vehicle_owner?.users?.[0]?.name;

              return {
                id: entry?.id,
                status,
                location: vehicleRegNo || imei || 'Unknown',
                created_at:
                  entry?.created_at ||
                  entry?.call?.created_at ||
                  entry?.call?.createdAt ||
                  entry?.call?.timestamp ||
                  entry?.call?.time ||
                  null,
                reporter_name: ownerName || entry?.call?.caller_name || entry?.call?.caller || null,
                notes: entry?.call?.message || entry?.call?.notes || null,
                raw: entry
              };
            })
          : [];

        setSosCalls(normalizedCalls);
      } catch (error) {
        console.error('Error fetching SOS data:', error);
      } finally {
        scheduleLoadingComplete();
      }
    };

    fetchSOSData();
    const interval = setInterval(fetchSOSData, SOS_REFRESH_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(interval);
      clearScheduledFinish();
    };
  }, []);

  return { sosData, sosCalls, sosLoading };
};

const PageWrapper = ({ title, description, children, sx = {} }) => (
  <MainCard
    content={false}
    sx={{
      bgcolor: '#f8fafc',
      backgroundImage: `
        radial-gradient(circle at 0% 0%, ${alpha('#6366f1', 0.03)} 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, ${alpha('#ec4899', 0.03)} 0%, transparent 50%)
      `,
      minHeight: 'calc(100vh - 88px)',
      border: 'none',
      position: 'relative',
      ...sx
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: '-20% 40% auto 10%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(12px)',
          animation: `${gradientPulse} 11s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: '60% -15% -25% 55%',
          background: 'linear-gradient(135deg, rgba(236,72,153,0.12), transparent)',
          transform: 'rotate(-12deg)',
          filter: 'blur(20px)',
          animation: `${gradientPulse} 14s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            color: '#1e293b',
            mb: 1,
            letterSpacing: '-1px'
          }}
        >
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem', maxWidth: '600px' }}>
          {description}
        </Typography>
      </Box>
      <Box>{children}</Box>
    </Box>
  </MainCard>
);

export {
  DashboardMap,
  StatPieChart,
  StatBarChart,
  DashboardCard,
  MetricCard,
  useVehicleData,
  useSosDashboardData,
  PageWrapper,
  MonthlyTrendsChart,
  MonthlyPerformanceChart
};
