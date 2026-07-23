import React from 'react';
import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@mui/material';
// project imports
import Grid from "@mui/material/Grid";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect, useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { vehicleOwnerCols } from '../../datatables/rowsColumn';
import { useTranslation } from 'react-i18next';

const VehicleOwnerList = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false)
  const [ownerList, setOwnerList] = useState([]);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [extendDialog, setExtendDialog] = useState({
    open: false,
    ownerId: null,
    userName: '',
    newExpiry: '',
    currentExpiry: ''
  });

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await UserServices.fetchVehicleOwner();
        setOwnerList(response.data)
        setLoad(true)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(t('common.noDataFound'));
        } else {
          console.log(t('common.noDataFound'));
        }
      }
    };
    fetchOwner();
  }, [])

  // Extend Validity Handlers
  const handleOpenExtendDialog = (ownerId, userName, currentExpiry) => {
    // Format date for input type="date" (YYYY-MM-DD) if currentExpiry exists
    let formattedDate = '';
    let displayCurrentExpiry = 'N/A';
    if (currentExpiry) {
      const date = new Date(currentExpiry);
      formattedDate = date.toISOString().split('T')[0];
      displayCurrentExpiry = date.toLocaleDateString('en-GB');
    }

    setExtendDialog({
      open: true,
      ownerId,
      userName,
      newExpiry: formattedDate,
      currentExpiry: displayCurrentExpiry
    });
  };

  const handleCloseExtendDialog = () => {
    setExtendDialog({ open: false, ownerId: null, userName: '', newExpiry: '', currentExpiry: '' });
  };

  const handleExtendValidity = async () => {
    try {
      if (!extendDialog.newExpiry) {
        setNotification({
          open: true,
          message: 'Please select a date',
          severity: 'warning'
        });
        return;
      }

      const response = await UserServices.updateVehicleOwnerExpiry({
        owner_id: extendDialog.ownerId,
        new_expiry_date: extendDialog.newExpiry
      });

      if (response.status === 200 || response.status === 201) {
        const updatedResponse = await UserServices.fetchVehicleOwner();
        setOwnerList(updatedResponse.data);

        setNotification({
          open: true,
          message: 'User validity extended successfully',
          severity: 'success'
        });
        handleCloseExtendDialog();
      }
    } catch (error) {
      console.error('Error extending validity:', error);
      setNotification({
        open: true,
        message: 'Failed to extend validity',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Modify columns to include actions and format expiry
  const columnsWithActions = [
    ...vehicleOwnerCols.map(col => {
      if (col.name === 'expirydate') {
        return {
          ...col,
          options: {
            ...col.options,
            customBodyRender: (value) => value ? new Date(value).toLocaleDateString('en-GB') : 'N/A'
          }
        };
      }
      return col;
    }),
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
          // 'users' column is at index 1 and contains array of user objects.
          // We need to support cases where columns might be reordered, but relying on data structure is safer if we knew field name.
          // tableMeta.rowData follows the column order. 
          // vehicleOwnerCols index 1 is 'users' (User Name).
          // vehicleOwnerCols index 7 is 'expirydate'.

          // Finding the 'users' object from rowData. 
          // Since multiple columns use 'users', we can pick index 1.
          const usersData = tableMeta.rowData[1];
          const currentExpiry = tableMeta.rowData[7];
          const ownerId = tableMeta.rowData[0]; // owner_id is at index 0

          const userName = usersData && usersData[0] ? usersData[0].name : 'Unknown';

          return (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleOpenExtendDialog(ownerId, userName, currentExpiry)}
              sx={{ minWidth: '130px' }}
            >
              Extend Validity
            </Button>
          );
        }
      }
    }
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {load && <DynamicDatatables tableTitle={t('vehicleOwner.listTitle')} rows={ownerList} columns={columnsWithActions} helperText="Timestamps are in GMT/UTC." />}
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

      <Dialog open={extendDialog.open} onClose={handleCloseExtendDialog}>
        <DialogTitle>Extend User Validity</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select the new validity date for {extendDialog.userName}
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, mb: 2, fontWeight: 'bold' }}>
            Current Validity: {extendDialog.currentExpiry}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="expiryDate"
            label="Expiry Date"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={extendDialog.newExpiry}
            onChange={(e) => setExtendDialog({ ...extendDialog, newExpiry: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExtendDialog}>Cancel</Button>
          <Button onClick={handleExtendValidity} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default VehicleOwnerList;

