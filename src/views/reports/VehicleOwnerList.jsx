import React from 'react';
import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@mui/material';
// project imports
import Grid from "@mui/material/Grid";
import { Link } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { gridSpacing } from "../../store/constant";
import UserServices from '../../services/UserServices';
import { useEffect, useState } from 'react';
//Datatables
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { vehicleOwnerCols } from '../../datatables/rowsColumn';
import { useTranslation } from 'react-i18next';
import SettingService from '../../services/SettingService';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const parseDateSafely = (val) => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      const direct = new Date(trimmed);
      if (!isNaN(direct.getTime())) return direct;

      // Handle DD/MM/YYYY or DD-MM-YYYY formats (e.g. 24/10/2029 or 24-10-2029)
      const parts = trimmed.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const parsed = new Date(year, month, day);
          if (!isNaN(parsed.getTime())) return parsed;
        } else if (parts[0].length === 4) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const parsed = new Date(year, month, day);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
    }
    return null;
  };

  // Extend Validity Handlers
  const handleOpenExtendDialog = (ownerId, userName, currentExpiry) => {
    // Format date for input type="date" (YYYY-MM-DD) if currentExpiry exists
    let formattedDate = '';
    let displayCurrentExpiry = 'N/A';
    if (currentExpiry) {
      const parsed = parseDateSafely(currentExpiry);
      if (parsed) {
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        formattedDate = `${yyyy}-${mm}-${dd}`;
        displayCurrentExpiry = parsed.toLocaleDateString('en-GB');
      } else if (typeof currentExpiry === 'string') {
        displayCurrentExpiry = currentExpiry;
      }
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

      if (!extendDialog.ownerId) {
        setNotification({
          open: true,
          message: 'Invalid owner ID',
          severity: 'error'
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
        message: error?.response?.data?.message || 'Failed to extend validity',
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
            customBodyRender: (value) => {
              if (!value) return 'N/A';
              const parsed = parseDateSafely(value);
              return parsed ? parsed.toLocaleDateString('en-GB') : String(value);
            }
          }
        };
      }
      return col;
    }),
    {
      name: "file_idProof",
      label: "ID Proof",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => {
          if (!value) return "N/A";

          return (
            <Link
              component="button"
              type="button"
              underline="none"
              onClick={async () => {
                try {
                  const response = await SettingService.file_Download({
                    file_path: value,
                  });

                  const blob = new Blob([response.data], {
                    type: response.headers["content-type"] ||
                      "application/octet-stream",
                  });

                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");

                  link.href = downloadUrl;
                  link.download = value.split("/").pop() || "id-proof.pdf";

                  document.body.appendChild(link);
                  link.click();
                  link.remove();

                  window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                  console.error("Download error:", error);

                  setNotification({
                    open: true,
                    message: "Failed to download ID proof",
                    severity: "error",
                  });
                }
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
            >
              <VisibilityIcon fontSize="small" />
              Download ID Proof
            </Link>
          );
        },
      },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          // Direct row object lookup using tableMeta.dataIndex
          const rowObj = (ownerList && ownerList[tableMeta.dataIndex]) || {};

          // Column indices in vehicleOwnerCols:
          // 0: id
          // 1..5: users (Name, Email, Mobile, Address, User Type)
          // 6: idProofno
          // 7: users (Status)
          // 8: expirydate
          // 9..10: users (Created By, Created On)
          const expiryColIndex = vehicleOwnerCols.findIndex(col => col.name === 'expirydate');
          const idColIndex = vehicleOwnerCols.findIndex(col => col.name === 'id');
          const userColIndex = vehicleOwnerCols.findIndex(col => col.name === 'users');

          const ownerId = rowObj.id ?? (idColIndex !== -1 ? tableMeta.rowData[idColIndex] : tableMeta.rowData[0]);
          const usersData = rowObj.users ?? (userColIndex !== -1 ? tableMeta.rowData[userColIndex] : tableMeta.rowData[1]);
          const userName = (Array.isArray(usersData) && usersData[0]?.name) || 'Unknown';
          const currentExpiry = rowObj.expirydate ?? (expiryColIndex !== -1 ? tableMeta.rowData[expiryColIndex] : tableMeta.rowData[8]);

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

