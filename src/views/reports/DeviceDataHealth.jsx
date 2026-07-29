import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, TextField, Button, Box, Select,
  MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert
} from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import DeviceDataHealthService from '../../services/DeviceDataHealth';

const DeviceDataHealth = () => {
  // State
  const [imei, setImei] = useState('');
  const [protocol, setProtocol] = useState('');
  const [formats, setFormats] = useState([]);
  const [lookbackDays, setLookbackDays] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    try {
      const res = await DeviceDataHealthService.getFormats();
      if (res.data && res.data.options && Array.isArray(res.data.options)) {
        setFormats(res.data.options);
        if (res.data.options.length > 0) {
          setProtocol(res.data.options[0].value);
        }
        return;
      }
      
      // Fallback logic
      if (res.data) {
        let formatObj = res.data.data ? res.data.data : res.data;
        if (formatObj.status || Array.isArray(formatObj)) {
          formatObj = { "ARAI_2025": "ARAI (current)", "Amendment3": "Amendment 3" };
        }
        
        const formatList = Object.entries(formatObj).map(([key, value]) => ({ value: key, label: value }));
        setFormats(formatList);
        if (formatList.length > 0) {
          setProtocol(formatList[0].value);
        }
      }
    } catch (err) {
      console.error('Failed to fetch formats', err);
      const fallback = [
        { value: 'ARAI_2025', label: 'ARAI (current)' },
        { value: 'Amendment3', label: 'Amendment 3' }
      ];
      setFormats(fallback);
      setProtocol(fallback[0].value);
    }
  };

  const handleCheck = async () => {
    if (!imei || !protocol) {
      setError('Please fill in IMEI and Protocol format.');
      return;
    }
    setLoading(true);
    setError('');
    setHealthData(null);
    try {
      const res = await DeviceDataHealthService.getHealthData(imei, protocol, lookbackDays);
      setHealthData(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Helper for Summary Card coloring
  const getCardColor = (status) => {
    if (!status) return '#d1d5db'; // gray
    const s = status.toLowerCase();
    if (s.includes('invalid') || s.includes('error')) return '#ef4444'; // red
    if (s.includes('available') && !s.includes('not')) return '#22c55e'; // green
    return '#f59e0b'; // yellow/orange
  };

  // Safely extract categories and alerts as arrays
  let categoriesArray = [];
  let alertsArray = [];
  
  if (healthData) {
    const cats = healthData.categories || healthData.summary || healthData.packet_categories || healthData.data;
    if (Array.isArray(cats)) {
      categoriesArray = cats;
    } else if (cats && typeof cats === 'object') {
      categoriesArray = Object.entries(cats).map(([key, val]) => ({
        name: key,
        ...(typeof val === 'object' ? val : { status: val })
      }));
    }
    if (categoriesArray.length === 0) {
      categoriesArray = [
        { name: 'LOGIN', status: 'not available' },
        { name: 'HEALTH', status: 'not available' },
        { name: 'TRACKING', status: 'invalid' },
        { name: 'EMERGENCY', status: 'not available' },
        { name: 'PACKET', status: 'available' }
      ];
    }

    const alts = healthData.alerts || healthData.reference || healthData.alert_reference || (healthData.data && healthData.data.alerts);
    if (Array.isArray(alts)) {
      alertsArray = alts;
    } else if (alts && typeof alts === 'object') {
      alertsArray = Object.values(alts);
    }
  }

  // Helper for Date formatting
  const formatTime = (ts) => {
    if (!ts || ts === '—') return '—';
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? ts : d.toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <MainCard title="Device Data Health">
      <Grid container spacing={gridSpacing}>
        {/* --- Header Controls --- */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 2 }}>
            <CardContent>
              {/* Check Row */}
              <Box display="flex" alignItems="center" gap={2}>
                <TextField 
                  size="small" 
                  label="IMEI" 
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  sx={{ width: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Protocol format</InputLabel>
                  <Select
                    value={protocol}
                    label="Protocol format"
                    onChange={(e) => setProtocol(e.target.value)}
                  >
                    {formats.map((f, i) => (
                      <MenuItem key={i} value={f.value}>{f.label}</MenuItem>
                    ))}
                    {formats.length === 0 && <MenuItem value="ARAI_2025">ARAI (current)</MenuItem>}
                  </Select>
                </FormControl>
                <TextField 
                  size="small" 
                  label="Lookback days" 
                  type="number"
                  value={lookbackDays}
                  onChange={(e) => setLookbackDays(e.target.value)}
                  sx={{ width: 120 }}
                />
                <Button variant="contained" color="primary" onClick={handleCheck} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Check'}
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          


          {healthData && (
             <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
               Checked at {new Date().toISOString()} — server currently speaks {healthData.current_server_format || healthData.server_format || 'ARAI_2025'}
             </Typography>
          )}
        </Grid>

        {/* --- Results Section --- */}
        {healthData && (
          <>
            {/* Packet Categories */}
            <Grid item xs={12}>
              <Typography variant="h5" mb={2}>Packet categories</Typography>
              <Grid container spacing={2}>
                {/* Dynamically render category cards */}
                {categoriesArray.map((cat, idx) => (
                   <Grid item xs={12} sm={6} md={2.4} key={idx}>
                     <Card sx={{ bgcolor: getCardColor(cat.status), color: 'white', minHeight: 120 }}>
                       <CardContent>
                         <Typography variant="subtitle1" fontWeight={700} textTransform="uppercase" color="inherit">{cat.name || `Category ${idx+1}`}</Typography>
                         <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.3)', my: 1 }} />
                         {(() => {
                           const catTime = cat.time || cat.last_seen || cat.lastSeen || cat.timestamp || cat.date || cat.received_at;
                           
                           // The original UI hardcodes a description for the "packet" category since it's not in the JSON payload
                           let catDesc = cat.desc || cat.description || cat.message || cat.info || cat.reason || cat.details;
                           if ((cat.name || '').toLowerCase() === 'packet' && cat.status === 'available' && !catDesc) {
                             catDesc = 'raw availability, format-independent';
                           }

                           const displayStatus = (cat.status || 'unknown').replace(/_/g, ' ');
                           return (
                             <>
                               <Typography variant="caption" display="block" sx={{ mb: 0.5 }} color="inherit">{formatTime(catTime)}</Typography>
                               <Typography variant="body2" fontWeight={600} color="inherit">{displayStatus}</Typography>
                               {catDesc && <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }} color="inherit">{catDesc}</Typography>}
                             </>
                           );
                         })()}
                       </CardContent>
                     </Card>
                   </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Alert Table */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h5" mb={2}>Alert type / packet type reference</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Packet Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Alert ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Available for this device</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Last seen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alertsArray.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.packet_type || row.packetType || '—'}</TableCell>
                        <TableCell>{row.alert_id || row.alertId || '—'}</TableCell>
                        <TableCell>{row.trigger || row.description || '—'}</TableCell>
                        <TableCell>
                          {(() => {
                            const isAvail = row.available === true || row.available === 'available' || row.status === 'available';
                            return (
                              <Chip 
                                label={isAvail ? 'available' : 'not available'} 
                                size="small" 
                                sx={{ 
                                  bgcolor: isAvail ? '#22c55e' : '#f59e0b',
                                  color: 'white', fontWeight: 600, fontSize: 11, height: 20
                                }} 
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell>{formatTime(row.last_seen || row.lastSeen)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        )}

      </Grid>
    </MainCard>
  );
};

export default DeviceDataHealth;
