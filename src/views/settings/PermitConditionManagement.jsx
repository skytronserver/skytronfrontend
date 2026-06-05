import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, CircularProgress, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, Typography
} from '@mui/material';
import { PlayArrow as PlayIcon, Stop as StopIcon } from '@mui/icons-material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVehicleCategory, fetchPermitConditionList } from '../../actions/settingAction';
import SettingService from '../../services/SettingService';
import MainCard from '../../ui-component/cards/MainCard';
import FormField from '../../ui-component/CustomTextField';
import DialogComponent from '../../ui-component/DialogComponent';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { gridSpacing } from '../../store/constant';
import { convertErrorObjectToArray } from '../../helper';

// ─── Violation / Alert Types ──────────────────────────────────────────────────
const VIOLATION_TYPE_OPTIONS = [
  { value: 'Route', label: 'Route' },
  { value: 'Geofence', label: 'Geofence' },
  { value: 'Idling', label: 'Idling' },
  { value: 'OfflineDevice', label: 'Offline Device' },
  { value: 'Overtime', label: 'Overtime' },
  { value: 'UnauthorizedStop', label: 'Unauthorized Stop' },
  { value: 'UnauthorizedParking', label: 'Unauthorized Parking' },
  { value: 'Prohibited_Area', label: 'Prohibited Area' },
  { value: 'UnauthorizedSkip', label: 'Unauthorized Skip' },
  { value: 'NetworkLoss', label: 'Network Loss' },
  { value: 'GPSLoss', label: 'GPS Loss' },
  { value: 'Route_overspeed', label: 'Route Overspeed' },
  { value: 'Permit_3day', label: 'Permit (3-day)' },
  { value: 'state_border_cross', label: 'State Border Cross' },
  { value: 'district_border_cross', label: 'District Border Cross' },
  { value: 'city_border_cross', label: 'City Border Cross' },
  { value: 'Incident', label: 'Incident' },
  { value: 'OverSpeed', label: 'Over Speed' },
  { value: 'LowIntBat', label: 'Low Internal Battery' },
  { value: 'LowExtBat', label: 'Low External Battery' },
  { value: 'ExtBatDiscnt', label: 'External Battery Disconnect' },
  { value: 'HarshBreak', label: 'Harsh Braking' },
  { value: 'HarshTurn', label: 'Harsh Turn' },
  { value: 'HarshAcceleration', label: 'Harsh Acceleration' },
  { value: 'Tilt', label: 'Tilt' },
];

const INITIAL_VALUES = {
  permit_name: '',
  vehicle_category_fk: '',
  violation_type: '',
  enforcement_rule_details: '',
  penalty: '',
};

// ─── Mock data (fallback until backend is ready) ──────────────────────────────
const MOCK_DATA = [
  {
    id: 1,
    permit_name: 'Night Driving Restriction',
    vehicle_category_name: 'Heavy Commercial Vehicle',
    violation_type: 'Overtime',
    enforcement_rule_details: 'Vehicles not permitted to operate between 11 PM and 5 AM within city limits.',
    penalty: '₹5,000',
    status: 'active',
    created_by_name: 'Admin User',
    create_datetime: '2026-05-01T09:30:00Z',
    activation_datetime: '2026-05-05T08:00:00Z',
    deactivation_datetime: null,
  },
  {
    id: 2,
    permit_name: 'Speed Limit Enforcement',
    vehicle_category_name: 'School Bus',
    violation_type: 'OverSpeed',
    enforcement_rule_details: 'School buses must not exceed 40 km/h in school zones between 7 AM and 9 AM.',
    penalty: '₹2,000 + License Point Deduction',
    status: 'created',
    created_by_name: 'Admin User',
    create_datetime: '2026-06-01T11:00:00Z',
    activation_datetime: null,
    deactivation_datetime: null,
  },
  {
    id: 3,
    permit_name: 'State Border Crossing',
    vehicle_category_name: 'Passenger Vehicle',
    violation_type: 'state_border_cross',
    enforcement_rule_details: 'Vehicles must carry valid inter-state permit when crossing state borders.',
    penalty: '₹10,000 + Vehicle Impound',
    status: 'deactive',
    created_by_name: 'Admin User',
    create_datetime: '2026-04-01T08:00:00Z',
    activation_datetime: '2026-04-10T00:00:00Z',
    deactivation_datetime: '2026-05-31T23:59:00Z',
  },
];

