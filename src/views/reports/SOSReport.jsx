import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import PageHeader from '../../ui-component/cards/PageHeader';
import { gridSpacing } from '../../store/constant';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import HomePageService from '../../services/HomePage';
import { dateTimeUpdate } from '../../helper';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB');
};

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-GB');
};

const formatLatLon = (lat, lon) => {
  const latitude = lat ?? lon?.latitude;
  const longitude = lon ?? lat?.longitude;
  if (latitude === undefined || longitude === undefined) return '—';
  const latNum = Number(latitude);
  const lonNum = Number(longitude);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return '—';
  return `${latNum}, ${lonNum}`;
};

const SOSReport = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const { currentDateTime, initialFromDate } = useMemo(() => {
    const now = new Date();
    return {
      currentDateTime: dateTimeUpdate(now),
      initialFromDate: dateTimeUpdate(new Date(now.getTime() - 86400000))
    };
  }, []);

  const [filters, setFilters] = useState({
    start_datetime: initialFromDate,
    end_datetime: currentDateTime,
    district_id: '',
    call_id: '',
    vehicle_reg_no: '',
    device_imei: ''
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const fetchReport = async (override = {}) => {
    try {
      setLoading(true);
      const effectivePage = override.page ?? page;
      const effectivePageSize = override.pageSize ?? pageSize;

      const istToUTCString = (dt) => {
        const dateObj = new Date(dt);
        if (Number.isNaN(dateObj.getTime())) return undefined;
        const utc = dateObj.getTime() - (5.5 * 60 * 60000);
        const utcDate = new Date(utc);
        const y = utcDate.getFullYear();
        const m = String(utcDate.getMonth() + 1).padStart(2, '0');
        const d = String(utcDate.getDate()).padStart(2, '0');
        const h = String(utcDate.getHours()).padStart(2, '0');
        const min = String(utcDate.getMinutes()).padStart(2, '0');
        const s = String(utcDate.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d}T${h}:${min}:${s}Z`;
      };

      const params = {
        start_datetime: filters.start_datetime ? istToUTCString(filters.start_datetime) : undefined,
        end_datetime: filters.end_datetime ? istToUTCString(filters.end_datetime) : undefined,
        district_id: filters.district_id || undefined,
        call_id: filters.call_id || undefined,
        vehicle_reg_no: filters.vehicle_reg_no || undefined,
        device_imei: filters.device_imei || undefined,
        page: effectivePage + 1,
        page_size: effectivePageSize
      };

      const response = await HomePageService.getSOSReport(params);
      const payload = response?.data;
      const calls = payload?.results || payload?.calls || payload?.data || payload || [];
      const nextCount = payload?.count ?? payload?.total ?? payload?.total_count ?? (Array.isArray(calls) ? calls.length : 0);

      const mapped = Array.isArray(calls)
        ? calls.map((entry) => {
            const call = entry?.call || entry || {};
            const deviceWrap = call?.device || {};
            const device = deviceWrap?.device || deviceWrap || {};
            const vehicleOwner = deviceWrap?.vehicle_owner || {};
            const vehicleOwnerUser = vehicleOwner?.users?.[0] || {};

            const createdAt =
              entry?.created_at ||
              call?.created_at ||
              call?.createdAt ||
              call?.timestamp ||
              call?.time ||
              null;

            const triggerTime =
              call?.trigger_time ||
              call?.triggered_at ||
              call?.trigger_timestamp ||
              call?.device_timestamp ||
              null;

            const policeBroadcastTime = call?.police_broadcast_time || call?.policeBroadcastTime || null;
            const ambulanceBroadcastTime = call?.ambulance_broadcast_time || call?.ambulanceBroadcastTime || null;

            return {
              callId: entry?.id ?? call?.id ?? '—',
              sosEventDate: formatDate(createdAt),
              sosEventTime: formatTime(createdAt),
              vehicleRegistrationNumber: deviceWrap?.vehicle_reg_no ?? '—',
              vehicleCategory: deviceWrap?.vehicle_category ?? deviceWrap?.category ?? '—',
              deviceImei: device?.imei ?? '—',
              deviceMake: device?.model?.device_make ?? device?.make ?? device?.model_name ?? '—',
              sosTriggerTime: formatTime(triggerTime),
              sosTriggerLocation: formatLatLon(call?.latitude, call?.longitude),
              nearestPoliceStation: call?.nearest_police_station ?? call?.nearestPoliceStation ?? '—',
              autoAssignedSosExecutive: entry?.ex?.users?.[0]?.name ?? entry?.ex?.name ?? '—',
              autoAssignmentTime: formatTime(entry?.assigned_at ?? entry?.assignedAt ?? null),
              teamLead: entry?.team_lead?.users?.[0]?.name ?? entry?.teamLead?.name ?? '—',
              sosCallAttendedBy: entry?.attended_by?.users?.[0]?.name ?? entry?.attendedBy ?? vehicleOwnerUser?.name ?? '—',
              sosCallAcceptanceTime: formatTime(entry?.accepted_at ?? entry?.acceptedAt ?? null),
              sosBroadcastInitiatedTime: formatTime(call?.broadcast_initiated_time ?? call?.broadcastInitiatedTime ?? null),
              broadcastSentTo: call?.broadcast_sent_to ?? call?.broadcastSentTo ?? '—',
              policeBroadcastTime: formatTime(policeBroadcastTime),
              ambulanceBroadcastTime: formatTime(ambulanceBroadcastTime),
              policeAcceptanceTime: formatTime(call?.police_acceptance_time ?? call?.policeAcceptanceTime ?? null),
              ambulanceAcceptanceTime: formatTime(call?.ambulance_acceptance_time ?? call?.ambulanceAcceptanceTime ?? null),
              policeRespondingOfficer: call?.police_officer ?? call?.policeOfficer ?? '—',
              ambulanceRespondingOfficer: call?.ambulance_officer ?? call?.ambulanceOfficer ?? '—',
              caseType: call?.case_type ?? call?.incident_category ?? call?.incidentCategory ?? '—',
              policeCaseClosureTime: formatTime(call?.police_case_closure_time ?? call?.policeCaseClosureTime ?? null),
              ambulanceCaseClosureTime: formatTime(call?.ambulance_case_closure_time ?? call?.ambulanceCaseClosureTime ?? null),
              closureLocation: formatLatLon(call?.closure_latitude ?? null, call?.closure_longitude ?? null),
              totalDistanceKm: call?.total_distance_km ?? call?.totalDistanceKm ?? '—',
              totalSosCallDuration: call?.total_call_duration ?? call?.totalCallDuration ?? '—',
              responseTime: call?.response_time ?? call?.responseTime ?? '—',
              policeResponseTimeMins: call?.police_response_time_mins ?? call?.policeResponseTimeMins ?? '—',
              ambulanceResponseTimeMins: call?.ambulance_response_time_mins ?? call?.ambulanceResponseTimeMins ?? '—',
              finalCaseStatus: call?.final_case_status ?? call?.finalCaseStatus ?? call?.status ?? '—'
            };
          })
        : [];

      setRows(mapped);
      setCount(Number.isFinite(Number(nextCount)) ? Number(nextCount) : 0);
    } catch (error) {
      console.error('Error fetching SOS report:', error);
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterChange = (key) => (event) => {
    const value = event?.target?.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFromDateChange = useCallback(
    (e) => {
      const selected = new Date(e.target.value);
      if (Number.isNaN(selected.getTime())) return;

      const today = new Date();
      if (selected > today) {
        alert('From Date cannot be in the future');
        return;
      }

      setFilters((prev) => ({ ...prev, start_datetime: dateTimeUpdate(selected) }));
    },
    []
  );

  const handleToDateChange = useCallback(
    (e) => {
      const selected = new Date(e.target.value);
      if (Number.isNaN(selected.getTime())) return;

      const today = new Date();
      if (selected > today) {
        alert('To Date cannot be in the future');
        return;
      }

      setFilters((prev) => ({ ...prev, end_datetime: dateTimeUpdate(selected) }));
    },
    []
  );

  const handleSearch = () => {
    setPage(0);
    fetchReport({ page: 0 });
  };

  const columns = useMemo(
    () => [
      { name: 'callId', label: 'Call ID', options: { filter: true, sort: true } },
      { name: 'sosEventDate', label: 'SOS Event Date', options: { filter: true, sort: true } },
      { name: 'sosEventTime', label: 'SOS Event Time', options: { filter: true, sort: true } },
      { name: 'vehicleRegistrationNumber', label: 'Vehicle Registration Number', options: { filter: true, sort: true } },
      { name: 'vehicleCategory', label: 'Vehicle Type', options: { filter: true, sort: true } },
      { name: 'deviceImei', label: 'Device ID / IMEI', options: { filter: true, sort: true } },
      { name: 'deviceMake', label: 'Device Make', options: { filter: true, sort: true } },
      { name: 'sosTriggerTime', label: 'SOS Trigger Time (Device Timestamp)', options: { filter: true, sort: true } },
      { name: 'sosTriggerLocation', label: 'SOS Trigger Location (Latitude / Longitude)', options: { filter: false, sort: false } },
      { name: 'nearestPoliceStation', label: 'Nearest Police Station (Auto-Mapped)', options: { filter: true, sort: true } },
      { name: 'autoAssignedSosExecutive', label: 'Auto-Assigned SOS Executive', options: { filter: true, sort: true } },
      { name: 'autoAssignmentTime', label: 'Auto-Assignment Time', options: { filter: true, sort: true } },
      { name: 'teamLead', label: 'Team Lead', options: { filter: true, sort: true } },
      { name: 'sosCallAttendedBy', label: 'SOS Call Attended By (Executive Name / ID)', options: { filter: true, sort: true } },
      { name: 'sosCallAcceptanceTime', label: 'SOS Call Acceptance Time', options: { filter: true, sort: true } },
      { name: 'sosBroadcastInitiatedTime', label: 'SOS Broadcast Initiated Time', options: { filter: true, sort: true } },
      { name: 'broadcastSentTo', label: 'Broadcast Sent To (Police / Ambulance / Both)', options: { filter: true, sort: true } },
      { name: 'policeBroadcastTime', label: 'Police Broadcast Time', options: { filter: true, sort: true } },
      { name: 'ambulanceBroadcastTime', label: 'Ambulance Broadcast Time', options: { filter: true, sort: true } },
      { name: 'policeAcceptanceTime', label: 'Police Acceptance Time', options: { filter: true, sort: true } },
      { name: 'ambulanceAcceptanceTime', label: 'Ambulance Acceptance Time', options: { filter: true, sort: true } },
      { name: 'policeRespondingOfficer', label: 'Police Responding Officer / User ID', options: { filter: true, sort: true } },
      { name: 'ambulanceRespondingOfficer', label: 'Ambulance Responding Officer / User ID', options: { filter: true, sort: true } },
      { name: 'caseType', label: 'Case Type / Incident Category', options: { filter: true, sort: true } },
      { name: 'policeCaseClosureTime', label: 'Police Case Closure Time', options: { filter: true, sort: true } },
      { name: 'ambulanceCaseClosureTime', label: 'Ambulance Case Closure Time', options: { filter: true, sort: true } },
      { name: 'closureLocation', label: 'Closure Location (Latitude / Longitude)', options: { filter: false, sort: false } },
      { name: 'totalDistanceKm', label: 'Total Distance Covered During SOS (km)', options: { filter: true, sort: true } },
      { name: 'totalSosCallDuration', label: 'Total SOS Call Duration (hh:mm:ss)', options: { filter: true, sort: true } },
      { name: 'responseTime', label: 'Response Time (Trigger → First Acceptance)', options: { filter: true, sort: true } },
      { name: 'policeResponseTimeMins', label: 'Police Response Time (mins)', options: { filter: true, sort: true } },
      { name: 'ambulanceResponseTimeMins', label: 'Ambulance Response Time (mins)', options: { filter: true, sort: true } },
      { name: 'finalCaseStatus', label: 'Final Case Status', options: { filter: true, sort: true } }
    ],
    []
  );

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="SOS Report" />
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                required
                label="From Date"
                type="datetime-local"
                value={filters.start_datetime}
                onChange={handleFromDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: currentDateTime }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                required
                label="To Date"
                type="datetime-local"
                value={filters.end_datetime}
                onChange={handleToDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: currentDateTime }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="District ID"
                value={filters.district_id}
                onChange={handleFilterChange('district_id')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Call ID"
                value={filters.call_id}
                onChange={handleFilterChange('call_id')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Vehicle Reg No"
                value={filters.vehicle_reg_no}
                onChange={handleFilterChange('vehicle_reg_no')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Device IMEI"
                value={filters.device_imei}
                onChange={handleFilterChange('device_imei')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Search
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => fetchReport()}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Refresh
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        {!loading && (
          <DynamicDatatables
            tableTitle="SOS Report"
            rows={rows}
            columns={columns}
            options={{
              search: true,
              filter: true,
              selectableRows: 'none',
              serverSide: true,
              count,
              page,
              rowsPerPage: pageSize,
              rowsPerPageOptions: [25, 50, 100],
              onTableChange: (action, tableState) => {
                if (action === 'changePage') {
                  const nextPage = tableState.page;
                  setPage(nextPage);
                  fetchReport({ page: nextPage });
                }
                if (action === 'changeRowsPerPage') {
                  const nextPageSize = tableState.rowsPerPage;
                  setPageSize(nextPageSize);
                  setPage(0);
                  fetchReport({ page: 0, pageSize: nextPageSize });
                }
              }
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SOSReport;
