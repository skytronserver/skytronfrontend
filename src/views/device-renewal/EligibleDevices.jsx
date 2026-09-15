import React, { useState, useEffect } from 'react';
import { Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Snackbar } from "@mui/material";
import { gridSpacing } from "../../store/constant";
import DynamicDatatables from '../../datatables/DynamicDatatables';
import DeviceRenewalService from '../../services/DeviceRenewalService';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../store/constant'; // used for file download if needed

const EligibleDevices = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };
  
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [duration, setDuration] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const fetchEligibleDevices = async () => {
    setLoading(true);
    try {
      // Using page_size 100 to get maximum eligible devices for simple client-side pagination
      const res = await DeviceRenewalService.getEligibleDevices({ page: 1, page_size: 100 });
      if (res.data?.status === 'success') {
        setDevices(res.data.data);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error('Failed to fetch eligible devices', error);
      showToast('Failed to load eligible devices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleDevices();
  }, []);

  const handleOpenModal = (device) => {
    setSelectedDevice(device);
    setDuration(1);
    setSuccessData(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDevice(null);
    if (successData) {
      fetchEligibleDevices();
    }
  };

  const handleSubmitRenewal = async () => {
    setSubmitting(true);
    try {
      const res = await DeviceRenewalService.submitRenewal({
        device_id: selectedDevice.id,
        requested_duration_years: duration
      });
      
      if (res.data?.status === 'success') {
        showToast(res.data.message || 'Renewal successful!', 'success');
        setSuccessData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to submit renewal', error);
      showToast(error.response?.data?.message || 'Failed to submit renewal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { name: "imei", label: "IMEI" },
    { name: "iccid", label: "ICCID" },
    { name: "model_name", label: "Model" },
    { name: "manufacturer_name", label: "Manufacturer" },
    { name: "dealer_name", label: "Dealer" },
    { name: "esim_validity", label: "eSIM Expiry", options: {
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }},
    { name: "days_to_expiry", label: "Days Left" },
    { name: "days_since_activation", label: "Age (Days)" },
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const device = devices[tableMeta.rowIndex];
          return (
            <Button variant="contained" color="primary" size="small" onClick={() => handleOpenModal(device)}>
              Renew
            </Button>
          );
        },
      },
    },
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {loading ? (
          <CircularProgress />
        ) : (
          <DynamicDatatables 
            tableTitle="Devices Eligible for Renewal (Next 60 Days)" 
            rows={devices} 
            columns={columns} 
          />
        )}
      </Grid>

      {/* Renewal Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Renew eSIM Validity</DialogTitle>
        <DialogContent>
          {successData ? (
             <Alert severity="success" sx={{ mt: 2 }}>
               Renewal successful! New validity: {new Date(successData.new_esim_validity).toLocaleDateString()}. <br/>
               {successData.certificate_file_path && (
                 <a href={`${BASE_URL}/${successData.certificate_file_path}`} target="_blank" rel="noopener noreferrer">
                   Download Certificate
                 </a>
               )}
             </Alert>
          ) : (
            <>
              {selectedDevice && (
                <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                  <strong>IMEI:</strong> {selectedDevice.imei} <br/>
                  <strong>ICCID:</strong> {selectedDevice.iccid} <br/>
                  <strong>Current Expiry:</strong> {new Date(selectedDevice.esim_validity).toLocaleDateString()}
                </div>
              )}
              <FormControl fullWidth margin="normal">
                <InputLabel id="duration-label">Renewal Duration</InputLabel>
                <Select
                  labelId="duration-label"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  label="Renewal Duration"
                >
                  <MenuItem value={1}>1 Year</MenuItem>
                  <MenuItem value={2}>2 Years</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            {successData ? "Close" : "Cancel"}
          </Button>
          {!successData && (
            <Button onClick={handleSubmitRenewal} color="primary" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : "Submit Renewal"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default EligibleDevices;
