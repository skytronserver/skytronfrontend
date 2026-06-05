import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Paper, Typography, TextField, Button,
  MenuItem, FormControl, InputLabel, Select,
  Box, Chip, IconButton, Tooltip, Collapse,
  Card, CardContent, CircularProgress,
} from '@mui/material';
import {
  DataGrid
} from '@mui/x-data-grid';
import {
  FilterList, Clear, ExpandMore, ExpandLess, Download, Refresh
} from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import CustomLoader from '../../ui-component/CustomLoader';
import SettingService from '../../services/SettingService';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVehicleCategory, fetchPermitConditionList } from '../../actions/settingAction';

// ─── Alert/Violation types ────────────────────────────────────────────────────
const VIOLATION_TYPES = [
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

const EMPTY_FILTERS = {
  start_datetime: '',
  end_datetime: '',
  permit_condition_id: '',
  violation_type: '',
  vehicle_type: '',
  vehicle_reg_no: '',
  imei: '',
};

// ─── Mock data (removed when backend is ready) ────────────────────────────────
const MOCK_VIOLATIONS = [
  {
    id: 1,
    violation_type: 'OverSpeed',
    permit_condition_name: 'Speed Limit Enforcement',
    vehicle_reg_no: 'MH12AB1234',
    imei: '860123456789012',
    vehicle_category: 'School Bus',
    penalty: '₹2,000',
    enforcement_rule: 'School buses must not exceed 40 km/h',
    alert_timestamp: '2026-06-01T08:22:10Z',
    status: 'in',
  },
  {
    id: 2,
    violation_type: 'Overtime',
    permit_condition_name: 'Night Driving Restriction',
    vehicle_reg_no: 'DL5SAS7890',
    imei: '860987654321098',
    vehicle_category: 'Heavy Commercial Vehicle',
    penalty: '₹5,000',
    enforcement_rule: 'Vehicles not permitted to operate between 11 PM and 5 AM',
    alert_timestamp: '2026-06-02T23:45:00Z',
    status: 'out',
  },
  {
    id: 3,
    violation_type: 'state_border_cross',
    permit_condition_name: 'State Border Crossing',
    vehicle_reg_no: 'KA09MN4567',
    imei: '860111222333444',
    vehicle_category: 'Passenger Vehicle',
    penalty: '₹10,000',
    enforcement_rule: 'Must carry valid inter-state permit',
    alert_timestamp: '2026-06-03T14:10:00Z',
    status: 'in',
  },
];

const formatDT = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ViolationReport = () => {
  const dispatch = useDispatch();
  const vehicleCategoryList = useSelector((s) => s.setting.vehicleCategoryList);
  const permitConditionList = useSelector((s) => s.setting.permitConditionList);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // ── Load select lists ────────────────────────────────────────────────────
  useEffect(() => {
    const loadLists = async () => {
      try {
        const catRes = await SettingService.filter_settings_VehicleCategory();
        dispatch(fetchVehicleCategory(catRes.data));
      } catch (e) { console.error(e); }

      try {
        const pcRes = await SettingService.filter_permit_conditions({});
        dispatch(fetchPermitConditionList(Array.isArray(pcRes.data) ? pcRes.data : pcRes.data?.results || []));
      } catch (e) {
        // Use mock permit conditions if backend not ready
        dispatch(fetchPermitConditionList([
          { id: 1, permit_name: 'Night Driving Restriction' },
          { id: 2, permit_name: 'Speed Limit Enforcement' },
          { id: 3, permit_name: 'State Border Crossing' },
        ]));
      }
    };
    loadLists();
  }, [dispatch]);

  // ── Fetch violation report data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {};
      Object.keys(filters).forEach((k) => {
        if (filters[k] !== '' && filters[k] !== null && filters[k] !== undefined) {
          payload[k] = filters[k];
        }
      });
      payload.page = page + 1;
      payload.page_size = pageSize;

      const res = await SettingService.filter_violation_report(payload);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setReportData(data.map((r, i) => ({ ...r, id: r.id || i + 1 })));
      setTotalRows(res.data?.pagination?.total_records || data.length);
    } catch (e) {
      console.error('Violation report API not ready — showing mock data');
      setReportData(MOCK_VIOLATIONS);
      setTotalRows(MOCK_VIOLATIONS.length);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  // Load initial data
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setPage(0);
    setTimeout(() => fetchData(), 100);
  };

  const getActiveCount = () =>
    Object.values(filters).filter((v) => v !== '' && v !== null).length;

  // ── Export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!reportData.length) return;
    const headers = ['ID', 'Violation Type', 'Permit Condition', 'Reg No', 'IMEI', 'Vehicle Category', 'Penalty', 'Enforcement Rule', 'Alert Timestamp', 'Status'];
    const rows = reportData.map((r) => [
      r.id, r.violation_type, r.permit_condition_name, r.vehicle_reg_no,
      r.imei, r.vehicle_category, r.penalty, r.enforcement_rule,
      formatDT(r.alert_timestamp), r.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((f) => `"${f || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `violation_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.display = 'none'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── DataGrid columns ─────────────────────────────────────────────────────
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, flex: 0.4 },
    {
      field: 'violation_type',
      headerName: 'Violation Type',
      width: 160, flex: 1,
      renderCell: (p) => (
        <Chip
          label={p.value || '—'}
          size="small"
          color={p.value === 'OverSpeed' ? 'error' : 'default'}
          sx={{ fontWeight: 600, fontSize: 12 }}
        />
      ),
    },
    { field: 'permit_condition_name', headerName: 'Permit Condition', width: 200, flex: 1.2 },
    { field: 'vehicle_reg_no', headerName: 'Reg No', width: 140, flex: 0.9 },
    { field: 'imei', headerName: 'IMEI', width: 170, flex: 1 },
    { field: 'vehicle_category', headerName: 'Vehicle Category', width: 160, flex: 1 },
    { field: 'penalty', headerName: 'Penalty', width: 130, flex: 0.8 },
    {
      field: 'enforcement_rule',
      headerName: 'Enforcement Rule',
      width: 220, flex: 1.5,
      renderCell: (p) => (
        <Tooltip title={p.value || ''}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 210 }}>
            {p.value || '—'}
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'alert_timestamp',
      headerName: 'Alert Timestamp',
      width: 190, flex: 1.2,
      valueFormatter: (p) => formatDT(p.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 90, flex: 0.6,
      renderCell: (p) => (
        <Chip
          label={p.value?.toUpperCase() || '—'}
          size="small"
          color={p.value === 'in' ? 'success' : 'warning'}
          sx={{ fontWeight: 700, fontSize: 11 }}
        />
      ),
    },
  ];

  return (
    <MainCard title="Violation Report">
      <Grid container spacing={3}>

        {/* ── Summary chips ───────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
            {[
              { label: 'Total Violations', value: totalRows, color: '#1565c0', bg: '#e3f2fd' },
              { label: 'Active (in)',  value: reportData.filter((r) => r.status === 'in').length,  color: '#2e7d32', bg: '#e8f5e9' },
              { label: 'Resolved (out)', value: reportData.filter((r) => r.status === 'out').length, color: '#e65100', bg: '#fff3e0' },
            ].map((s) => (
              <Paper key={s.label} elevation={0} sx={{
                px: 2, py: 1, borderRadius: 2, border: `1.5px solid ${s.color}33`,
                background: s.bg, display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Box>
                  <Typography variant="caption" sx={{ color: s.color, fontWeight: 600, display: 'block', lineHeight: 1 }}>{s.label}</Typography>
                  <Typography variant="h5" sx={{ color: s.color, fontWeight: 800, lineHeight: 1.2 }}>{s.value}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* ── Filter Card ─────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setFiltersExpanded((p) => !p)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                  <FilterList />
                  Filter Options
                  {!filtersExpanded && getActiveCount() > 0 && (
                    <Chip label={`${getActiveCount()} active`} size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <IconButton size="small">
                  {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={filtersExpanded}>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>

                    {/* Start DateTime */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth label="Start Date & Time"
                        type="datetime-local"
                        value={filters.start_datetime}
                        onChange={(e) => setFilters((p) => ({ ...p, start_datetime: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* End DateTime */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth label="End Date & Time"
                        type="datetime-local"
                        value={filters.end_datetime}
                        onChange={(e) => setFilters((p) => ({ ...p, end_datetime: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* Permit Condition */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Permit Condition</InputLabel>
                        <Select
                          value={filters.permit_condition_id}
                          label="Permit Condition"
                          onChange={(e) => setFilters((p) => ({ ...p, permit_condition_id: e.target.value }))}
                        >
                          <MenuItem value="">All Conditions</MenuItem>
                          {permitConditionList.map((pc) => (
                            <MenuItem key={pc.id} value={pc.id}>{pc.permit_name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Violation Type */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Violation / Alert Type</InputLabel>
                        <Select
                          value={filters.violation_type}
                          label="Violation / Alert Type"
                          onChange={(e) => setFilters((p) => ({ ...p, violation_type: e.target.value }))}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          {VIOLATION_TYPES.map((t) => (
                            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Vehicle Type */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Vehicle Type</InputLabel>
                        <Select
                          value={filters.vehicle_type}
                          label="Vehicle Type"
                          onChange={(e) => setFilters((p) => ({ ...p, vehicle_type: e.target.value }))}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          {vehicleCategoryList.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.category}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Vehicle Reg No */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth label="Vehicle Reg No"
                        value={filters.vehicle_reg_no}
                        onChange={(e) => setFilters((p) => ({ ...p, vehicle_reg_no: e.target.value }))}
                        placeholder="e.g. MH12AB1234"
                      />
                    </Grid>

                    {/* IMEI */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth label="IMEI / Device ESN"
                        value={filters.imei}
                        onChange={(e) => setFilters((p) => ({ ...p, imei: e.target.value }))}
                        placeholder="e.g. 860123456789012"
                      />
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<FilterList />}
                          onClick={handleSearch}
                          sx={{ fontWeight: 700, minWidth: 130 }}
                        >
                          Apply Filters
                        </Button>
                        <Tooltip title="Clear all filters">
                          <IconButton onClick={handleClear} color="inherit" size="medium">
                            <Clear />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                          <IconButton onClick={() => fetchData()} color="primary" size="medium">
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Results Table ────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Violation Records
                {totalRows > 0 && (
                  <Chip label={`${totalRows} total`} size="small" color="primary" sx={{ ml: 1.5, fontWeight: 700 }} />
                )}
              </Typography>
              {reportData.length > 0 && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Download />}
                  onClick={exportCSV}
                  size="small"
                  sx={{ fontWeight: 700 }}
                >
                  Export CSV
                </Button>
              )}
            </Box>

            {loading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CustomLoader />
              </Box>
            ) : (
              <Box sx={{
                height: 560,
                width: '100%',
                '& .MuiDataGrid-root': { border: 'none' },
                '& .MuiDataGrid-columnHeaders': { background: '#f8f9fa', fontWeight: 700 },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
              }}>
                <DataGrid
                  rows={reportData}
                  columns={columns}
                  pageSize={pageSize}
                  page={page}
                  rowCount={totalRows}
                  paginationMode="server"
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  pagination
                  disableSelectionOnClick
                  getRowHeight={() => 'auto'}
                  sx={{
                    '& .MuiDataGrid-cell': { padding: '8px', alignItems: 'center' },
                    '& .MuiDataGrid-columnHeader': { padding: '8px' },
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

    </MainCard>
  );
};

export default ViolationReport;
