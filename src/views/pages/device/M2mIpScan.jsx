import React, { useState, useEffect } from 'react';
import { Grid, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl, TextField, Card, CardContent, Typography, Box } from "@mui/material";
import MainCard from "../../../ui-component/cards/MainCard";
import { gridSpacing } from "../../../store/constant";
import DynamicDatatables from "../../../datatables/DynamicDatatables";
import M2mConfigServices from "../../../services/M2mConfigServices";
import DialogComponent from "../../../ui-component/DialogComponent";
import { retriveCreatedSimProvider } from "../../../helper";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const M2mIpScan = () => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [days, setDays] = useState(7);
  const [scanResult, setScanResult] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const data = await retriveCreatedSimProvider();
        setProviders(data);
      } catch (error) {
        console.error("Failed to load providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const handleScan = async () => {
    if (!selectedProvider) {
      setAlertMessage("Please select an M2M provider.");
      setAlertOpen(true);
      return;
    }
    
    if (days < 1 || days > 90) {
      setAlertMessage("Days must be between 1 and 90.");
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      const response = await M2mConfigServices.getM2mIpScan(selectedProvider, days);
      if (response.data && response.data.status === "success") {
        setScanResult(response.data);
      }
    } catch (error) {
      console.error("M2M IP Scan error:", error);
      const errorMsg = error?.response?.data?.error || "Failed to fetch scan results.";
      setAlertMessage(errorMsg);
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { name: "source_ip", label: "Source IP" },
    { name: "packet_count", label: "Packet Count" },
    { name: "device_count", label: "Device Count" },
    { 
      name: "seen_in", 
      label: "Seen In", 
      options: {
        customBodyRender: (value) => (value && Array.isArray(value)) ? value.join(", ") : value
      }
    },
    { 
      name: "status", 
      label: "Status",
      options: {
        customBodyRender: (value) => {
          if (value === 'ok') {
            return (
              <div style={{ display: 'flex', alignItems: 'center', color: 'green', fontWeight: 'bold' }}>
                <CheckCircleIcon fontSize="small" style={{ marginRight: '4px' }} /> OK
              </div>
            );
          } else {
            return (
              <div style={{ display: 'flex', alignItems: 'center', color: 'red', fontWeight: 'bold' }}>
                <CancelIcon fontSize="small" style={{ marginRight: '4px' }} /> FAKE
              </div>
            );
          }
        }
      }
    }
  ];

  return (
    <>
      <DialogComponent
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alertMessage}
        errorList={[]}
      />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "rgba(255, 255, 255, 0.5)" }}>
            <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} size={50} />
          </div>
        )}

        <Grid item xs={12}>
          <MainCard title="M2M IP Scan">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>M2M Provider</InputLabel>
                  <Select
                    value={selectedProvider}
                    label="M2M Provider"
                    onChange={(e) => setSelectedProvider(e.target.value)}
                  >
                    {providers.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={2}>
                <TextField
                  fullWidth
                  label="Days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 90 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3} md={2}>
                <Button variant="contained" color="primary" onClick={handleScan} fullWidth disabled={loading}>
                  Scan
                </Button>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {scanResult && (
          <>
            <Grid item xs={12}>
              <Grid container spacing={gridSpacing}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                    <CardContent>
                      <Typography variant="h4">Total IPs</Typography>
                      <Typography variant="h2">{scanResult.summary.total_ips}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
                    <CardContent>
                      <Typography variant="h4">OK IPs</Typography>
                      <Typography variant="h2">{scanResult.summary.ok_ips}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'error.light', color: 'error.dark' }}>
                    <CardContent>
                      <Typography variant="h4">Fake IPs</Typography>
                      <Typography variant="h2">{scanResult.summary.fake_ips}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                    <CardContent>
                      <Typography variant="h4">Devices Checked</Typography>
                      <Typography variant="h2">{scanResult.summary.devices_checked}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {scanResult.registered_ranges && scanResult.registered_ranges.length > 0 && (
              <Grid item xs={12}>
                <MainCard title="Registered Ranges">
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {scanResult.registered_ranges.map((range, idx) => (
                      <Typography key={idx} variant="body1" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        {range}
                      </Typography>
                    ))}
                  </Box>
                </MainCard>
              </Grid>
            )}

            <Grid item xs={12}>
              <DynamicDatatables tableTitle={`Scan Results for ${scanResult.provider?.company_name || 'Provider'}`} rows={scanResult.data || []} columns={columns} />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default M2mIpScan;
