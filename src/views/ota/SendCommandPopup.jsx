import React, { useState } from 'react';
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
  Autocomplete
} from '@mui/material';

const SendCommandPopup = ({ open, handleClose }) => {
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [command, setCommand] = useState('');
  const [actionType, setActionType] = useState('');
  const [valueSelection, setValueSelection] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Mock data for commands and list of values
  const activeCommands = ['Reboot Device', 'Set Speed Limit', 'Get Location'];
  const dummyDevices = [
    { imei: '868204040123456', registration: 'KA01AB1234', owner: 'John Doe' },
    { imei: '868204040123457', registration: 'KA01AB1235', owner: 'Jane Smith' },
    { imei: '868204040123458', registration: 'MH12CD5678', owner: 'Acme Corp' },
    { imei: '868204040123459', registration: 'DL01EF9012', owner: 'Bob Wilson' },
  ];
  const listValues = ['Value 1', 'Value 2', 'others'];

  const handleSubmit = () => {
    // Implement sending command logic here
    console.log({
      filterType,
      filterValue,
      command,
      actionType,
      valueSelection,
      customValue
    });
    handleClose();
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
                }}
              >
                <MenuItem value="registration">Registration No</MenuItem>
                <MenuItem value="owner">Owner Name</MenuItem>
                <MenuItem value="imei">IMEI</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              options={dummyDevices}
              getOptionLabel={(option) => {
                if (!filterType) return '';
                if (typeof option === 'string') return option;
                return option[filterType] || '';
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.imei}>
                  <Box>
                    <Typography variant="body2">{option[filterType]}</Typography>
                    <Typography variant="caption" color="textSecondary">IMEI: {option.imei}</Typography>
                  </Box>
                </li>
              )}
              fullWidth
              disabled={!filterType}
              value={selectedDevice}
              onChange={(e, newValue) => {
                setSelectedDevice(newValue);
                setFilterValue(newValue ? newValue[filterType] : '');
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Enter value to find IMEI" 
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
              value={command}
              label="Active Command"
              onChange={(e) => setCommand(e.target.value)}
            >
              {activeCommands.map(cmd => (
                <MenuItem key={cmd} value={cmd}>{cmd}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Action (Get/Set)</InputLabel>
            <Select
              value={actionType}
              label="Action (Get/Set)"
              onChange={(e) => {
                setActionType(e.target.value);
                if (e.target.value !== 'Set') {
                  setValueSelection('');
                  setCustomValue('');
                }
              }}
            >
              <MenuItem value="Get">Get</MenuItem>
              <MenuItem value="Set">Set</MenuItem>
            </Select>
          </FormControl>

          {actionType === 'Set' && (
            <FormControl fullWidth>
              <InputLabel>List of Values</InputLabel>
              <Select
                value={valueSelection}
                label="List of Values"
                onChange={(e) => setValueSelection(e.target.value)}
              >
                {listValues.map(val => (
                  <MenuItem key={val} value={val}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {actionType === 'Set' && valueSelection === 'others' && (
            <TextField 
              label="New Custom Value (List of Values Model)" 
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              fullWidth 
            />
          )}

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Send Command</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendCommandPopup;
