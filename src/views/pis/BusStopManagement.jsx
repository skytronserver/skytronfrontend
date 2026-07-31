/* eslint-disable no-unused-vars */
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
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { IconEdit, IconMapPin } from '@tabler/icons';
import PISService from '../../services/PISServices';
import { retriveStateList, retriveDistrictList } from '../../helper';

const BusStopManagement = () => {
  const [busStops, setBusStops] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    state: '',
    district: '',
  });

  const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "error",
});

const showSnackbar = (message, severity = "error") => {
  setSnackbar({
    open: true,
    message,
    severity,
  });
};
const [errors, setErrors] = useState({});

const validateForm = () => {
  const validationErrors = [];

  if (!formData.name?.trim()) {
    validationErrors.push("Stop Name is required");
  }

  if (!formData.latitude) {
    validationErrors.push("Latitude is required");
  }

  if (!formData.longitude) {
    validationErrors.push("Longitude is required");
  }

  if (!formData.address?.trim()) {
    validationErrors.push("Address is required");
  }

  if (!formData.state) {
    validationErrors.push("State is required");
  }

  if (!formData.district) {
    validationErrors.push("District is required");
  }

  if (validationErrors.length > 0) {
    showSnackbar(validationErrors.join(" | "), "error");
    return false;
  }

  return true;
};
  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      const list = await retriveStateList();
      setStates(list || []);
    };
    loadStates();
    fetchBusStops();
  }, []);

  // Load districts whenever state changes
  useEffect(() => {
    if (formData.state) {
      const loadDistricts = async () => {
        const list = await retriveDistrictList({ state: formData.state });
        setDistricts(list || []);
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

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

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6).toString(),
            longitude: position.coords.longitude.toFixed(6).toString()
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleOpen = async (stop = null) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        name: stop.name || '',
        latitude: stop.latitude || '',
        longitude: stop.longitude || '',
        address: stop.address || '',
        state: stop.state || '',
        district: stop.district || '',
      });
      // Pre-load districts for the selected state
      if (stop.state) {
        const list = await retriveDistrictList({ state: stop.state });
        setDistricts(list || []);
      }
    } else {
      setEditingStop(null);
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        address: '',
        state: '',
        district: '',
      });
      setDistricts([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
    ...prev,
    [name]: ""
  }));
    // Reset district when state changes
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
      setErrors((prev) => ({
      ...prev,
      state: "",
      district: ""
    }));

    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const payload = {
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address,
      state: formData.state,       // integer ID
      district: formData.district, // integer ID
    };

    try {
      if (editingStop) {
        await PISService.updateBusStop(editingStop.id, payload);
        showSnackbar("Bus Stop updated successfully", "success");
      } else {
        await PISService.createBusStop(payload);
        showSnackbar("Bus Stop created successfully", "success");
      }
      fetchBusStops();
      handleClose();
    } catch (error) {
      console.error("Failed to save bus stop:", error);
      if (error?.response?.data) {
    const apiErrors = error.response.data;

    const errorMessage = Object.entries(apiErrors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join(" | ");

    showSnackbar(errorMessage, "error");
  } else {
    showSnackbar("Failed to save bus stop", "error");
  }
    }
  };

  // Helper to resolve label from id for display
  const getStateLabel = (id) => states.find(s => s.value === id)?.label || id;
  const getDistrictLabel = (id) => districts.find(d => d.value === id)?.label || id;

  const handleToggle = async (stop) => {
    try {
      await PISService.toggleBusStop(stop.id);
      fetchBusStops();
    } catch (error) {
      console.error("Failed to toggle bus stop status:", error);
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
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>
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
                    <TableCell>{stop.latitude || ''}</TableCell>
                    <TableCell>{stop.longitude || ''}</TableCell>
                    <TableCell>{stop.address}</TableCell>
                    <TableCell>{stop.state_name || stop.state}</TableCell>
                    <TableCell>{stop.district_name || stop.district}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        background: stop.status === 'active' ? '#e6f9ed' : '#fdecea',
                        color: stop.status === 'active' ? '#1a7f3c' : '#c62828',
                      }}>
                        {stop.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(stop)} title="Edit">
                        <IconEdit />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleToggle(stop)}
                        style={{
                          marginLeft: 6,
                          borderColor: stop.status === 'active' ? '#c62828' : '#1a7f3c',
                          color: stop.status === 'active' ? '#c62828' : '#1a7f3c',
                          fontSize: 11,
                          padding: '2px 10px',
                          minWidth: 'unset'
                        }}
                      >
                        {stop.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
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
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Use My Location">
                        <IconButton onClick={handleUseMyLocation} edge="end">
                          <IconMapPin size={20} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Use My Location">
                        <IconButton onClick={handleUseMyLocation} edge="end">
                          <IconMapPin size={20} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
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
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  label="State"
                  onChange={handleChange}
                >
                  {states.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>District</InputLabel>
                <Select
                  name="district"
                  value={formData.district}
                  label="District"
                  onChange={handleChange}
                  disabled={!formData.state}
                >
                  {districts.map((d) => (
                    <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                  ))}
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
      <Snackbar
  open={snackbar.open}
  autoHideDuration={5000}
  onClose={() =>
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }))
  }
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
>
  <Alert
    severity={snackbar.severity}
    onClose={() =>
      setSnackbar((prev) => ({
        ...prev,
        open: false,
      }))
    }
    variant="filled"
    sx={{ width: "100%" }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
};

export default BusStopManagement;
