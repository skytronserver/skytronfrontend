import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { PageWrapper } from './SuperAdminCommon';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  ink: '#0f172a',
  muted: '#475569',
  surface: '#ffffff',
  border: alpha('#0f172a', 0.08),
  cardBg: alpha('#ffffff', 0.92)
};

const ChartCard = ({ title, subtitle, children, color, tokens }) => (
  <Box
    sx={{
      height: '100%',
      borderRadius: 3,
      border: `1px solid ${alpha(color, 0.18)}`,
      bgcolor: tokens?.cardBg || COLORS.cardBg,
      boxShadow: `0 18px 40px -26px ${alpha(color, 0.55)}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderBottom: `1px solid ${alpha(color, 0.12)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.14)} 0%, ${alpha(color, 0.03)} 100%)`
      }}
    >
      <Typography sx={{ fontWeight: 800, color: tokens?.text || COLORS.ink, fontSize: '1.05rem' }}>{title}</Typography>
      <Typography sx={{ color: tokens?.muted || COLORS.muted, fontSize: '0.85rem', mt: 0.25 }}>{subtitle}</Typography>
    </Box>
    <Box sx={{ flex: 1, minHeight: 0, p: 2.25 }}>{children}</Box>
  </Box>
);

const TooltipBox = ({ active, payload, label, tokens }) => {
  if (!active || !payload?.length) return null;

  const titleColor = tokens?.text || COLORS.ink;
  const rowColor = tokens?.muted || COLORS.muted;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2,
        bgcolor: tokens?.cardBg || COLORS.cardBg,
        border: `1px solid ${tokens?.border || COLORS.border}`,
        boxShadow: '0 20px 40px -22px rgba(15, 23, 42, 0.45)'
      }}
    >
      <Typography sx={{ fontWeight: 800, color: titleColor, fontSize: '0.85rem' }}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey || entry.name} sx={{ color: rowColor, fontSize: '0.8rem' }}>
          {entry.name}: {entry.value}
        </Typography>
      ))}
    </Box>
  );
};

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index ? children : null}
  </Box>
);

const SOSAnalyticsDashboard = () => {
  const [mode, setMode] = useState('light');
  const [tabValue, setTabValue] = useState(0);

  const tokens = useMemo(() => {
    if (mode === 'dark') {
      return {
        pageBg: '#1a1f2e',
        cardBg: alpha('#0f1419', 0.92),
        border: alpha('#475569', 0.3),
        text: '#e5e7eb',
        muted: alpha('#e5e7eb', 0.7)
      };
    }

    return {
      pageBg: '#f8fafc',
      cardBg: alpha('#ffffff', 0.92),
      border: alpha('#0f172a', 0.08),
      text: '#0f172a',
      muted: '#475569'
    };
  }, [mode]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Monthwise data from user's image
  const monthwiseData = useMemo(
    () => [
      { month: 'Jan', total: 50, genuine: 40, panic: 4, policeAccepted: 3, ambAccepted: 2, other: 1, fake: 10 },
      { month: 'Feb', total: 20, genuine: 15, panic: 2, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 },
      { month: 'Mar', total: 39, genuine: 32, panic: 2, policeAccepted: 2, ambAccepted: 1, other: 2, fake: 7 },
      { month: 'Apr', total: 40, genuine: 35, panic: 1, policeAccepted: 2, ambAccepted: 1, other: 1, fake: 5 },
      { month: 'May', total: 37, genuine: 30, panic: 2, policeAccepted: 2, ambAccepted: 1, other: 2, fake: 7 },
      { month: 'Jun', total: 48, genuine: 40, panic: 3, policeAccepted: 2, ambAccepted: 2, other: 1, fake: 8 },
      { month: 'Jul', total: 95, genuine: 80, panic: 6, policeAccepted: 4, ambAccepted: 3, other: 2, fake: 15 },
      { month: 'Aug', total: 29, genuine: 24, panic: 1, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 },
      { month: 'Sept', total: 30, genuine: 25, panic: 1, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 },
      { month: 'Oct', total: 47, genuine: 38, panic: 3, policeAccepted: 2, ambAccepted: 1, other: 3, fake: 9 },
      { month: 'Nov', total: 49, genuine: 42, panic: 2, policeAccepted: 2, ambAccepted: 1, other: 2, fake: 7 },
      { month: 'Dec', total: 29, genuine: 24, panic: 1, policeAccepted: 1, ambAccepted: 1, other: 1, fake: 5 }
    ],
    []
  );

  const monthwiseTotals = useMemo(
    () => monthwiseData.map((d) => ({ month: d.month, total: d.total })),
    [monthwiseData]
  );

  const hourlyData = useMemo(
    () => [
      { time: '00:00-01:00', total: 50 },
      { time: '01:00-02:00', total: 20 },
      { time: '02:00-03:00', total: 39 },
      { time: '03:00-04:00', total: 40 },
      { time: '04:00-05:00', total: 37 },
      { time: '05:00-06:00', total: 48 },
      { time: '06:00-07:00', total: 95 },
      { time: '07:00-08:00', total: 29 },
      { time: '08:00-09:00', total: 30 },
      { time: '09:00-10:00', total: 47 },
      { time: '10:00-11:00', total: 49 },
      { time: '11:00-12:00', total: 29 },
      { time: '12:00-13:00', total: 20 },
      { time: '13:00-14:00', total: 20 },
      { time: '14:00-15:00', total: 40 },
      { time: '15:00-16:00', total: 50 },
      { time: '16:00-17:00', total: 37 },
      { time: '17:00-18:00', total: 48 },
      { time: '18:00-19:00', total: 59 },
      { time: '19:00-20:00', total: 29 },
      { time: '20:00-21:00', total: 50 },
      { time: '21:00-22:00', total: 58 },
      { time: '22:00-23:00', total: 39 },
      { time: '23:00-24:00', total: 20 }
    ],
    []
  );

  const districtSeries = useMemo(
    () => [
      { name: 'Baksa', total: 50 },
      { name: 'Barpeta', total: 20 },
      { name: 'Chirang', total: 39 },
      { name: 'Goalpara', total: 40 },
      { name: 'Kamrup Metropolitan', total: 37 },
      { name: 'Nalbari', total: 48 },
      { name: 'Tamulpur', total: 95 },
      { name: 'Darrang', total: 29 },
      { name: 'Udalguri', total: 30 },
      { name: 'Dhemaji', total: 47 },
      { name: 'Golaghat', total: 49 },
      { name: 'Lakhimpur', total: 29 },
      { name: 'Sivasagar', total: 20 },
      { name: 'Dima Hasao', total: 20 },
      { name: 'Karbi Anglong', total: 40 },
      { name: 'West Karbi Anglong', total: 50 },
      { name: 'Cachar', total: 37 },
      { name: 'Hailakandi', total: 48 },
      { name: 'Karimganj', total: 58 }
    ],
    []
  );

  const policeStationSeries = useMemo(
    () => [
      { name: 'Dispur', total: 50 },
      { name: 'Panbazar', total: 20 },
      { name: 'Latasil', total: 39 },
      { name: 'Paltan Bazar', total: 40 },
      { name: 'Gorchuk', total: 37 },
      { name: 'Noonmati', total: 48 },
      { name: 'Chandmari', total: 95 },
      { name: 'Basistha', total: 29 },
      { name: 'Panjabari', total: 30 },
      { name: 'Geetanagar', total: 47 },
      { name: 'Nalbari', total: 49 },
      { name: 'South Salmara-Mankachar', total: 29 },
      { name: 'Tamulpur', total: 20 },
      { name: 'Biswanath', total: 20 },
      { name: 'Darrang', total: 40 },
      { name: 'Sonitpur', total: 50 },
      { name: 'Udalguri', total: 37 },
      { name: 'Charaideo', total: 48 },
      { name: 'Dhemaji', total: 59 },
      { name: 'Dibrugarh', total: 29 },
      { name: 'Golaghat', total: 50 },
      { name: 'Jorhat', total: 58 },
      { name: 'Lakhimpur', total: 39 },
      { name: 'Majuli', total: 20 },
      { name: 'Sivasagar', total: 20 },
      { name: 'Tinsukia', total: 20 },
      { name: 'Dima Hasao', total: 40 },
      { name: 'Hojai', total: 50 },
      { name: 'Morigaon', total: 37 },
      { name: 'Nagaon', total: 48 },
      { name: 'Karbi Anglong', total: 58 },
      { name: 'West Karbi Anglong', total: 39 },
      { name: 'Cachar', total: 20 },
      { name: 'Hailakandi', total: 20 },
      { name: 'Karimganj', total: 20 }
    ],
    []
  );


  const timeOfDayHeatmap = useMemo(
    () => [
      { day: 'Mon', values: [8, 6, 5, 4, 3, 4, 6, 7, 9, 10, 8, 7, 6, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5] },
      { day: 'Tue', values: [7, 5, 4, 3, 3, 4, 6, 8, 10, 11, 9, 8, 7, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6] },
      { day: 'Wed', values: [6, 5, 4, 3, 2, 3, 5, 7, 9, 10, 9, 8, 7, 6, 6, 7, 8, 9, 10, 10, 9, 8, 7, 6] },
      { day: 'Thu', values: [6, 4, 4, 3, 2, 3, 5, 7, 9, 11, 10, 9, 7, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6] },
      { day: 'Fri', values: [7, 5, 4, 3, 2, 3, 5, 8, 10, 12, 11, 10, 8, 7, 8, 9, 10, 11, 13, 12, 11, 10, 8, 7] },
      { day: 'Sat', values: [8, 7, 6, 5, 4, 5, 7, 9, 11, 13, 12, 11, 9, 8, 9, 10, 11, 12, 14, 13, 12, 11, 9, 8] },
      { day: 'Sun', values: [9, 8, 7, 6, 5, 6, 8, 10, 12, 14, 13, 12, 10, 9, 10, 11, 12, 13, 15, 14, 13, 12, 10, 9] }
    ],
    []
  );

  const sosByType = useMemo(
    () => [
      { name: 'Panic Alert', value: 45, color: COLORS.primary },
      { name: 'Medical Emergency', value: 21, color: COLORS.secondary },
      { name: 'Accident', value: 27, color: COLORS.warning },
      { name: 'Others', value: 7, color: COLORS.accent }
    ],
    []
  );

  const panicBreakdown = useMemo(
    () => [
      { name: 'Sital Alert', value: 35, color: COLORS.success },
      { name: 'Medical', value: 40, color: COLORS.primary },
      { name: 'Fire Alarm', value: 25, color: COLORS.danger }
    ],
    []
  );

  const ambulanceBreakdown = useMemo(
    () => [
      { name: 'Threat Perception', value: 32, color: COLORS.warning },
      { name: 'Others', value: 68, color: COLORS.secondary }
    ],
    []
  );

  const topDistricts = useMemo(
    () => [
      { name: 'Central', total: 528, sla: 96, policeAccepted: 93 },
      { name: 'West', total: 93, sla: 92, policeAccepted: 88 },
      { name: 'South', total: 30, sla: 97, policeAccepted: 85 }
    ],
    []
  );

  const districtsTrend = useMemo(
    () => [
      { t: 'Jan', Central: 120, West: 58, South: 34 },
      { t: 'Feb', Central: 140, West: 62, South: 30 },
      { t: 'Mar', Central: 132, West: 60, South: 38 },
      { t: 'Apr', Central: 150, West: 65, South: 42 },
      { t: 'May', Central: 148, West: 70, South: 40 },
      { t: 'Jun', Central: 160, West: 72, South: 45 }
    ],
    []
  );

  const topPoliceStations = useMemo(
    () => [
      { month: 'Jan', Dispur: 50, Panbazar: 45, Latasil: 40 },
      { month: 'Feb', Dispur: 48, Panbazar: 42, Latasil: 38 },
      { month: 'Mar', Dispur: 55, Panbazar: 47, Latasil: 41 },
      { month: 'Apr', Dispur: 52, Panbazar: 46, Latasil: 39 },
      { month: 'May', Dispur: 58, Panbazar: 49, Latasil: 42 },
      { month: 'Jun', Dispur: 60, Panbazar: 52, Latasil: 44 },
      { month: 'Jul', Dispur: 65, Panbazar: 56, Latasil: 50 }
    ],
    []
  );


  const heatMax = useMemo(
    () => timeOfDayHeatmap.reduce((max, row) => Math.max(max, ...row.values), 0),
    [timeOfDayHeatmap]
  );

  const heatColor = (v) => {
    const t = heatMax ? v / heatMax : 0;
    return `rgba(59, 130, 246, ${0.1 + t * 0.8})`;
  };

  return (
    <PageWrapper
      title="SOS Analytics"
      description="Trends & outcomes across months, time of day, SOS type, districts and stations."
      sx={{
        bgcolor: tokens.pageBg,
        backgroundImage: 'none'
      }}
      titleSx={{ color: tokens.text }}
      descriptionSx={{ color: tokens.muted }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
          borderRadius: 3,
          bgcolor: tokens.cardBg,
          border: `1px solid ${tokens.border}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${tokens.border}`,
            px: 2,
            '& .MuiTabs-flexContainer': {
              gap: 1
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              minHeight: 54,
              color: tokens.muted
            },
            '& .MuiTab-root.Mui-selected': {
              color: tokens.text
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
              backgroundColor: COLORS.primary
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Monthwise" />
          <Tab label="Time-based (Hourly)" />
          <Tab label="District-wise" />
          <Tab label="Police Station-wise" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <ChartCard
              title="SOS Calls Breakdown (Jan-Dec)"
              subtitle="Total SOS calls segmented by categories"
              color={COLORS.primary}
              tokens={tokens}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthwiseData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.18)} />
                  <XAxis dataKey="month" tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tokens.muted }} />
                  <Bar dataKey="genuine" name="Genuine Calls" stackId="a" fill={COLORS.success} />
                  <Bar dataKey="panic" name="Panic Calls" stackId="a" fill={COLORS.primary} />
                  <Bar dataKey="policeAccepted" name="Police Accepted" stackId="a" fill={COLORS.secondary} />
                  <Bar dataKey="ambAccepted" name="Amb Accepted" stackId="a" fill={COLORS.warning} />
                  <Bar dataKey="other" name="Other" stackId="a" fill={alpha(COLORS.ink, 0.22)} />
                  <Bar dataKey="fake" name="Fake Calls" stackId="a" fill={COLORS.danger} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <ChartCard
              title="SOS Calls by Time of Day"
              subtitle="Heatmap view (Day vs Hour)"
              color={COLORS.secondary}
              tokens={tokens}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '52px repeat(24, 1fr)', gap: 0.75 }}>
                <Box />
                {Array.from({ length: 24 }).map((_, i) => (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: tokens.muted }}>{i}</Typography>
                  </Box>
                ))}
                {timeOfDayHeatmap.map((row) => (
                  <Box key={row.day} sx={{ display: 'contents' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.text }}>{row.day}</Typography>
                    </Box>
                    {row.values.map((v, idx) => (
                      <Box
                        key={`${row.day}-${idx}`}
                        sx={{
                          height: 16,
                          borderRadius: 0.75,
                          bgcolor: heatColor(v),
                          border: `1px solid ${alpha(tokens.text, 0.08)}`
                        }}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <ChartCard
              title="SOS Calls by Type"
              subtitle="Distribution by category"
              color={COLORS.accent}
              tokens={tokens}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sosByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {sosByType.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tokens.muted }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={3.5}>
            <ChartCard title="Panic Alert" subtitle="Breakdown" color={COLORS.primary} tokens={tokens}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={panicBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {panicBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tokens.muted }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={3.5}>
            <ChartCard title="Ambulance" subtitle="Breakdown" color={COLORS.warning} tokens={tokens}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ambulanceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {ambulanceBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tokens.muted }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <ChartCard title="Top SOS Districts" subtitle="Volume and SLA metrics" color={COLORS.success} tokens={tokens}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 0.8fr 0.6fr 0.8fr',
                    gap: 1,
                    pb: 1,
                    borderBottom: `1px solid ${alpha(tokens.text, 0.12)}`
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted }}>District</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted, textAlign: 'right' }}>Total</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted, textAlign: 'right' }}>SLA</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: tokens.muted, textAlign: 'right' }}>Police</Typography>
                </Box>
                {topDistricts.map((d) => (
                  <Box
                    key={d.name}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 0.8fr 0.6fr 0.8fr',
                      gap: 1,
                      alignItems: 'center'
                    }}
                  >
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: tokens.text }}>{d.name}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: tokens.text, textAlign: 'right' }}>{d.total}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: COLORS.success, textAlign: 'right' }}>{d.sla}%</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: COLORS.secondary, textAlign: 'right' }}>{d.policeAccepted}%</Typography>
                  </Box>
                ))}

                <Box sx={{ mt: 1, pt: 1.25, borderTop: `1px solid ${alpha(tokens.text, 0.12)}` }}>
                  <Typography sx={{ fontSize: '0.8rem', color: tokens.muted }}>Overall SLA Compliance</Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: tokens.text }}>92%</Typography>
                </Box>
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <ChartCard title="Top SOS Districts" subtitle="Trend over time" color={COLORS.secondary} tokens={tokens}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={districtsTrend} margin={{ top: 10, right: 18, left: -8, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.secondary, 0.15)} />
                  <XAxis dataKey="t" tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tokens.muted }} />
                  <Line type="monotone" dataKey="Central" name="Central" stroke={COLORS.primary} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="West" name="West" stroke={COLORS.warning} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="South" name="South" stroke={COLORS.success} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <ChartCard title="Top SOS Police Stations" subtitle="Monthly stacked volume" color={COLORS.primary} tokens={tokens}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topPoliceStations} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.18)} />
                  <XAxis dataKey="month" tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tokens.muted }} />
                  <Bar dataKey="Dispur" name="Dispur" stackId="a" fill={COLORS.primary} />
                  <Bar dataKey="Panbazar" name="Panbazar" stackId="a" fill={COLORS.secondary} />
                  <Bar dataKey="Latasil" name="Latasil" stackId="a" fill={COLORS.warning} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="Monthwise total SOS calls (Jan-Dec)" color={COLORS.primary} tokens={tokens}>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={monthwiseTotals} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.18)} />
                  <XAxis dataKey="month" tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Bar dataKey="total" name="Total SOS call" radius={[8, 8, 0, 0]} fill={COLORS.primary} barSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="Hourly analysis (Area chart)" color={COLORS.secondary} tokens={tokens}>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={hourlyData} margin={{ top: 20, right: 20, left: -10, bottom: 70 }}>
                  <defs>
                    <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={true} stroke={alpha(COLORS.secondary, 0.12)} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: tokens.muted, fontSize: 10, angle: -45, textAnchor: 'end' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={90}
                  />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Area type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.secondary} strokeWidth={2} fill="url(#hourlyFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="Hourly analysis (Line chart)" color={COLORS.accent} tokens={tokens}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={hourlyData} margin={{ top: 20, right: 20, left: -10, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={true} stroke={alpha(COLORS.accent, 0.12)} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: tokens.muted, fontSize: 10, angle: -45, textAnchor: 'end' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={90}
                  />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Line type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.accent} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="District-wise (Area chart)" color={COLORS.success} tokens={tokens}>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={districtSeries} margin={{ top: 20, right: 20, left: -10, bottom: 90 }}>
                  <defs>
                    <linearGradient id="districtFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.success, 0.15)} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tokens.muted, fontSize: 10, angle: -45, textAnchor: 'end' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={110}
                  />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Area type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.success} strokeWidth={2} fill="url(#districtFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="District-wise (Line chart)" color={COLORS.warning} tokens={tokens}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={districtSeries} margin={{ top: 20, right: 20, left: -10, bottom: 90 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.warning, 0.15)} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tokens.muted, fontSize: 10, angle: -45, textAnchor: 'end' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={110}
                  />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Line type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.warning} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="Police Station-wise (Area chart)" color={COLORS.danger} tokens={tokens}>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={policeStationSeries} margin={{ top: 20, right: 20, left: -10, bottom: 120 }}>
                  <defs>
                    <linearGradient id="psFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.danger, 0.15)} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tokens.muted, fontSize: 9, angle: -45, textAnchor: 'end' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={140}
                  />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Area type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.danger} strokeWidth={2} fill="url(#psFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard title="Total SOS Call" subtitle="Police Station-wise (Line chart)" color={COLORS.primary} tokens={tokens}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={policeStationSeries} margin={{ top: 20, right: 20, left: -10, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={alpha(COLORS.primary, 0.15)} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tokens.muted, fontSize: 9, angle: -45, textAnchor: 'end' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={140}
                  />
                  <YAxis tick={{ fill: tokens.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<TooltipBox tokens={tokens} />} />
                  <Line type="monotone" dataKey="total" name="Total SOS call" stroke={COLORS.primary} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </TabPanel>
    </PageWrapper>
  );

};

export default SOSAnalyticsDashboard;
