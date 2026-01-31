import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import PageHeader from '../../ui-component/cards/PageHeader';
import { gridSpacing } from '../../store/constant';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import HomePageService from '../../services/HomePage';

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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await HomePageService.getAllSOSCall();
      const calls = response?.data?.calls || [];

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
    } catch (error) {
      console.error('Error fetching SOS report:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const columns = useMemo(
    () => [
      { name: 'callId', label: 'Call ID', options: { filter: true, sort: true } },
      { name: 'sosEventDate', label: 'SOS Event Date', options: { filter: true, sort: true } },
      { name: 'sosEventTime', label: 'SOS Event Time', options: { filter: true, sort: true } },
      { name: 'vehicleRegistrationNumber', label: 'Vehicle Registration Number', options: { filter: true, sort: true } },
      { name: 'vehicleCategory', label: 'Vehicle Category', options: { filter: true, sort: true } },
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
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={fetchReport} disabled={loading}>
            Refresh
          </Button>
        </Stack>
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
              rowsPerPage: 25
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SOSReport;
