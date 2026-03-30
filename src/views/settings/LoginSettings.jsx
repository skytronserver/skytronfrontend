import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
  Typography,
  Paper
} from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import UserServices from '../../services/UserServices';

const ROLE_OPTIONS = [
  'superadmin',
  'stateadmin',
  'devicemanufacture',
  'dtorto',
  'esimprovider',
  'dealer',
  'owner',
  'sosadmin',
  'sosexecutive'
];

const LoginSettings = () => {
  const [formData, setFormData] = useState({
    user_role: '',
    daily_login_limit: '',
    session_expiry_minutes: '',
    max_simultaneous_sessions: '',
    login_start_time: '',
    login_end_time: '',
    enforce_time_boundary: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.user_role) {
      setSnackbar({ open: true, message: 'Please select a user role.', severity: 'error' });
      return;
    }

    const payload = {
      user_role: formData.user_role,
      daily_login_limit: Number(formData.daily_login_limit) || 0,
      session_expiry_minutes: Number(formData.session_expiry_minutes) || 0,
      max_simultaneous_sessions: Number(formData.max_simultaneous_sessions) || 0,
      login_start_time: formData.login_start_time,
      login_end_time: formData.login_end_time,
      enforce_time_boundary: Boolean(formData.enforce_time_boundary)
    };

    try {
      setSubmitting(true);
      await UserServices.setLoginSettings(payload);
      setSnackbar({ open: true, message: 'Login settings saved successfully.', severity: 'success' });
    } catch (error) {
      console.error('Error saving login settings:', error);
      setSnackbar({ open: true, message: 'Failed to save login settings.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <MainCard title="Login Settings">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Configure login limits and allowed time window per role.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="User Role"
                name="user_role"
                value={formData.user_role}
                onChange={handleChange}
                required
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role === 'esimprovider' ? 'm2m provider' : role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Daily Login Limit"
                name="daily_login_limit"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.daily_login_limit}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Session Expiry (minutes)"
                name="session_expiry_minutes"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.session_expiry_minutes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Max Simultaneous Sessions"
                name="max_simultaneous_sessions"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.max_simultaneous_sessions}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Login Start Time (HH:MM:SS)"
                name="login_start_time"
                value={formData.login_start_time}
                onChange={handleChange}
                placeholder="08:00:00"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Login End Time (HH:MM:SS)"
                name="login_end_time"
                value={formData.login_end_time}
                onChange={handleChange}
                placeholder="18:00:00"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="enforce_time_boundary"
                    checked={Boolean(formData.enforce_time_boundary)}
                    onChange={handleChange}
                  />
                }
                label="Enforce time boundary"
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default LoginSettings;
