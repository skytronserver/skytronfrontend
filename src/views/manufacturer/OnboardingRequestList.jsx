import React from 'react';
import { Box, Typography, Card, Chip, IconButton, Button } from '@mui/material';
import MUIDataTable from "mui-datatables";
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Dummy Data for Onboarding Requests
const dummyRequests = [
  { id: 'REQ-2026-001', model: 'SkyTrack X1', submittedAt: '2026-08-15', stage: 'Group 3', devicesReceived: '5/5', status: 'Testing' },
  { id: 'REQ-2026-002', model: 'SkyTrack Pro', submittedAt: '2026-08-18', stage: 'Group 1', devicesReceived: '5/5', status: 'Blocked' },
  { id: 'REQ-2026-003', model: 'Tracker Basic', submittedAt: '2026-08-10', stage: 'Completed', devicesReceived: '5/5', status: 'Technical Completed' },
  { id: 'REQ-2026-004', model: 'FleetMaster', submittedAt: '2026-08-19', stage: 'Awaiting Receipt', devicesReceived: '0/5', status: 'In Transit' },
  { id: 'REQ-2026-005', model: 'EcoTrack', submittedAt: '2026-08-05', stage: 'Failed', devicesReceived: '5/5', status: 'Failed' },
  { id: 'REQ-2026-006', model: 'Tracker Basic V2', submittedAt: '-', stage: 'Draft', devicesReceived: '0/5', status: 'Draft' },
];

const OnboardingRequestList = () => {
  const columns = [
    { name: 'id', label: 'Request Number' },
    { name: 'model', label: 'Model Name' },
    { name: 'submittedAt', label: 'Submitted Date' },
    { name: 'devicesReceived', label: 'Devices Received' },
    { name: 'stage', label: 'Testing Stage' },
    { 
      name: 'status', 
      label: 'Overall Status',
      options: {
        customBodyRender: (value) => {
          let color = 'default';
          if (value === 'Technical Completed') color = 'success';
          if (value === 'Testing') color = 'primary';
          if (value === 'Blocked' || value === 'Failed') color = 'error';
          if (value === 'In Transit') color = 'warning';
          return <Chip label={value} color={color} size="small" />;
        }
      }
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        customBodyRender: (value, tableMeta) => {
          const status = tableMeta.rowData[5]; // get status from row data
          return (
            <Box>
              <IconButton color="primary" size="small" title="View Timeline / Details">
                <VisibilityIcon />
              </IconButton>
              {status === 'Technical Completed' && (
                <IconButton color="success" size="small" title="Download Final Report">
                  <FileDownloadIcon />
                </IconButton>
              )}
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
        <Typography variant="h4">Technical Onboarding Requests</Typography>
        <Button variant="contained" color="primary" href="/manufacturer/onboarding/new">
          + New Onboarding Request
        </Button>
      </Card>
      
      <Card sx={{ boxShadow: 3 }}>
        <MUIDataTable
          title={"All Onboarding Requests"}
          data={dummyRequests}
          columns={columns}
          options={options}
        />
      </Card>
    </Box>
  );
};

export default OnboardingRequestList;
