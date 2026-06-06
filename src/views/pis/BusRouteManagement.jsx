import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, Select, TextField, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, FormControl, InputLabel
} from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons';
import PISService from '../../services/PISServices';

const BusRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sourceStopId: '',
    destinationStopId: '',
    status: 'active',
    intermediateStops: []
  });

  const fetchData = async () => {
    try {
      const [routeRes, stopRes] = await Promise.all([
        PISService.getBusRoutes(),
        PISService.getActiveBusStops()
      ]);
      if (routeRes.success) setRoutes(routeRes.data);
      if (stopRes.success) setStops(stopRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name || '',
        sourceStopId: route.sourceStopId || '',
        destinationStopId: route.destinationStopId || '',
        status: route.status || 'active',
        intermediateStops: route.intermediateStops || []
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        sourceStopId: '',
        destinationStopId: '',
        status: 'active',
        intermediateStops: []
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

  const handleAddIntermediateStop = () => {
    setFormData({
      ...formData,
      intermediateStops: [
        ...formData.intermediateStops,
        { stopId: '', timeToArriveMin: '', haltTimeMin: '' }
      ]
    });
  };

  const handleRemoveIntermediateStop = (index) => {
    const updated = [...formData.intermediateStops];
    updated.splice(index, 1);
    setFormData({ ...formData, intermediateStops: updated });
  };

  const handleIntermediateStopChange = (index, field, value) => {
    const updated = [...formData.intermediateStops];
    updated[index][field] = value;
    setFormData({ ...formData, intermediateStops: updated });
  };

  const handleSubmit = async () => {
    try {
      if (editingRoute) {
        await PISService.updateBusRoute(editingRoute.id, formData);
      } else {
        await PISService.createBusRoute(formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error("Failed to save bus route:", error);
    }
  };

  const getStopName = (stopId) => {
    const stop = stops.find(s => s.id === stopId);
    return stop ? stop.name : stopId;
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Bus Route Management"
          action={
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
              Add Route
            </Button>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Route Name</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Intermediate Stops</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{getStopName(route.sourceStopId)}</TableCell>
                    <TableCell>{getStopName(route.destinationStopId)}</TableCell>
                    <TableCell>{route.intermediateStops?.length || 0}</TableCell>
                    <TableCell>{route.status}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(route)}>
                        <IconEdit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {routes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No bus routes found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingRoute ? 'Edit Bus Route' : 'Add Bus Route'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Route Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Source Stop</InputLabel>
                <Select
                  name="sourceStopId"
                  value={formData.sourceStopId}
                  label="Source Stop"
                  onChange={handleChange}
                >
                  {stops.map(stop => (
                    <MenuItem key={stop.id} value={stop.id}>{stop.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Destination Stop</InputLabel>
                <Select
                  name="destinationStopId"
                  value={formData.destinationStopId}
                  label="Destination Stop"
                  onChange={handleChange}
                >
                  {stops.map(stop => (
                    <MenuItem key={stop.id} value={stop.id}>{stop.name}</MenuItem>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deactivated">Deactivated</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="h6">Intermediate Stops</Typography>
                <Button variant="outlined" startIcon={<IconPlus />} onClick={handleAddIntermediateStop}>
                  Add Stop
                </Button>
              </Box>
            </Grid>

            {formData.intermediateStops.map((stop, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" gap={2} alignItems="center">
                  <FormControl fullWidth>
                    <InputLabel>Stop</InputLabel>
                    <Select
                      value={stop.stopId}
                      label="Stop"
                      onChange={(e) => handleIntermediateStopChange(index, 'stopId', e.target.value)}
                    >
                      {stops.map(s => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Time to Arrive (min)"
                    type="number"
                    value={stop.timeToArriveMin}
                    onChange={(e) => handleIntermediateStopChange(index, 'timeToArriveMin', e.target.value)}
                  />
                  <TextField
                    label="Halt Time (min)"
                    type="number"
                    value={stop.haltTimeMin}
                    onChange={(e) => handleIntermediateStopChange(index, 'haltTimeMin', e.target.value)}
                  />
                  <IconButton color="error" onClick={() => handleRemoveIntermediateStop(index)}>
                    <IconTrash />
                  </IconButton>
                </Box>
              </Grid>
            ))}
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

export default BusRouteManagement;
