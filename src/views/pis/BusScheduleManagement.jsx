import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, Select, TextField, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel
} from '@mui/material';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { IconPlayerPlay, IconSquareRoundedX, IconCheck } from '@tabler/icons';
import PISService from '../../services/PISServices';
import { decipherEncryption } from '../../helper';

const BusScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [errors, setErrors] = useState({});

const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "success",
});

const handleSnackbarClose = () => {
  setSnackbar((prev) => ({
    ...prev,
    open: false,
  }));
};

const validateForm = () => {
  let tempErrors = {};

  if (!formData.service_type) {
    tempErrors.service_type = "Service Type is required";
  }

  if (!formData.start_datetime) {
    tempErrors.start_datetime = "Start Datetime is required";
  } else {
    const selectedDate = new Date(formData.start_datetime);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
      tempErrors.start_datetime =
        "Start Datetime cannot be in the past";
    }
  }

  if (!formData.route) {
    tempErrors.route = "Route is required";
  }

  if (!formData.bus) {
    tempErrors.bus = "Bus is required";
  }

  setErrors(tempErrors);

  return Object.keys(tempErrors).length === 0;
};

  const [formData, setFormData] = useState({
    service_type: 'Express',
    start_datetime: '',
    route: '',
    bus: ''
  });

  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData") || localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRole = data && data.length > 2 ? data[1].toLowerCase().trim() : '';
  const isOwner = userRole === 'owner';

  const fetchData = async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;

      const results = await Promise.allSettled([
        PISService.getBusSchedules(filters),
        PISService.getActiveBusRoutes(),
        PISService.getAvailableBuses()
      ]);
      
      const schedRes = results[0];
      const routeRes = results[1];
      const busRes = results[2];

      if (schedRes.status === 'fulfilled' && schedRes.value?.success) setSchedules(schedRes.value.data);
      if (routeRes.status === 'fulfilled' && routeRes.value?.success) setRoutes(routeRes.value.data);
      if (busRes.status === 'fulfilled' && busRes.value?.success) setBuses(busRes.value.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleOpen = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        service_type: schedule.service_type || schedule.serviceType || 'Express',
        start_datetime: schedule.start_datetime || schedule.startDatetime || '',
        route: schedule.route || schedule.routeId || '',
        bus: schedule.bus || schedule.busId || ''
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        service_type: 'Express',
        start_datetime: '',
        route: '',
        bus: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};

  const handleSubmit = async () => {

      if (!validateForm()) {
    setSnackbar({
      open: true,
      message: "Please fill all required fields",
      severity: "error",
    });
    return;
  }

    try {
      const payload = {
        service_type: formData.service_type,
        start_datetime: formData.start_datetime,
        route: formData.route,
        bus: formData.bus
      };

      // await PISService.createBusSchedule(payload);
      const response = await PISService.createBusSchedule(payload);
      setSnackbar({
      open: true,
      message:
        response?.message ||
        response?.data?.message ||
        "Bus Schedule created successfully",
      severity: "success",
    });
      fetchData();
      handleClose();
    } catch (error) {
      console.error("Failed to save bus schedule:", error);
      const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to create bus schedule";

    setSnackbar({
      open: true,
      message: errorMessage,
      severity: "error",
    });
    }
  };

  // const handleUpdateStatus = async (scheduleId, newStatus) => {
  //   try {
  //     await PISService.updateTripStatus(scheduleId, newStatus);
  //     fetchData();
  //   } catch (error) {
  //     console.error("Failed to update status:", error);
  //     const msg = error.response?.data?.message || "Failed to update trip status";
  //     alert(msg);
  //   }
  // };

  const handleUpdateStatus = async (scheduleId, newStatus) => {
  try {
    const response = await PISService.updateTripStatus(
      scheduleId,
      newStatus
    );

    setSnackbar({
      open: true,
      message:
        response?.message ||
        response?.data?.message ||
        "Status updated successfully",
      severity: "success",
    });

    fetchData();
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to update trip status";

    setSnackbar({
      open: true,
      message: msg,
      severity: "error",
    });
  }
};

  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : routeId;
  };

  const getBusName = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? (bus.vehicle_reg_no || bus.name) : busId;
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Bus Schedule Management"
          action={
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="created">Created</MenuItem>
                  <MenuItem value="started">Started</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                </Select>
              </FormControl>
              {!isOwner && (
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                  Add Schedule
                </Button>
              )}
            </Box>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service Type</TableCell>
                  <TableCell>Start Datetime</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Bus</TableCell>
                  <TableCell>Status</TableCell>
                  {isOwner && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((sched) => (
                  <TableRow key={sched.id}>
                    <TableCell>{sched.service_type || sched.serviceType}</TableCell>
                    <TableCell>{sched.start_datetime ? new Date(sched.start_datetime).toLocaleString() : sched.startDatetime ? new Date(sched.startDatetime).toLocaleString() : '-'}</TableCell>
                    <TableCell>{sched.route_name || getRouteName(sched.route || sched.routeId)}</TableCell>
                    <TableCell>{sched.bus_name || getBusName(sched.bus || sched.busId)}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                        background: sched.status === 'started' ? '#e3f2fd' : sched.status === 'completed' ? '#e6f9ed' : sched.status === 'canceled' ? '#fdecea' : '#fff3e0',
                        color: sched.status === 'started' ? '#1565c0' : sched.status === 'completed' ? '#1a7f3c' : sched.status === 'canceled' ? '#c62828' : '#e65100',
                      }}>
                        {sched.status}
                      </span>
                    </TableCell>
                    {isOwner && (
                      <TableCell>
                        {sched.status === 'created' && (
                          <>
                            <IconButton style={{ color: '#1a7f3c' }} onClick={() => handleUpdateStatus(sched.id, 'started')} title="Start Trip">
                              <IconPlayerPlay size={20} />
                            </IconButton>
                            <IconButton style={{ color: '#c62828' }} onClick={() => handleUpdateStatus(sched.id, 'canceled')} title="Cancel Trip">
                              <IconSquareRoundedX size={20} />
                            </IconButton>
                          </>
                        )}

                        {sched.status === 'started' && (
                          <IconButton style={{ color: '#1565c0' }} onClick={() => handleUpdateStatus(sched.id, 'completed')} title="Complete Trip">
                            <IconCheck size={20} />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isOwner ? 6 : 5} align="center">No bus schedules found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchedule ? 'Edit Bus Schedule' : 'Add Bus Schedule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Service Type</InputLabel>
                <Select
                  name="service_type"
                  value={formData.service_type}
                  label="Service Type"
                  onChange={handleChange}
                >
                  {['Express', 'Ordinary', 'AC', 'ct bus', 'Sleeper', 'Deluxe'].map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Start Datetime"
                name="start_datetime"
                type="datetime-local"
                value={formData.start_datetime}
                onChange={handleChange}
                error={!!errors.start_datetime}
  helperText={errors.start_datetime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.route}>
                <InputLabel>Route</InputLabel>
                <Select
                  name="route"
                  value={formData.route}
                  label="Route"
                  onChange={handleChange}
                >
                  {routes.map(route => (
                    <MenuItem key={route.id} value={route.id}>{route.name}</MenuItem>
                  ))}
                </Select>
                {errors.route && (
  <Typography color="error" variant="caption">
    {errors.route}
  </Typography>
)}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.bus}>
                <InputLabel>Bus</InputLabel>
                <Select
                  name="bus"
                  value={formData.bus}
                  label="Bus"
                  onChange={handleChange}
                >
                  {buses.map(bus => (
                    <MenuItem key={bus.id} value={bus.id}>{bus.vehicle_reg_no || bus.name}</MenuItem>
                  ))}
                </Select>
                {errors.bus && (
  <Typography color="error" variant="caption">
    {errors.bus}
  </Typography>
)}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={handleSnackbarClose}
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
>
  <Alert
    onClose={handleSnackbarClose}
    severity={snackbar.severity}
    variant="filled"
    sx={{ width: "100%" }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
};

export default BusScheduleManagement;
