import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const mockData = [
  {
    id: 1, 
    otaId: 'OTA-001',
    commandId: 'CMD-100',
    specification: 'Reboot Device',
    commandKey: 'REBOOT',
    valueRegex: '^$',
    replyRegex: '^OK$',
    allowGet: false,
    allowSet: true,
    allowClear: false,
    allowedSource: 'Admin',
    status: 'Active',
    createdBy: 'System',
    updatedBy: 'System',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01'
  }
];

const OtaCommandDefinition = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(mockData);
  const [selectedRow, setSelectedRow] = useState(null);

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

  const handleToggleStatus = (id) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        return { ...row, status: row.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return row;
    }));
  };

  const columns = [
    { field: 'otaId', headerName: 'OTA ID', width: 130 },
    { field: 'commandId', headerName: 'Command ID', width: 130 },
    { field: 'specification', headerName: 'Specification', width: 200 },
    { field: 'commandKey', headerName: 'Command Key', width: 150 },
    { field: 'valueRegex', headerName: 'Value Regex', width: 150 },
    { field: 'replyRegex', headerName: 'Reply Regex', width: 150 },
    { field: 'allowGet', headerName: 'Allow Get', type: 'boolean', width: 100 },
    { field: 'allowSet', headerName: 'Allow Set', type: 'boolean', width: 100 },
    { field: 'allowClear', headerName: 'Allow Clear', type: 'boolean', width: 100 },
    { field: 'allowedSource', headerName: 'Allowed Source', width: 150 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'createdBy', headerName: 'Created By', width: 130 },
    { field: 'updatedBy', headerName: 'Updated By', width: 130 },
    { field: 'createdAt', headerName: 'Created At', width: 130 },
    { field: 'updatedAt', headerName: 'Updated At', width: 130 },
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
            color={params.row.status === 'Active' ? 'error' : 'success'}
            onClick={() => handleToggleStatus(params.row.id)}
          >
            {params.row.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Box>
      )
    }
  ];

  const validationSchema = Yup.object({
    commandId: Yup.string().required('Required'),
    specification: Yup.string().required('Required'),
    commandKey: Yup.string().required('Required'),
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
            commandId: '',
            specification: '',
            commandKey: '',
            valueRegex: '',
            replyRegex: '',
            allowGet: false,
            allowSet: false,
            allowClear: false,
            allowedSource: '',
            status: 'Active'
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            if (selectedRow) {
              setRows(rows.map(row => row.id === selectedRow.id ? { ...values, updatedAt: new Date().toISOString().split('T')[0] } : row));
            } else {
              const newRow = { 
                ...values, 
                id: rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1,
                createdBy: 'Current User',
                updatedBy: 'Current User',
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
              };
              setRows([...rows, newRow]);
            }
            resetForm();
            handleClose();
          }}
        >
          {({ values, handleChange, handleBlur, touched, errors, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField 
                    name="commandId" 
                    label="Command ID" 
                    value={values.commandId} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={touched.commandId && Boolean(errors.commandId)}
                    helperText={touched.commandId && errors.commandId}
                    fullWidth 
                  />
                  <TextField 
                    name="specification" 
                    label="Specification" 
                    value={values.specification} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  <TextField 
                    name="commandKey" 
                    label="Command Key" 
                    value={values.commandKey} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  <TextField 
                    name="valueRegex" 
                    label="Value Regex" 
                    value={values.valueRegex} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  <TextField 
                    name="replyRegex" 
                    label="Reply Regex" 
                    value={values.replyRegex} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  <TextField 
                    name="allowedSource" 
                    label="Allowed Source" 
                    value={values.allowedSource} 
                    onChange={handleChange} 
                    fullWidth 
                  />
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControlLabel
                      control={<Switch checked={values.allowGet} onChange={(e) => setFieldValue('allowGet', e.target.checked)} />}
                      label="Allow Get"
                    />
                    <FormControlLabel
                      control={<Switch checked={values.allowSet} onChange={(e) => setFieldValue('allowSet', e.target.checked)} />}
                      label="Allow Set"
                    />
                    <FormControlLabel
                      control={<Switch checked={values.allowClear} onChange={(e) => setFieldValue('allowClear', e.target.checked)} />}
                      label="Allow Clear"
                    />
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">{selectedRow ? 'Update' : 'Create'}</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default OtaCommandDefinition;
