/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Box,
  Typography,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { getAxiosInstance } from '../../services/axiosInstance';

const SendCommandPopup = ({ open, handleClose }) => {
  const [filterType, setFilterType] = useState('registration');
  const [filterValue, setFilterValue] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const [activeCommands, setActiveCommands] = useState([]);
  const [selectedCommandId, setSelectedCommandId] = useState('');
  
  const [actionType, setActionType] = useState('');
  const [valueSelection, setValueSelection] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [valueSuggestions, setValueSuggestions] = useState([]);
  const [source, setSource] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchActiveCommands();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFilterType('registration');
    setFilterValue('');
    setSelectedDevice(null);
    setDeviceOptions([]);
    setSelectedCommandId('');
    setActionType('');
    setValueSelection('');
    setCustomValue('');
    setValueSuggestions([]);
    setSource('');
  };

  const fetchActiveCommands = async () => {
    try {
      const axios = getAxiosInstance();
      const response = await axios.post('/api/ota/command/filter/', { status: 'active' });
      if (response.data?.status === 'success') {
        setActiveCommands(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching active commands:", error);
    }
  };

  const fetchDeviceOptions = async (query) => {
    if (!query) {
      setDeviceOptions([]);
      return;
    }
    setLoadingDevices(true);
    try {
      const axios = getAxiosInstance();
      const paramMap = {
        registration: 'vehicle_reg_no',
        owner: 'owner_name',
        imei: 'imei',
        dealer_name: 'dealer_name',
        manufacturer_name: 'manufacturer_name',
        district: 'district',
      };
      const paramName = paramMap[filterType] || 'vehicle_reg_no';
      const response = await axios.get(`/api/ota/command/device-search/?${paramName}=${query}`);
      if (response.data?.status === 'success') {
        setDeviceOptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoadingDevices(false);
    }
  };

  const fetchValueSuggestions = async (otaId) => {
    try {
      const axios = getAxiosInstance();
      const response = await axios.get(`/api/ota/command/value-suggestions/?ota_id=${otaId}`);
      if (response.data?.status === 'success') {
        setValueSuggestions(response.data.data.map(v => v.value));
      }
    } catch (error) {
      console.error("Error fetching value suggestions:", error);
    }
  };

  const handleCommandChange = (e) => {
    const cmdId = e.target.value;
    setSelectedCommandId(cmdId);
    setActionType('');
    setValueSelection('');
    setCustomValue('');
    setSource('');
  };

  const handleActionChange = (e) => {
    const act = e.target.value;
    setActionType(act);
    setValueSelection('');
    setCustomValue('');
    if (act === 'set' && selectedCommandId) {
      fetchValueSuggestions(selectedCommandId);
    }
  };

  const selectedCommand = activeCommands.find(c => c.id === selectedCommandId);

  const handleSubmit = async () => {
    if (!selectedCommand || !selectedDevice || !actionType) return;
    
    setSubmitting(true);
    try {
      const axios = getAxiosInstance();
      const payload = {
        ota_id: selectedCommand.id,
        device_tag_id: selectedDevice.device_tag_id,
        imei: selectedDevice.imei,
        command_type: actionType,
      };

      if (actionType === 'set') {
        payload.value = valueSelection === 'others' ? customValue : valueSelection;
      }

      if (selectedCommand.allowed_source === 'both') {
        payload.source = source;
      } else {
        payload.source = selectedCommand.allowed_source;
      }

      await axios.post('/api/ota/command/send/', payload);
      handleClose();
    } catch (error) {
      console.error("Error sending command:", error);
      alert(error.response?.data?.message || "Error sending command");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send OTA Command</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          
          <Typography variant="subtitle1" fontWeight="bold">Filter Device</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterType}
                label="Filter By"
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterValue('');
                  setSelectedDevice(null);
                  setDeviceOptions([]);
                }}
              >
                <MenuItem value="registration">Registration No</MenuItem>
                <MenuItem value="owner">Owner Name</MenuItem>
                <MenuItem value="imei">IMEI</MenuItem>
                <MenuItem value="dealer_name">Dealer RFC(Retro Fitment Center) Name</MenuItem>
                <MenuItem value="manufacturer_name">Manufacturer Name</MenuItem>
                <MenuItem value="district">District</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              options={deviceOptions}
              getOptionLabel={(option) => {
                if (!option) return '';
                if (filterType === 'registration') return option.vehicle_reg_no || '';
                if (filterType === 'owner') return option.owner_name || '';
                if (filterType === 'imei') return option.imei || '';
                if (filterType === 'dealer_name') return option.dealer_name || '';
                if (filterType === 'manufacturer_name') return option.manufacturer_name || '';
                if (filterType === 'district') return option.district || '';
                return option.vehicle_reg_no || option.owner_name || '';
              }}
              filterOptions={(x) => x} // Disable local filtering
              renderOption={(props, option) => (
                <li {...props} key={option.imei}>
                  <Box>
                    <Typography variant="body2">{option.vehicle_reg_no} - {option.owner_name}</Typography>
                    <Typography variant="caption" color="textSecondary">IMEI: {option.imei}</Typography>
                  </Box>
                </li>
              )}
              fullWidth
              value={selectedDevice}
              onChange={(e, newValue) => {
                setSelectedDevice(newValue);
              }}
              onInputChange={(event, newInputValue) => {
                setFilterValue(newInputValue);
                // Debounce could be added here
                if (event?.type === 'change') {
                  fetchDeviceOptions(newInputValue);
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Type to search..." 
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loadingDevices ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          {selectedDevice && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              Target IMEI: {selectedDevice.imei}
            </Typography>
          )}

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Command Details</Typography>
          
          <FormControl fullWidth>
            <InputLabel>Active Command</InputLabel>
            <Select
              value={selectedCommandId}
              label="Active Command"
              onChange={handleCommandChange}
            >
              {activeCommands.map(cmd => (
                <MenuItem key={cmd.id} value={cmd.id}>{cmd.command_id} - {cmd.specification}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedCommandId}>
            <InputLabel>Action (Get/Set/Clear)</InputLabel>
            <Select
              value={actionType}
              label="Action (Get/Set/Clear)"
              onChange={handleActionChange}
            >
              {selectedCommand?.allow_get && <MenuItem value="get">Get</MenuItem>}
              {selectedCommand?.allow_set && <MenuItem value="set">Set</MenuItem>}
              {selectedCommand?.allow_clear && <MenuItem value="clear">Clear</MenuItem>}
            </Select>
          </FormControl>

          {actionType === 'set' && (
            <FormControl fullWidth>
              <InputLabel>List of Values</InputLabel>
              <Select
                value={valueSelection}
                label="List of Values"
                onChange={(e) => setValueSelection(e.target.value)}
              >
                {valueSuggestions.map(val => (
                  <MenuItem key={val} value={val}>{val}</MenuItem>
                ))}
                <MenuItem value="others"><em>Others (Custom Value)</em></MenuItem>
              </Select>
            </FormControl>
          )}

          {actionType === 'set' && valueSelection === 'others' && (
            <TextField 
              label="New Custom Value" 
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              fullWidth 
            />
          )}

          {selectedCommand?.allowed_source === 'both' && (
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={source}
                label="Source"
                onChange={(e) => setSource(e.target.value)}
              >
                <MenuItem value="mqtt">MQTT</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
              </Select>
            </FormControl>
          )}

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={submitting || !selectedCommand || !selectedDevice || !actionType || (actionType === 'set' && !valueSelection) || (selectedCommand?.allowed_source === 'both' && !source)}
        >
          {submitting ? 'Sending...' : 'Send Command'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendCommandPopup;
