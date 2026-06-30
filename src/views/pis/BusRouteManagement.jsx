import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, Select, TextField, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  FormControl, InputLabel, Divider
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons';
import PISService from '../../services/PISServices';
import { retriveStateList, retriveDistrictList } from '../../helper';

const emptyStop = { stop_id: '', order: '', arrival_time_min: '', halt_time_min: '' };

const BusRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [busStops, setBusStops] = useState([]);   // for dropdowns
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    route_number: '',
    state: '',
    district: '',
    source_stop: '',
    destination_stop: '',
    stops_data: [{ ...emptyStop }],
    route_path: [{ lat: '', lng: '' }],
  });

  const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success'
});

const showSnackbar = (message, severity = 'success') => {
  setSnackbar({
    open: true,
    message,
    severity
  });
};

const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};

  // Route Name
  if (!formData.name.trim()) {
    newErrors.name = 'Route Name is required';
  }

  // Route Number
  if (!formData.route_number.trim()) {
    newErrors.route_number = 'Route Number is required';
  }

  // State
  if (!formData.state) {
    newErrors.state = 'State is required';
  }

  // District
  if (!formData.district) {
    newErrors.district = 'District is required';
  }

  // Source Stop
  if (!formData.source_stop) {
    newErrors.source_stop = 'Source Stop is required';
  }

  // Destination Stop
  if (!formData.destination_stop) {
    newErrors.destination_stop = 'Destination Stop is required';
  }

  // Source and Destination should not be same
  if (
    formData.source_stop &&
    formData.destination_stop &&
    formData.source_stop === formData.destination_stop
  ) {
    newErrors.destination_stop =
      'Source and Destination cannot be same';
  }

  // Route Path Validation
  formData.route_path.forEach((point, index) => {
    if (!point.lat) {
      newErrors[`lat_${index}`] = 'Latitude required';
    }

    if (!point.lng) {
      newErrors[`lng_${index}`] = 'Longitude required';
    }
  });

  // Stops Validation
  formData.stops_data.forEach((stop, index) => {
    if (!stop.stop_id) {
      newErrors[`stop_id_${index}`] = 'Stop required';
    }

    if (!stop.order) {
      newErrors[`order_${index}`] = 'Order required';
    }

    if (
      stop.arrival_time_min === '' ||
      stop.arrival_time_min === null
    ) {
      newErrors[`arrival_${index}`] = 'Arrival time required';
    }

    if (
      stop.halt_time_min === '' ||
      stop.halt_time_min === null
    ) {
      newErrors[`halt_${index}`] = 'Halt time required';
    }
  });

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  // ── load initial data ──────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const [routeRes, stopRes, stateList] = await Promise.all([
        PISService.getBusRoutes(),
        PISService.getActiveBusStops(),
        retriveStateList(),
      ]);
      if (routeRes.success) setRoutes(routeRes.data);
      if (stopRes.success) setBusStops(stopRes.data);
      setStates(stateList || []);
    };
    init();
  }, []);

  // ── load districts when state changes ─────────────────────────
  useEffect(() => {
    if (formData.state) {
      retriveDistrictList({ state: formData.state }).then(list => setDistricts(list || []));
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

  // ── refresh list ───────────────────────────────────────────────
  const fetchRoutes = async () => {
    const res = await PISService.getBusRoutes();
    if (res.success) setRoutes(res.data);
  };

  // ── open / close dialog ────────────────────────────────────────
  const handleOpen = async (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name || '',
        route_number: route.route_number || '',
        state: route.state || '',
        district: route.district || '',
        source_stop: route.source_stop || '',
        destination_stop: route.destination_stop || '',
        stops_data: route.route_stops?.length 
          ? route.route_stops.map(s => ({
              stop_id: s.stop || s.stop_id,
              order: s.order,
              arrival_time_min: s.arrival_time_min,
              halt_time_min: s.halt_time_min
            }))
          : route.stops_data?.length 
            ? route.stops_data 
            : [{ ...emptyStop }],
        route_path: route.route_path?.length ? route.route_path : [{ lat: '', lng: '' }],
      });
      if (route.state) {
        const list = await retriveDistrictList({ state: route.state });
        setDistricts(list || []);
      }
    } else {
      setEditingRoute(null);
      setFormData({
        name: '', route_number: '', state: '', district: '',
        source_stop: '', destination_stop: '',
        stops_data: [{ ...emptyStop }],
        route_path: [{ lat: '', lng: '' }],
      });
      setDistricts([]);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // ── field changes ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ── stops_data row helpers ─────────────────────────────────────
  const handleAddStop = () =>
    setFormData(prev => ({ ...prev, stops_data: [...prev.stops_data, { ...emptyStop }] }));

  const handleRemoveStop = (i) =>
    setFormData(prev => ({ ...prev, stops_data: prev.stops_data.filter((_, idx) => idx !== i) }));

  const handleStopChange = (i, field, value) =>
    setFormData(prev => {
      const updated = [...prev.stops_data];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, stops_data: updated };
    });

  // ── route_path helpers ─────────────────────────────────────────
  const handleAddPathPoint = () =>
    setFormData(prev => ({ ...prev, route_path: [...prev.route_path, { lat: '', lng: '' }] }));

  const handleRemovePathPoint = (i) =>
    setFormData(prev => ({ ...prev, route_path: prev.route_path.filter((_, idx) => idx !== i) }));

  const handlePathPointChange = (i, field, value) =>
    setFormData(prev => {
      const updated = [...prev.route_path];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, route_path: updated };
    });

  // ── submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) {
    showSnackbar(
      'Please fill all required fields correctly',
      'error'
    );
    return;
  }
    const payload = {
      name: formData.name,
      route_number: formData.route_number,
      state: formData.state,
      district: formData.district,
      source_stop: formData.source_stop,
      destination_stop: formData.destination_stop,
      route_path: formData.route_path
        .filter(p => p.lat !== '' && p.lng !== '')
        .map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) })),
      stops_data: formData.stops_data.map((s, idx) => ({
        stop_id: s.stop_id,
        order: s.order || idx + 1,
        arrival_time_min: Number(s.arrival_time_min),
        halt_time_min: Number(s.halt_time_min),
      })),
    };

    try {
      if (editingRoute) {
        await PISService.updateBusRoute(editingRoute.id, payload);
        showSnackbar(
        'Bus Route updated successfully',
        'success'
      );
      } else {
        await PISService.createBusRoute(payload);
        showSnackbar(
        'Bus Route created successfully',
        'success'
      );
      }
      await fetchRoutes();
      handleClose();
    } catch (error) {
      const apiErrors = error?.response?.data;

  if (apiErrors) {
    const firstError = Object.values(apiErrors)?.flat()?.[0];

    showSnackbar(
      firstError || "Something went wrong",
      "error"
    );
  } else {
    showSnackbar(
      "Something went wrong",
      "error"
    );
  }
    }
  };

  // ── toggle ─────────────────────────────────────────────────────
  const handleToggle = async (route) => {
    try {
      await PISService.toggleBusRoute(route.id);
      await fetchRoutes();
    } catch (error) {
      console.error("Failed to toggle route:", error);
    }
  };

  // ── helpers ────────────────────────────────────────────────────
  const getStopName = (id) => busStops.find(s => s.id === id)?.name || id;

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
                  <TableCell>Route No.</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Stops</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.route_number}</TableCell>
                    <TableCell>{route.source_stop_name || getStopName(route.source_stop)}</TableCell>
                    <TableCell>{route.destination_stop_name || getStopName(route.destination_stop)}</TableCell>
                    <TableCell>{route.route_stops?.length ?? route.stops_data?.length ?? route.stops?.length ?? 0}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: route.status === 'active' ? '#e6f9ed' : '#fdecea',
                        color: route.status === 'active' ? '#1a7f3c' : '#c62828',
                      }}>
                        {route.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(route)} title="Edit">
                        <IconEdit />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleToggle(route)}
                        style={{
                          marginLeft: 6,
                          borderColor: route.status === 'active' ? '#c62828' : '#1a7f3c',
                          color: route.status === 'active' ? '#c62828' : '#1a7f3c',
                          fontSize: 11, padding: '2px 10px', minWidth: 'unset'
                        }}
                      >
                        {route.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {routes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No bus routes found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingRoute ? 'Edit Bus Route' : 'Add Bus Route'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>

            {/* Basic Info */}
            <Grid item xs={8}>
              <TextField fullWidth label="Route Name" name="name"
                value={formData.name} onChange={handleChange}  error={!!errors.name}
  helperText={errors.name}/>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Route Number" name="route_number"
                value={formData.route_number} onChange={handleChange}  error={!!errors.route_number}
  helperText={errors.route_number}/>
            </Grid>

            {/* State / District */}
            <Grid item xs={6}>
              <FormControl fullWidth  error={!!errors.state}>
                <InputLabel>State</InputLabel>
                <Select name="state" value={formData.state} label="State" onChange={handleChange}>
                  {states.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
                {errors.state && (
  <Typography color="error" variant="caption">
    {errors.state}
  </Typography>
)}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth  error={!!errors.district}>
                <InputLabel>District</InputLabel>
                <Select name="district" value={formData.district} label="District"
                  onChange={handleChange} disabled={!formData.state}>
                  {districts.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                </Select>
                {errors.district && (
  <Typography color="error" variant="caption">
    {errors.district}
  </Typography>
)}
              </FormControl>
            </Grid>

            {/* Source / Destination */}
            <Grid item xs={6}>
              <FormControl fullWidth error={!!errors.source_stop}>
                <InputLabel>Source Stop</InputLabel>
                <Select name="source_stop" value={formData.source_stop}
                  label="Source Stop" onChange={handleChange}>
                  {busStops.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
                {errors.source_stop && (
  <Typography color="error" variant="caption">
    {errors.source_stop}
  </Typography>
)}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth error={!!errors.destination_stop}>
                <InputLabel>Destination Stop</InputLabel>
                <Select name="destination_stop" value={formData.destination_stop}
                  label="Destination Stop" onChange={handleChange}>
                  {busStops.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
                {errors.destination_stop && (
  <Typography color="error" variant="caption">
    {errors.destination_stop}
  </Typography>
)}
              </FormControl>
            </Grid>

            {/* Route Path */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>Route Path (Waypoints)</Typography>
                <Button variant="outlined" size="small" startIcon={<IconPlus />} onClick={handleAddPathPoint}>
                  Add Point
                </Button>
              </Box>
            </Grid>

            {formData.route_path.map((point, i) => (
              <Grid item xs={12} key={i}>
                <Box display="flex" gap={1} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 24, color: 'text.secondary' }}>{i + 1}.</Typography>
                  <TextField size="small" label="Latitude" type="number" sx={{ flex: 1 }}
                    value={point.lat} error={!!errors[`lat_${i}`]}
  helperText={errors[`lat_${i}`]}
                    onChange={(e) => handlePathPointChange(i, 'lat', e.target.value)} />
                  <TextField size="small" label="Longitude" type="number" sx={{ flex: 1 }}
                    value={point.lng} error={!!errors[`lng_${i}`]}
  helperText={errors[`lng_${i}`]}
                    onChange={(e) => handlePathPointChange(i, 'lng', e.target.value)} />
                  <IconButton color="error" onClick={() => handleRemovePathPoint(i)} disabled={formData.route_path.length === 1}>
                    <IconTrash size={18} />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            {/* Stops Data */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>Route Stops</Typography>
                <Button variant="outlined" size="small" startIcon={<IconPlus />} onClick={handleAddStop}>
                  Add Stop
                </Button>
              </Box>
            </Grid>

            {formData.stops_data.map((stop, i) => (
              <Grid item xs={12} key={i}>
                <Box display="flex" gap={1} alignItems="center">
                  <FormControl sx={{ minWidth: 180 }} error={!!errors[`stop_id_${i}`]}>
                    <InputLabel>Stop</InputLabel>
                    <Select size="small" value={stop.stop_id} label="Stop"
                      onChange={(e) => handleStopChange(i, 'stop_id', e.target.value)}>
                      {busStops.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                    {errors[`stop_id_${i}`] && (
                      <Typography color="error" variant="caption">
                        {errors[`stop_id_${i}`]}
                      </Typography>
                    )}
                  </FormControl>
                  <TextField size="small" label="Order" type="number" sx={{ width: 80 }}
                    value={stop.order}
                    onChange={(e) => handleStopChange(i, 'order', e.target.value)} />
                  <TextField size="small" label="Arrival (min)" type="number" sx={{ width: 120 }}
                    value={stop.arrival_time_min}
                    onChange={(e) => handleStopChange(i, 'arrival_time_min', e.target.value)} />
                  <TextField size="small" label="Halt (min)" type="number" sx={{ width: 100 }}
                    value={stop.halt_time_min}
                    onChange={(e) => handleStopChange(i, 'halt_time_min', e.target.value)} />
                  <IconButton color="error" onClick={() => handleRemoveStop(i)}>
                    <IconTrash size={18} />
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
      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={() =>
    setSnackbar((prev) => ({
      ...prev,
      open: false
    }))
  }
  anchorOrigin={{
    vertical: 'top',
    horizontal: 'right'
  }}
>
  <Alert
    severity={snackbar.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
};

export default BusRouteManagement;
