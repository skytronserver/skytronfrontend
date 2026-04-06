import { useDispatch } from 'react-redux'
import React from 'react';
// project imports
import Grid from "@mui/material/Grid";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect, useState } from 'react';
import Datatable from '../../datatables/Datatable';
import { registeredUserColumns } from '../../datatables/rowsColumn';
import { useTranslation } from 'react-i18next';
import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@mui/material';

const generateDummyManufacturerUsers = () => {
  const dummyUsers = [];
  for (let i = 1; i <= 51; i++) {
    dummyUsers.push({
      id: 100000 + i,
      role: 'devicemanufacture',
      name: `Dummy Manufacturer User ${i}`,
      email: `dummy.manufacturer${i}@example.com`,
      mobile: `9000000${String(i).padStart(3, '0')}`,
      status: 'active',
      created_by_name: 'system_admin',
      created: new Date('2025-01-01').toISOString(),
      is_active: true,
      expirydate: null,
    });
  }
  return dummyUsers;
};

const UsersList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false)
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    userName: ''
  });

  useEffect(() => {
    const retrievePosts = async () => {
      const retriveData = await UserServices.getRegisteredUsers();
      const apiUsers = retriveData && retriveData.data ? retriveData.data : [];
      const mergedUsers = (Array.isArray(apiUsers) ? apiUsers : []).concat(
        generateDummyManufacturerUsers()
      );
      setUsers(mergedUsers);
      setLoad(true)
    };
    retrievePosts();
  }, [dispatch])

  const handleDeactivateUser = async (userId) => {
    try {
      const response = await UserServices.deactivateUser({ userid: userId });
      if (response.status === 200) {
        // Refresh the user list
        const updatedData = await UserServices.getRegisteredUsers();
        setUsers(updatedData.data);

        // Show success message
        setNotification({
          open: true,
          message: 'User deactivated successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      setNotification({
        open: true,
        message: 'Failed to deactivate user',
        severity: 'error'
      });
    } finally {
      setConfirmDialog({ open: false, userId: null, userName: '' });
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      const response = await UserServices.activateUser({ userid: userId });
      if (response.status === 200) {
        const updatedData = await UserServices.getRegisteredUsers();
        setUsers(updatedData.data);

        setNotification({
          open: true,
          message: 'User reactivated successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      setNotification({
        open: true,
        message: 'Failed to reactivate user',
        severity: 'error'
      });
    }
  };

  const handleResendValidationLink = async (userId) => {
    try {
      const response = await UserServices.resendUserCreationOtp({ user_id: userId });
      if (response.status === 200 || response.status === 201) {
        setNotification({
          open: true,
          message: 'Validation link resent successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to resend');
      }
    } catch (error) {
      console.error('Error resending validation link:', error);
      setNotification({
        open: true,
        message: 'Failed to resend validation link',
        severity: 'error'
      });
    }
  };



  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleOpenConfirmDialog = (userId, userName) => {
    setConfirmDialog({
      open: true,
      userId,
      userName
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, userId: null, userName: '' });
  };

  // Add deactivate button to columns
  const columnsWithActions = [
    ...registeredUserColumns,
    {
      name: "expirydate",
      label: "Expiry Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => value ? new Date(value).toLocaleDateString('en-GB') : 'N/A'
      }
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
          const userId = tableMeta.rowData[0]; // Assuming id is the first column
          const userName = tableMeta.rowData[2]; // Assuming name is the third column
          const status = (tableMeta.rowData[5] || "").toString().toUpperCase();
          const isActive = !!tableMeta.rowData[8]; // is_active hidden column
          const currentExpiry = tableMeta.rowData[9]; // expirydate column we just added (index 9)

          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => isActive ? handleOpenConfirmDialog(userId, userName) : handleReactivateUser(userId)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: isActive ? '#ff4444' : '#34c759',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isActive ? 'Deactivate' : 'Reactivate'}
              </button>
              {status === 'PENDING' && (
                <button
                  onClick={() => handleResendValidationLink(userId)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#0088ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Resend Link
                </button>
              )}
            </div>
          );
        }
      }
    }
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title={t('users.listTitle')} />
      </Grid>
      <Grid item xs={12}>
        {load && <Datatable tableTitle="" userRows={users} userColumns={columnsWithActions} helperText="Timestamps are in GMT/UTC." />}
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deactivation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('common.deleteDialog', { userName: confirmDialog.userName })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDeactivateUser(confirmDialog.userId)}
            color="error"
            autoFocus
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>


    </Grid>
  );
}

export default UsersList