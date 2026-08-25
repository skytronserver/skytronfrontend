import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { gridSpacing } from "../../../store/constant";
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import AutoHideAlert from '../../../ui-component/AutoHideAlert';

// Mock data and API call for now since backend is not ready
const mockData = [
  { id: 1, imei: "352345678901234", iccid: "89910009000000001234", currentValidity: "2024-12-31", status: "Active" },
  { id: 2, imei: "352345678901235", iccid: "89910009000000001235", currentValidity: "2024-10-15", status: "Expiring Soon" },
  { id: 3, imei: "352345678901236", iccid: "89910009000000001236", currentValidity: "2023-08-01", status: "Expired" },
];

const EsimValidityExtension = () => {
  const [load, setLoad] = useState(false);
  const [list, setList] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [extensionMonths, setExtensionMonths] = useState(12);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setList(mockData);
      setLoad(true);
    }, 500);
  }, []);

  const handleOpenExtendDialog = (rowData) => {
    // rowData is an array of column values, we map it back or just use the values
    // Assuming columns are IMEI (0), ICCID (1), Validity (2), Status (3)
    setSelectedDevice({
      imei: rowData[0],
      iccid: rowData[1],
      currentValidity: rowData[2],
    });
    setExtendDialogOpen(true);
  };

  const handleCloseExtendDialog = () => {
    setExtendDialogOpen(false);
    setSelectedDevice(null);
  };

  const handleExtendSubmit = () => {
    // Mock API call
    console.log(`Extending validity for ${selectedDevice?.imei} by ${extensionMonths} months`);
    
    setAlertType("success");
    setAlertMessage("Validity extension request submitted successfully.");
    setOpenAlert(true);
    setExtendDialogOpen(false);
  };

  const columns = [
    { name: "imei", label: "Device IMEI", options: { filter: true, sort: true } },
    { name: "iccid", label: "ICCID", options: { filter: true, sort: true } },
    { name: "currentValidity", label: "Current Validity Date", options: { filter: true, sort: true } },
    { name: "status", label: "Status", options: { filter: true, sort: true } },
    {
      name: "Action",
      label: "Action",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => handleOpenExtendDialog(tableMeta.rowData)}
            >
              Request Extension
            </Button>
          );
        },
      },
    },
  ];

  return (
    <>
      <AutoHideAlert
        open={openAlert}
        onClose={handleCloseAlert}
        message={alertMessage}
        type={alertType}
      />

      <Dialog
        open={extendDialogOpen}
        onClose={handleCloseExtendDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request eSIM Validity Extension</DialogTitle>
        <DialogContent>
          {selectedDevice && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device IMEI"
                  value={selectedDevice.imei}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ICCID"
                  value={selectedDevice.iccid}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Extension Period (Months)"
                  value={extensionMonths}
                  onChange={(e) => setExtensionMonths(e.target.value)}
                >
                  <MenuItem value={1}>1 Month</MenuItem>
                  <MenuItem value={3}>3 Months</MenuItem>
                  <MenuItem value={6}>6 Months</MenuItem>
                  <MenuItem value={12}>12 Months</MenuItem>
                  <MenuItem value={24}>24 Months</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExtendDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleExtendSubmit}
            variant="contained"
            color="primary"
          >
            Submit Extension
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {load && (
            <DynamicDatatables
              tableTitle="eSIM Validity Extension"
              rows={list}
              columns={columns}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EsimValidityExtension;