// ─── Status chip renderer ─────────────────────────────────────────────────────
const StatusChip = ({ value }) => {
  const map = {
    created:  { label: 'Created',   color: '#1565c0', bg: '#e3f2fd' },
    active:   { label: 'Active',    color: '#2e7d32', bg: '#e8f5e9' },
    deactive: { label: 'Deactive',  color: '#c62828', bg: '#ffebee' },
  };
  const cfg = map[value] || { label: value || '—', color: '#555', bg: '#f5f5f5' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 12,
      fontWeight: 700, fontSize: 12, color: cfg.color, background: cfg.bg,
      textTransform: 'capitalize', border: `1.5px solid ${cfg.color}33`,
    }}>
      {cfg.label}
    </span>
  );
};

// ─── Inline status toggle button ──────────────────────────────────────────────
const StatusToggleBtn = ({ row, onStatusChange, busyId }) => {
  const { id, status } = row;
  if (status === 'created') {
    return (
      <Tooltip title="Activate">
        <span>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={busyId === id ? <CircularProgress size={14} color="inherit" /> : <PlayIcon />}
            onClick={() => onStatusChange(id, 'created')}
            disabled={busyId === id}
            style={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}
          >
            Activate
          </Button>
        </span>
      </Tooltip>
    );
  }
  if (status === 'active') {
    return (
      <Tooltip title="Deactivate">
        <span>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={busyId === id ? <CircularProgress size={14} color="inherit" /> : <StopIcon />}
            onClick={() => onStatusChange(id, 'active')}
            disabled={busyId === id}
            style={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}
          >
            Deactivate
          </Button>
        </span>
      </Tooltip>
    );
  }
  return (
    <Chip
      label="Deactivated"
      size="small"
      style={{ fontWeight: 600, background: '#ffebee', color: '#c62828', fontSize: 12 }}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PermitConditionManagement = () => {
  const dispatch = useDispatch();
  const vehicleCategoryList = useSelector((s) => s.setting.vehicleCategoryList);
  const permitConditionList = useSelector((s) => s.setting.permitConditionList);

  const [dialogOpen, setDialogOpen]   = useState(false);
  const [listLoaded, setListLoaded]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [busyId, setBusyId]           = useState(null);
  const [alert, setAlert]             = useState({ error: false, message: '', errorList: [] });
  const [alertOpen, setAlertOpen]     = useState(false);

  // Build fieldConfig dynamically (vehicle category options from Redux)
  const vehicleCategoryOptions = vehicleCategoryList.map((c) => ({
    value: String(c.id),
    label: c.category,
  }));

  const fieldConfig = {
    permit_name: {
      name: 'permit_name',
      type: 'text',
      label: 'Permit Name',
      validation: Yup.string().required('Permit Name is required'),
    },
    vehicle_category_fk: {
      name: 'vehicle_category_fk',
      type: 'select',
      label: 'Vehicle Category',
      options: vehicleCategoryOptions,
      validation: Yup.string().required('Vehicle Category is required'),
    },
    violation_type: {
      name: 'violation_type',
      type: 'select',
      label: 'Violation / Alert Type',
      options: VIOLATION_TYPE_OPTIONS,
      validation: Yup.string().required('Violation Type is required'),
    },
    penalty: {
      name: 'penalty',
      type: 'text',
      label: 'Penalty',
      validation: Yup.string().required('Penalty is required'),
    },
    enforcement_rule_details: {
      name: 'enforcement_rule_details',
      type: 'text',
      label: 'Enforcement Rule Details',
      multiline: true,
      rows: 3,
      validation: Yup.string().required('Enforcement Rule Details are required'),
    },
  };

  const validationSchema = Yup.object(
    Object.keys(fieldConfig).reduce((acc, key) => {
      acc[key] = fieldConfig[key].validation;
      return acc;
    }, {})
  );

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const res = await SettingService.filter_settings_VehicleCategory();
      dispatch(fetchVehicleCategory(res.data));
    } catch (e) {
      console.error('Failed to load vehicle categories', e);
    }
  }, [dispatch]);

  const loadPermitConditions = useCallback(async () => {
    try {
      const res = await SettingService.filter_permit_conditions({});
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      dispatch(fetchPermitConditionList(data));
    } catch (e) {
      console.error('Permit condition API not ready — using mock data');
      dispatch(fetchPermitConditionList(MOCK_DATA));
    } finally {
      setListLoaded(true);
    }
  }, [dispatch]);

  useEffect(() => {
    loadCategories();
    loadPermitConditions();
  }, [loadCategories, loadPermitConditions]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showAlert = (message, error = false, errorList = []) => {
    setAlert({ error, message, errorList });
    setAlertOpen(true);
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      await SettingService.create_permit_condition({ ...values, status: 'created' });
      setAlert({ error: false, message: 'Permit condition created successfully!', errorList: [] });
      setAlertOpen(true);
      setDialogOpen(false);
      resetForm();
      loadPermitConditions();
    } catch (e) {
      console.error(e);
      setAlert({
        error: true,
        message: 'Failed to create permit condition.',
        errorList: convertErrorObjectToArray(e?.response?.data),
      });
      setAlertOpen(true);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // ── Status toggle ─────────────────────────────────────────────────────────
  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'created' ? 'active' : 'deactive';
    setBusyId(id);
    try {
      await SettingService.update_permit_condition_status({ id, status: nextStatus });
      showAlert(`Status updated to "${nextStatus}" successfully!`);
      loadPermitConditions();
    } catch (e) {
      console.error(e);
      showAlert('Failed to update status.', true);
    } finally {
      setBusyId(null);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    { name: 'id', label: 'ID', options: { filter: false, sort: false, display: false } },
    { name: 'permit_name', label: 'Permit Name', options: { filter: true, sort: true } },
    { name: 'vehicle_category_name', label: 'Vehicle Category', options: { filter: true, sort: false } },
    { name: 'violation_type', label: 'Violation Type', options: { filter: true, sort: false } },
    {
      name: 'enforcement_rule_details',
      label: 'Enforcement Rule',
      options: {
        filter: false, sort: false,
        customBodyRender: (v) => (
          <Tooltip title={v || ''}>
            <span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v || '—'}
            </span>
          </Tooltip>
        ),
      },
    },
    { name: 'penalty', label: 'Penalty', options: { filter: true, sort: false } },
    {
      name: 'status',
      label: 'Status',
      options: {
        filter: true, sort: false,
        customBodyRender: (v) => <StatusChip value={v} />,
      },
    },
    { name: 'created_by_name', label: 'Created By', options: { filter: false, sort: false } },
    {
      name: 'create_datetime',
      label: 'Created At',
      options: {
        filter: false, sort: true,
        customBodyRender: (v) => v ? new Date(v).toLocaleString('en-IN') : '—',
      },
    },
    {
      name: 'activation_datetime',
      label: 'Activated At',
      options: {
        filter: false, sort: false,
        customBodyRender: (v) => v ? new Date(v).toLocaleString('en-IN') : '—',
      },
    },
    {
      name: 'deactivation_datetime',
      label: 'Deactivated At',
      options: {
        filter: false, sort: false,
        customBodyRender: (v) => v ? new Date(v).toLocaleString('en-IN') : '—',
      },
    },
    {
      name: 'actions',
      label: 'Action',
      options: {
        filter: false, sort: false, empty: true,
        customBodyRenderLite: (dataIndex) => {
          const row = permitConditionList[dataIndex];
          if (!row) return null;
          return (
            <StatusToggleBtn
              row={row}
              onStatusChange={handleStatusChange}
              busyId={busyId}
            />
          );
        },
      },
    },
  ];

  return (
    <>
      {/* ── Feedback Dialog (project standard) ─────────────────────────── */}
      <DialogComponent
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alert.message}
        errorList={alert.errorList}
      />

      {/* ── Add Condition Dialog ────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => { if (!loading) setDialogOpen(false); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Permit Condition</DialogTitle>

        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <DialogContent dividers>
                {loading && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    zIndex: 9999, background: 'rgba(255,255,255,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CircularProgress size={40} />
                  </div>
                )}
                <Grid container spacing={2} className="form-controller">
                  {Object.keys(fieldConfig).map((field) => (
                    <Grid
                      key={field}
                      item
                      md={field === 'enforcement_rule_details' ? 12 : 6}
                      sm={12}
                      xs={12}
                    >
                      <FormField
                        fieldConfig={fieldConfig[field]}
                        formik={formik}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Typography variant="body2" style={{ color: '#1565c0', background: '#e3f2fd', borderRadius: 6, padding: '8px 12px' }}>
                      ℹ️ New condition will be created with status <strong>"Created"</strong>. Activate it from the list when ready to enforce.
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions style={{ padding: '12px 24px' }}>
                <Button
                  onClick={() => setDialogOpen(false)}
                  variant="outlined"
                  color="inherit"
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting || loading}
                >
                  {formik.isSubmitting ? <CircularProgress size={20} /> : 'Create Condition'}
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>

      {/* ── Main Page ───────────────────────────────────────────────────── */}
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard
            title="Permit Condition Management"
            secondary={
              <Button
                variant="contained"
                color="primary"
                onClick={() => setDialogOpen(true)}
              >
                + Add New Condition
              </Button>
            }
          >
            {!listLoaded ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <CircularProgress />
              </div>
            ) : (
              <DynamicDatatables
                tableTitle="Permit Conditions"
                rows={permitConditionList}
                columns={columns}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default PermitConditionManagement;
