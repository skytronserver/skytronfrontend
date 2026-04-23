import React, { useEffect, useState } from 'react';
// project imports
import {
  Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl,
  Typography
} from "@mui/material";
import { gridSpacing } from "../../../store/constant";
import StockServices from '../../../services/StockServices';
import DeviceModelServices from '../../../services/DeviceModelServices';
// Datatables
import { useSelector, useDispatch } from 'react-redux';
import { getDeviceListAvailable } from '../../../actions/stockActions';
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import { availableForSalesColumnForFitment } from '../../../datatables/deviceColumns';
import { useTranslation } from 'react-i18next';
import { isCertValid } from '../../../helper';
import AutoHideAlert from '../../../ui-component/AutoHideAlert';
import CustomLoader from '../../../ui-component/CustomLoader';

// Vehicle type options with validity years
const VEHICLE_TYPES = [
  { value: 'new', label: 'New Vehicle (Without Registration)', years: 2 },
  { value: 'old', label: 'Old Vehicle (With Registration No.)', years: 1 },
];

// Add years to a YYYY-MM-DD string and return YYYY-MM-DD
const addYears = (dateStr, years) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

// Today as YYYY-MM-DD (min value for start date picker)
const todayStr = () => new Date().toISOString().split('T')[0];

const SimActivation = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', type: 'success' });

  // Activation dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  // Auto-calculated end date
  const selectedVehicle = VEHICLE_TYPES.find(v => v.value === vehicleType);
  const endDate = selectedVehicle && startDate
    ? addYears(startDate, selectedVehicle.years)
    : '';

  // Datatables data via redux
  const dispatch = useDispatch();
  const availableDeviceList = useSelector((state) => state.stock.availableList);

  const fetchDeviceList = async () => {
    try {
      const filter = {
        "stock_status": "Available_for_fitting",
        "esim_status": "NotAssigned"
      };
      const retriveData = await DeviceModelServices.getDeviceList(filter);
      const devices = retriveData.data.data || [];
      const validDevices = devices.filter(device => isCertValid(device.model));
      dispatch(getDeviceListAvailable(validDevices));
      setLoad(true);
    } catch (error) {
      console.error('Error fetching device list:', error);
      setAlert({ open: true, message: t('common.errors.fetchError'), type: 'error' });
    }
  };

  useEffect(() => {
    fetchDeviceList();
  }, [dispatch]);

  // Open dialog, reset fields, default start date to today
  const handleOpenDialog = (rowData) => {
    setSelectedRow(rowData);
    setStartDate(todayStr());
    setVehicleType('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRow(null);
    setStartDate('');
    setVehicleType('');
  };

  const handleConfirmActivation = async () => {
    if (!startDate || !vehicleType) return;
    handleCloseDialog();
    setLoading(true);
    const data = selectedRow;
    const formData = {
      eSim_provider: data[1][0]?.id,
      valid_from: startDate,
      valid_upto: endDate,
      device: data[0],
    };
    try {
      await StockServices.simActivationReq(formData);
      setAlert({ open: true, message: 'eSIM Activation Request Submitted Successfully', type: 'success' });
      await fetchDeviceList();
    } catch (error) {
      console.error('Error activating SIM:', error);
      setAlert({ open: true, message: t('simActivation.messages.activationError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => setAlert({ ...alert, open: false });

  const actionColumn = [
    {
      name: "Action",
      label: t('common.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: 'flex' }}>
              <div style={{ marginRight: '5px' }}>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleOpenDialog(tableMeta.rowData)}
                  disabled={loading}
                >
                  {t('simActivation.actions.requestActivation')}
                </Button>
              </div>
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      {loading && <CustomLoader />}
      <AutoHideAlert
        open={alert.open}
        onClose={handleAlertClose}
        message={alert.message}
        type={alert.type}
      />

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {load && (
            <DynamicDatatables
              tableTitle={t('simActivation.titles.pending')}
              rows={availableDeviceList}
              columns={availableForSalesColumnForFitment.concat(actionColumn)}
            />
          )}
        </Grid>
      </Grid>

      {/* eSIM Activation Dialog — matches existing project dialog style */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>eSIM Activation Request</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Select the vehicle type and activation start date. The eSIM end date
            will be calculated automatically based on the validity period.
          </Typography>

          {/* Vehicle Type */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
            <Select
              labelId="vehicle-type-label"
              id="vehicle-type-select"
              value={vehicleType}
              label="Vehicle Type"
              onChange={(e) => setVehicleType(e.target.value)}
            >
              {VEHICLE_TYPES.map((vt) => (
                <MenuItem key={vt.value} value={vt.value}>
                  {vt.label}&nbsp;—&nbsp;
                  <Typography component="span" variant="body2" color="text.secondary">
                    {vt.years} year{vt.years > 1 ? 's' : ''} validity
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start Date */}
          <TextField
            id="esim-start-date"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayStr() }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* End Date — read-only, auto-calculated */}
          <TextField
            id="esim-end-date"
            label="End Date (Auto Calculated)"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            InputProps={{ readOnly: true }}
            helperText={
              !vehicleType
                ? 'Select a vehicle type to auto-calculate the end date.'
                : !startDate
                  ? 'Select a start date to auto-calculate the end date.'
                  : `eSIM valid for ${selectedVehicle?.years} year${selectedVehicle?.years > 1 ? 's' : ''} from the selected start date.`
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmActivation}
            variant="contained"
            color="secondary"
            disabled={!startDate || !vehicleType}
          >
            Submit Activation Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SimActivation;
