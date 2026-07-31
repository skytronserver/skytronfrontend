/* eslint-disable no-unused-vars */
import React,{useEffect,useState} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
    Grid,
    Box,
    Typography,
    Alert,
    Avatar,
    Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Project imports
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import DynamicDatatables from '../../datatables/DynamicDatatables';

// Icons
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import RouteIcon from '@mui/icons-material/Route';
import CircleIcon from '@mui/icons-material/Circle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';



export const apiRequest = async ({
  url,
  method = "GET",
  body = null,
  token,
}) => {
  try {

     const authToken =
      token ||
      sessionStorage.getItem("oAuthToken") ||
      localStorage.getItem("oAuthToken");
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}${url}`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API Error");
    }

    return data;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};



const SchoolBusDashboard = () => {
    const theme = useTheme();

const [dashboardData, setDashboardData] = useState(null);
const [schoolDistribution, setSchoolDistribution] = useState([]);
const [activeTrips, setActiveTrips] = useState([]);
const [busOperationalStatus,setBusOperationalStatus]=useState(null);
const [liveAlertsFeed,setLiveAlertsFeed]=useState(null);

const [open, setOpen] = useState(false);

const handleOpen = () => setOpen(true);
const handleClose = () => setOpen(false);

useEffect(() => {
  const fetchData = async () => {
    debugger
    try {
      const [dashboard, schools, trips,busOperational,liveAltFeed] = await Promise.all([
        apiRequest({ url: "school/api/dashboard/" }),
        apiRequest({ url: "school/api/school-distribution/" }),
        apiRequest({ url: "school/api/active-trips/" }),
        apiRequest({ url: "school/api/bus-operational-status/" }),
        apiRequest({ url: "school/api/live-alerts/" }),


      ]);
debugger
      setDashboardData(dashboard.data);
      console.log(dashboard.data);

    //   setSchoolDistribution(schools.data);
    setSchoolDistribution(formatSchoolData(schools.data));
      console.log(schools.data);

      setActiveTrips(trips.data);
      console.log(trips.data);

      setBusOperationalStatus(busOperational.data);
      console.log(busOperational.data);

       setLiveAlertsFeed(liveAltFeed.data);
      console.log(liveAltFeed.data);



    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);













    // Dummy Real Data for Schools Module
    const stats = [
        { title: 'Total Schools', count: dashboardData?.total_schools, icon: <SchoolIcon />, color: theme.palette.primary.main },
        { title: 'Registered Buses', count: dashboardData?.registered_buses, icon: <DirectionsBusIcon />, color: theme.palette.success.main },
        { title: 'Active Students', count: dashboardData?.active_students, icon: <GroupIcon />, color: theme.palette.secondary.main },
        { title: 'Total Routes', count: dashboardData?.total_routes, icon: <RouteIcon />, color: theme.palette.warning.main },
    ];

    const busStatusData = [
        { name: 'On-Trip', value: busOperationalStatus?.on_trip, color: theme.palette.success.main },
        { name: 'Idle', value: busOperationalStatus?.idle, color: theme.palette.warning.main },
        { name: 'Maintenance', value: busOperationalStatus?.maintenance, color: theme.palette.error.main },
        { name: 'Off-Duty', value: busOperationalStatus?.off_duty, color: theme.palette.grey[500] }
    ];

    // const studentGrowthData = [
    //     { name: 'DPS North', students: 850, buses: 24 },
    //     { name: 'Ryan Intl', students: 1200, buses: 32 },
    //     { name: 'Modern School', students: 600, buses: 18 },
    //     { name: 'St. Marys', students: 800, buses: 22 }
    // ];


    const formatSchoolData = (data) =>
  data.map((item) => ({
    name: item.school_name ?? "Unknown",
    students: item.students ?? 0,
    buses: item.buses ?? 0
  }));

    const recentAlerts = [
        { id: 1, type: 'Geofence Entry', message: 'Bus DL 1PC 1234 entered Sector 5', time: '10:15 AM', status: 'Notice' },
        { id: 2, type: 'Delay', message: 'Route A delayed by 15 mins due to traffic', time: '10:02 AM', status: 'Warning' },
        { id: 3, type: 'Emergency', message: 'SOS triggered from Bus DL 2PB 5678', time: '09:45 AM', status: 'Critical' }
    ];

    const activeTripsCols = [
        { name: 'bus', label: 'Vehicle' },
        { name: 'route', label: 'Route' },
        { name: 'driver', label: 'Driver' },
        { name: 'contact', label: 'Contact' },
        {
            name: 'status',
            label: 'Status',
            options: {
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        size="small"
                        color={value === 'On-Time' ? 'success' : 'warning'}
                        icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
                    />
                )
            }
        }
    ];

    const activeTripsData = [
        { bus: 'DL 1PC 1234', route: 'Morning North A', driver: 'Suresh Kumar', contact: '9876543210', status: 'On-Time' },
        { bus: 'DL 2PB 5678', route: 'Morning South B', driver: 'Amit Singh', contact: '9876543211', status: 'Delayed' },
        { bus: 'HR 55X 0012', route: 'Morning West C', driver: 'Vikram Dutt', contact: '9876543212', status: 'On-Time' }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>

                {/* Metric Cards */}
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <MainCard content={false}>
                            <Box sx={{ p: 3 }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                ...theme.typography.commonAvatar,
                                                ...theme.typography.largeAvatar,
                                                bgcolor: alpha(stat.color, 0.1),
                                                color: stat.color
                                            }}
                                        >
                                            {stat.icon}
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs zeroMinWidth>
                                        <Typography variant="h2" sx={{ fontWeight: 700 }}>{stat.count}</Typography>
                                        <Typography variant="subtitle2" color="text.secondary">{stat.title}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </MainCard>
                    </Grid>
                ))}

                {/* Charts Row */}
                <Grid item xs={12} md={5}>
                    <MainCard title="Bus Operational Status">
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={busStatusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {busStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </MainCard>
                </Grid>

                <Grid item xs={12} md={7}>
                    <MainCard title="School-wise Student & Bus Distribution">
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={schoolDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="students" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="buses" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </MainCard>
                </Grid>

                {/* Recent Alerts & Activity */}
                {/* <Grid item xs={12} md={4}>
                    <MainCard title="Live Alerts Feed" secondary={<NotificationsActiveIcon color="error" />}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {recentAlerts.map((alert) => (
                                <Box key={alert.id} sx={{ p: 2, bgcolor: alpha(alert.status === 'Critical' ? theme.palette.error.main : theme.palette.primary.main, 0.05), borderRadius: 2, borderLeft: `4px solid ${alert.status === 'Critical' ? theme.palette.error.main : theme.palette.primary.main}` }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>{alert.type}</Typography>
                                        <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
                                    </Box>
                                    <Typography variant="body2">{alert.message}</Typography>
                                </Box>
                            ))}
                            <Button variant="text" fullWidth color="primary" sx={{ mt: 1 }}>View All Notifications</Button>
                        </Box>
                    </MainCard>
                </Grid> */}

<Grid item xs={12} md={4}>
  <MainCard
    title="Live Alerts Feed"
    secondary={<NotificationsActiveIcon color="error" />}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
     
   {liveAlertsFeed?.slice(0, 3).map((alert) => {
        const isEmergency = alert.type === "EMERGENCY";

debugger
        return (
          <Box
            key={alert.id}
            sx={{
              p: 2,
              bgcolor: alpha(
                isEmergency
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
                0.05
              ),
              borderRadius: 2,
              borderLeft: `4px solid ${
                isEmergency
                  ? theme.palette.error.main
                  : theme.palette.primary.main
              }`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {alert.type}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {alert.time}
              </Typography>
            </Box>

            <Typography variant="body2">
              {alert.message || "-"}
            </Typography>
          </Box>
        );
      })}

      <Button 
 
  onClick={handleOpen}
   variant="text" fullWidth color="primary" sx={{ mt: 1 }}>
        View All Notifications
      </Button>
    </Box>
  </MainCard>
</Grid>

<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle>All Notifications</DialogTitle>

  <DialogContent dividers>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {liveAlertsFeed?.map((alert) => {
        const isEmergency = alert.type === "EMERGENCY";

        return (
          <Box
            key={alert.id}
            sx={{
              p: 2,
              bgcolor: alpha(
                isEmergency
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
                0.05
              ),
              borderRadius: 2,
              borderLeft: `4px solid ${
                isEmergency
                  ? theme.palette.error.main
                  : theme.palette.primary.main
              }`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {alert.type}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {alert.time}
              </Typography>
            </Box>

            <Typography variant="body2">
              {alert.message || "-"}
            </Typography>
          </Box>
        );
      })}
    </Box>
  </DialogContent>

  <DialogActions>
    <Button onClick={handleClose}>Close</Button>
  </DialogActions>
</Dialog>



                {/* Active Trips Monitor Table */}
                <Grid item xs={12} md={8}>
                    <MainCard title="Active Trip Monitor">
                        <DynamicDatatables
                            tableTitle="Live Tracking Overview"
                            rows={activeTripsData}
                            columns={activeTripsCols}
                            options={{
                                selectableRows: 'none',
                                filter: false,
                                search: false,
                                pagination: false,
                                download: false,
                                print: false,
                                viewColumns: false
                            }}
                        />
                    </MainCard>
                </Grid>

                {/* Quick Links / System Info */}
                <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700}>School Bus Management System v1.5</Typography>
                        <Typography variant="body2">
                            All data shown here is aggregated across registered schools. Real-time updates are pushed via 2.5 second polling intervals from active VLTD units.
                        </Typography>
                    </Alert>
                </Grid>

            </Grid>
        </Box>
    );
};

// Simple Button for the "View All" link
const Button = ({ children, ...props }) => (
    <Box component="button" {...props} sx={{
        bgcolor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'center',
        py: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
        ...props.sx
    }}>
        <Typography variant="body2" color="primary" fontWeight={600}>{children}</Typography>
    </Box>
);

export default SchoolBusDashboard;
