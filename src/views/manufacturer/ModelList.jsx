import React from 'react';
import { Box, Typography, Card, Chip, IconButton } from '@mui/material';
import MUIDataTable from "mui-datatables";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

// Dummy Data for Models
const dummyModels = [
  { id: 'MOD-001', name: 'SkyTrack X1', hwVersion: 'v1.2', fwVersion: 'v2.0.4', protocol: 'AIS-140', status: 'Approved' },
  { id: 'MOD-002', name: 'SkyTrack Pro', hwVersion: 'v2.0', fwVersion: 'v3.1.0', protocol: 'AIS-140', status: 'Correction Required' },
  { id: 'MOD-003', name: 'Tracker Basic', hwVersion: 'v1.0', fwVersion: 'v1.0.1', protocol: 'Standard', status: 'Approved' },
  { id: 'MOD-004', name: 'FleetMaster', hwVersion: 'v1.5', fwVersion: 'v1.2.2', protocol: 'VLTD', status: 'Under Review' },
  { id: 'MOD-005', name: 'EcoTrack', hwVersion: 'v1.1', fwVersion: 'v1.1.5', protocol: 'AIS-140', status: 'Draft' },
];

const ModelList = () => {
  const columns = [
    { name: 'id', label: 'Model ID' },
    { name: 'name', label: 'Model Name' },
    { name: 'hwVersion', label: 'HW Version' },
    { name: 'fwVersion', label: 'FW Version' },
    { name: 'protocol', label: 'Protocol' },
    { 
      name: 'status', 
      label: 'Approval Status',
      options: {
        customBodyRender: (value) => {
          let color = 'default';
          if (value === 'Approved') color = 'success';
          if (value === 'Under Review') color = 'primary';
          if (value === 'Correction Required') color = 'error';
          if (value === 'Draft') color = 'default';
          return <Chip label={value} color={color} size="small" />;
        }
      }
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        customBodyRender: (value, tableMeta) => {
          // tableMeta.rowData contains the row data
          return (
            <Box>
              <IconButton color="primary" size="small" title="View Details">
                <VisibilityIcon />
              </IconButton>
              <IconButton color="secondary" size="small" title="Edit Model">
                <EditIcon />
              </IconButton>
            </Box>
          );
        }
      }
    }
  ];

  const options = {
    filterType: 'dropdown',
    responsive: 'standard',
    selectableRows: 'none',
    elevation: 0,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 20],
  };

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Device Models</Typography>
      </Card>
      
      <Card sx={{ boxShadow: 3 }}>
        <MUIDataTable
          title={"All Models"}
          data={dummyModels}
          columns={columns}
          options={options}
        />
      </Card>
    </Box>
  );
};

export default ModelList;
