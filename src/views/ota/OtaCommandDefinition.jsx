import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { getAxiosInstance } from '../../services/axiosInstance';

const OtaCommandDefinition = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const axios = getAxiosInstance();
      const response = await axios.post('/api/ota/command/filter/', {});
      if (response.data?.status === 'success') {
        setRows(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching OTA commands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const handleOpen = () => {
    setSelectedRow(null);
    setOpen(true);
  };
  
  const handleOpenUpdate = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleToggleStatus = async (row) => {
    try {
      const axios = getAxiosInstance();
      const newStatus = row.status === 'active' ? 'inactive' : 'active';
      await axios.post('/api/ota/command/update/', {
        ota_id: row.id,
        status: newStatus
      });
      fetchCommands();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const columns = [
    { field: 'id', headerName: 'OTA ID', width: 100 },
    { field: 'command_id', headerName: 'Command ID', width: 130 },
    { field: 'specification', headerName: 'Specification', width: 200 },
    { field: 'command_key', headerName: 'Command Key', width: 130 },
    { field: 'value_regex', headerName: 'Value Regex', width: 130 },
    { field: 'reply_regex', headerName: 'Reply Regex', width: 130 },
    { field: 'allow_get', headerName: 'Allow Get', type: 'boolean', width: 90 },
    { field: 'allow_set', headerName: 'Allow Set', type: 'boolean', width: 90 },
    { field: 'allow_clear', headerName: 'Allow Clear', type: 'boolean', width: 90 },
    { field: 'allowed_source', headerName: 'Allowed Source', width: 130 },
    { field: 'status', headerName: 'Status', width: 100 },
    { 
      field: 'created_by_info', 
      headerName: 'Created By', 
      width: 130,
      valueGetter: (params) => params.row?.created_by_info?.name || ''
    },
    { field: 'created_at', headerName: 'Created At', width: 160 },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 250,
      renderCell: (params) => (
        <Box>
          <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleOpenUpdate(params.row)}>Update</Button>
          <Button 
            size="small" 
            variant="contained" 
            color={params.row.status === 'active' ? 'error' : 'success'}
            onClick={() => handleToggleStatus(params.row)}
          >
            {params.row.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Box>
      )
    }
  ];

  const validationSchema = Yup.object({
    command_id: Yup.string().required('Required'),
    command_key: Yup.string().required('Required'),
    get_command_template: Yup.string().when('allow_get', { is: true, then: () => Yup.string().required('Required') }),
    set_command_template: Yup.string().when('allow_set', { is: true, then: () => Yup.string().required('Required') }),
    clear_command_template: Yup.string().when('allow_clear', { is: true, then: () => Yup.string().required('Required') }),
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">OTA Command Definition</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Create New Command
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedRow ? 'Update OTA Command' : 'Create New OTA Command'}</DialogTitle>
        <Formik
          enableReinitialize
          initialValues={selectedRow || {
            command_id: '',
            specification: '',
            command_key: '',
            get_command_template: '',
            set_command_template: '',
            clear_command_template: '',
            value_regex: '',
            reply_regex: '',
            allow_get: false,
            allow_set: false,
            allow_clear: false,
            allowed_source: 'both',
            status: 'active'
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              const axios = getAxiosInstance();
              // Remove fields that shouldn't be sent in create/update payloads or map correctly
              const payload = { ...values };
              
              if (selectedRow) {
                payload.ota_id = selectedRow.id;
                await axios.post('/api/ota/command/update/', payload);
              } else {
                await axios.post('/api/ota/command/create/', payload);
              }
              
              fetchCommands();
              resetForm();
              handleClose();
            } catch (error) {
              console.error("Error saving OTA command:", error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, handleBlur, touched, errors, setFieldValue, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField 
                    name="command_id" 
                    label="Command ID" 
                    value={values.command_id || ''} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={touched.command_id && Boolean(errors.command_id)}
                    helperText={touched.command_id && errors.command_id}
                    fullWidth 
                  />
                  <TextField 
                    name="command_key" 
                    label="Command Key" 
                    value={values.command_key || ''} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={touched.command_key && Boolean(errors.command_key)}
                    helperText={touched.command_key && errors.command_key}
                    fullWidth 
                  />
                  <TextField 
                    name="specification" 
                    label="Specification" 
                    value={values.specification || ''} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', gridColumn: 'span 2' }}>
                    <FormControlLabel
                      control={<Switch checked={values.allow_get} onChange={(e) => setFieldValue('allow_get', e.target.checked)} />}
                      label="Allow Get"
                    />
                    <FormControlLabel
                      control={<Switch checked={values.allow_set} onChange={(e) => setFieldValue('allow_set', e.target.checked)} />}
                      label="Allow Set"
                    />
                    <FormControlLabel
                      control={<Switch checked={values.allow_clear} onChange={(e) => setFieldValue('allow_clear', e.target.checked)} />}
                      label="Allow Clear"
                    />
                  </Box>

                  {values.allow_get && (
                    <TextField 
                      name="get_command_template" 
                      label="Get Command Template" 
                      value={values.get_command_template || ''} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      error={touched.get_command_template && Boolean(errors.get_command_template)}
                      helperText={touched.get_command_template && errors.get_command_template}
                      fullWidth 
                    />
                  )}
                  {values.allow_set && (
                    <TextField 
                      name="set_command_template" 
                      label="Set Command Template (use {value})" 
                      value={values.set_command_template || ''} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      error={touched.set_command_template && Boolean(errors.set_command_template)}
                      helperText={touched.set_command_template && errors.set_command_template}
                      fullWidth 
                    />
                  )}
                  {values.allow_clear && (
                    <TextField 
                      name="clear_command_template" 
                      label="Clear Command Template" 
                      value={values.clear_command_template || ''} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      error={touched.clear_command_template && Boolean(errors.clear_command_template)}
                      helperText={touched.clear_command_template && errors.clear_command_template}
                      fullWidth 
                    />
                  )}

                  <TextField 
                    name="value_regex" 
                    label="Value Regex" 
                    value={values.value_regex || ''} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  <TextField 
                    name="reply_regex" 
                    label="Reply Regex" 
                    value={values.reply_regex || ''} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Allowed Source</InputLabel>
                    <Select
                      name="allowed_source"
                      value={values.allowed_source || 'both'}
                      label="Allowed Source"
                      onChange={handleChange}
                    >
                      <MenuItem value="both">Both</MenuItem>
                      <MenuItem value="mqtt">MQTT</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={values.status || 'active'}
                      label="Status"
                      onChange={handleChange}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>

                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {selectedRow ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default OtaCommandDefinition;
