import React, { useState } from 'react';
import { 
  Box, Typography, Card, Button, Chip, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import MUIDataTable from "mui-datatables";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const dummyUsers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.s@skytrack.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Anita Desai', email: 'anita.d@skytrack.com', role: 'Compliance Officer', status: 'Active' },
  { id: 3, name: 'Vikram Singh', email: 'vikram.s@skytrack.com', role: 'Technical Lead', status: 'Pending Invite' },
];

const OrganizationUsers = () => {
  const [open, setOpen] = useState(false);

  const columns = [
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' },
    { name: 'role', label: 'Role' },
    { 
      name: 'status', 
      label: 'Status',
      options: {
        customBodyRender: (value) => {
          return (
            <Chip 
              label={value} 
              color={value === 'Active' ? 'success' : 'warning'} 
              size="small" 
            />
          );
        }
      }
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        customBodyRender: (value) => {
          return (
            <Box>
              <IconButton color="primary" size="small"><EditIcon /></IconButton>
              <IconButton color="error" size="small"><DeleteIcon /></IconButton>
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
    search: false,
    print: false,
    download: false
  };

  return (
    <Box>
      <Card sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Organization Users</Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your authorized team members and their roles.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PersonAddIcon />}
          onClick={() => setOpen(true)}
        >
          Invite User
        </Button>
      </Card>

      <Card sx={{ boxShadow: 2 }}>
        <MUIDataTable
          title={"Team Members"}
          data={dummyUsers}
          columns={columns}
          options={options}
        />
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Send an invitation link to add a new member to your organization.
          </Typography>
          <TextField 
            autoFocus 
            margin="dense" 
            label="Email Address" 
            type="email" 
            fullWidth 
            variant="outlined" 
            sx={{ mb: 2 }}
          />
          <TextField 
            select 
            fullWidth 
            label="Role" 
            defaultValue="Technical Lead"
            variant="outlined"
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Compliance Officer">Compliance Officer</MenuItem>
            <MenuItem value="Technical Lead">Technical Lead</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button variant="contained" onClick={() => setOpen(false)} color="primary">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationUsers;
