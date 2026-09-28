import React, { useEffect, useState } from 'react';
import {
  Grid, Button, TextField, MenuItem, Autocomplete, Divider, Box,
  CircularProgress, Typography, Snackbar, Alert, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WhitelistService from '../../services/WhitelistService';
import StockServices from '../../services/StockServices';
import DeviceModelServices from '../../services/DeviceModelServices';
import PageHeader from '../../ui-component/cards/PageHeader';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';

const WhitelistRequestCreate = () => {
  const [requestType, setRequestType] = useState('add');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [requesterRemarks, setRequesterRemarks] = useState('');
  const [entries, setEntries] = useState([{ whitelist_type: 'ip', value: '' }]);
  const [submittingReq, setSubmittingReq] = useState(false);
  const [esimProviders, setEsimProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const fetchProviders = async () => {
    try {
      const res = await StockServices.getProviderList();
      if (res && res.data) {
        setEsimProviders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await DeviceModelServices.getAllModels();
      if (res && res.data) {
        setModels(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      showToast('Failed to fetch device models.', 'warning');
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchModels();
  }, []);

  const handleAddEntryRow = () => {
    setEntries([...entries, { whitelist_type: 'ip', value: '' }]);
  };

  const handleRemoveEntryRow = (index) => {
    const updated = entries.filter((_, idx) => idx !== index);
    setEntries(updated);
  };

  const handleEntryChange = (index, field, val) => {
    const updated = [...entries];
    updated[index][field] = val;
    setEntries(updated);
  };

  const handleSubmitRequest = async () => {
    if (!selectedProvider) {
      showToast('Please select an eSIM provider.', 'error');
      return;
    }

    const validEntries = entries.filter(e => e.value.trim() !== '');
    if (validEntries.length === 0) {
      showToast('Please add at least one entry with a non-empty value.', 'error');
      return;
    }

    if (!selectedModel) {
      showToast('Please select a device model.', 'error');
      return;
    }

    const payload = {
      request_type: requestType,
      esim_provider_id: selectedProvider.id,
      device_model_id: selectedModel.id,
      entries: validEntries,
      requester_remarks: requesterRemarks
    };

    setSubmittingReq(true);
    try {
      await WhitelistService.createRequest(payload);
      showToast('Whitelist request submitted successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/device/whitelist/requests';
      }, 1500);
    } catch (err) {
      console.error('Error submitting request:', err);
      showToast(err?.response?.data?.error || 'Failed to submit request.', 'error');
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="Create Whitelist Request" />
      </Grid>
      
      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth  label="Request Operation" value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                <MenuItem value="add">Add to Whitelist</MenuItem>
                <MenuItem value="remove">Remove from Whitelist</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                
                options={esimProviders}
                getOptionLabel={(option) => option.company_name || option.name || `Provider ID: ${option.id}`}
                value={selectedProvider}
                onChange={(event, newValue) => {
                  setSelectedProvider(newValue);
                }}
                renderInput={(params) => <TextField {...params} label="eSim Provider" required />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={models}
                getOptionLabel={(option) => option.model_name || option.name || `Model ID: ${option.id}`}
                value={selectedModel}
                loading={loadingModels}
                onChange={(event, newValue) => {
                  setSelectedModel(newValue);
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Device Model" 
                    required 
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loadingModels ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>



            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                Whitelist Entries
              </Typography>
              {entries.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField select  sx={{ width: '150px' }} value={entry.whitelist_type} onChange={(e) => handleEntryChange(index, 'whitelist_type', e.target.value)}>
                    <MenuItem value="ip">IP</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                    <MenuItem value="phone">Phone No</MenuItem>
                    <MenuItem value="apn">APN</MenuItem>
                  </TextField>
                  <TextField  fullWidth placeholder="Value" value={entry.value} onChange={(e) => handleEntryChange(index, 'value', e.target.value)} />
                  <IconButton color="error" onClick={() => handleRemoveEntryRow(index)} disabled={entries.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button  startIcon={<AddIcon />} onClick={handleAddEntryRow} sx={{ textTransform: 'none', mt: 1 }}>
                Add Another Entry
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth  multiline rows={2} label="Requester Remarks / Justification" value={requesterRemarks} onChange={(e) => setRequesterRemarks(e.target.value)} />
            </Grid>
          </Grid>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => window.location.href = "/device/whitelist/requests"} disabled={submittingReq}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSubmitRequest} disabled={submittingReq}>
              {submittingReq ? <CircularProgress size={20} color="inherit" /> : 'Submit Request'}
            </Button>
          </Box>
        </MainCard>
      </Grid>
      
      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default WhitelistRequestCreate;

