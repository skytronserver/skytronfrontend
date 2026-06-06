import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { IconEdit } from '@tabler/icons';
import PISService from '../../services/PISServices';

const BusStopManagement = () => {
  const [busStops, setBusStops] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lon: '',
    address: '',
    state: '',
    district: '',
    status: 'active'
  });

  const fetchBusStops = async () => {
    try {
      const response = await PISService.getBusStops();
      if (response.success) {
        setBusStops(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch bus stops:", error);
    }
  };

  useEffect(() => {
    fetchBusStops();
  }, []);

  const handleOpen = (stop = null) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        name: stop.name || '',
        lat: stop.location?.lat || '',
        lon: stop.location?.lon || '',
        address: stop.address || '',
        state: stop.state || '',
        district: stop.district || '',
        status: stop.status || 'active'
      });
    } else {
      setEditingStop(null);
      setFormData({
        name: '',
        lat: '',
        lon: '',
        address: '',
        state: '',
        district: '',
        status: 'active'
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
    const payload = {
      name: formData.name,
      location: { lat: parseFloat(formData.lat), lon: parseFloat(formData.lon) },
      address: formData.address,
      state: formData.state,
      district: formData.district,
      status: formData.status
    };

    try {
      if (editingStop) {
        await PISService.updateBusStop(editingStop.id, payload);
      } else {
        await PISService.createBusStop(payload);
      }
      fetchBusStops();
      handleClose();
    } catch (error) {
      console.error("Failed to save bus stop:", error);
    }
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Bus Stop Management"
          action={
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
              Add Bus Stop
            </Button>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Location (Lat, Lon)</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {busStops.map((stop) => (
                  <TableRow key={stop.id}>
                    <TableCell>{stop.name}</TableCell>
                    <TableCell>{`${stop.location?.lat || ''}, ${stop.location?.lon || ''}`}</TableCell>
                    <TableCell>{stop.address}</TableCell>
                    <TableCell>{stop.state}</TableCell>
                    <TableCell>{stop.district}</TableCell>
                    <TableCell>{stop.status}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(stop)}>
                        <IconEdit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {busStops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No bus stops found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStop ? 'Edit Bus Stop' : 'Add Bus Stop'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stop Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="lat"
                type="number"
                value={formData.lat}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="lon"
                type="number"
                value={formData.lon}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                fullWidth
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="deactivated">Deactivated</MenuItem>
              </Select>
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

export default BusStopManagement;
