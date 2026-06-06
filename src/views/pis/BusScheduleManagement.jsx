import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, Select, TextField, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel
} from '@mui/material';
import { IconEdit } from '@tabler/icons';
import PISService from '../../services/PISServices';

const BusScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [formData, setFormData] = useState({
    serviceType: 'Ordinary',
    startDatetime: '',
    routeId: '',
    busId: '',
    status: 'created'
  });

  const fetchData = async () => {
    try {
      const [schedRes, routeRes, busRes] = await Promise.all([
        PISService.getBusSchedules(),
        PISService.getActiveBusRoutes(),
        PISService.getAvailableBuses()
      ]);
      if (schedRes.success) setSchedules(schedRes.data);
      if (routeRes.success) setRoutes(routeRes.data);
      if (busRes.success) setBuses(busRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        serviceType: schedule.serviceType || 'Ordinary',
        startDatetime: schedule.startDatetime || '',
        routeId: schedule.routeId || '',
        busId: schedule.busId || '',
        status: schedule.status || 'created'
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        serviceType: 'Ordinary',
        startDatetime: '',
        routeId: '',
        busId: '',
        status: 'created'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingSchedule) {
        await PISService.updateBusSchedule(editingSchedule.id, formData);
      } else {
        await PISService.createBusSchedule(formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error("Failed to save bus schedule:", error);
    }
  };

  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : routeId;
  };

  const getBusName = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.name : busId;
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Bus Schedule Management"
          action={
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
              Add Schedule
            </Button>
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
                  <TableCell>Actual Start</TableCell>
                  <TableCell>Actual End</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((sched) => (
                  <TableRow key={sched.id}>
                    <TableCell>{sched.serviceType}</TableCell>
                    <TableCell>{new Date(sched.startDatetime).toLocaleString()}</TableCell>
                    <TableCell>{getRouteName(sched.routeId)}</TableCell>
                    <TableCell>{getBusName(sched.busId)}</TableCell>
                    <TableCell>{sched.status}</TableCell>
                    <TableCell>{sched.actualStartTime ? new Date(sched.actualStartTime).toLocaleString() : '-'}</TableCell>
                    <TableCell>{sched.actualEndTime ? new Date(sched.actualEndTime).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(sched)}>
                        <IconEdit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No bus schedules found.</TableCell>
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
                  name="serviceType"
                  value={formData.serviceType}
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
                name="startDatetime"
                type="datetime-local"
                value={formData.startDatetime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Route</InputLabel>
                <Select
                  name="routeId"
                  value={formData.routeId}
                  label="Route"
                  onChange={handleChange}
                >
                  {routes.map(route => (
                    <MenuItem key={route.id} value={route.id}>{route.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Bus</InputLabel>
                <Select
                  name="busId"
                  value={formData.busId}
                  label="Bus"
                  onChange={handleChange}
                >
                  {buses.map(bus => (
                    <MenuItem key={bus.id} value={bus.id}>{bus.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="created">Created</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                  <MenuItem value="started">Started</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusScheduleManagement;
