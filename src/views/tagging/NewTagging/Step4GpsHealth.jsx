/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Box, Button, Typography, CircularProgress, Paper, Grid,
  Chip, Tooltip, Divider,
} from '@mui/material';
import {
  CheckCircle, Cancel, HelpOutline, Refresh, WifiTethering,
  GpsFixed, SatelliteAlt, Sos, AccessTime,
} from '@mui/icons-material';
import NewTaggingService from '../../../services/NewTaggingService';

// ─── packet definitions ───────────────────────────────────────────────────────
const PACKETS = [
  {
    key: 'login_packet',
    label: 'Login Packet',
    icon: WifiTethering,
    source: 'GPSDataLog',
    color: '#7c3aed',
  },
  {
    key: 'health_packet',
    label: 'Health Packet',
    icon: AccessTime,
    source: 'GPSDataLog',
    color: '#0891b2',
  },
  {
    key: 'pvt_packet',
    label: 'PVT Packet',
    icon: GpsFixed,
    source: 'GPSDataLog',
    color: '#059669',
  },
  {
    key: 'emergency_start',
    label: 'Emergency Start',
    icon: Sos,
    source: 'GPSDataLog',
    color: '#d97706',
  },
  {
    key: 'ble_emergency_start',
    label: 'BLE Emergency Start',
    icon: Sos,
    source: 'GPSDataLog',
    color: '#b45309',
  },
  {
    key: 'emergency_stop',
    label: 'Emergency Stop',
    icon: Cancel,
    source: 'GPSDataLog',
    color: '#6b7280',
  },
  {
    key: 'sos_start',
    label: 'SOS Start',
    icon: Sos,
    source: 'GPSemDataLog',
    color: '#dc2626',
  },
  {
    key: 'sos_start_ble',
    label: 'SOS Start BLE',
    icon: Sos,
    source: 'GPSemDataLog',
    color: '#991b1b',
  },
  {
    key: 'sos_stop',
    label: 'SOS Stop',
    icon: Cancel,
    source: 'GPSemDataLog',
    color: '#374151',
  },
];

// ─── status badge ────────────────────────────────────────────────────────────
const PacketStatus = ({ received }) => {
  if (received === true)
    return <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Received" size="small" sx={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 700, '& .MuiChip-icon': { color: '#15803d' } }} />;
  if (received === false)
    return <Chip icon={<Cancel sx={{ fontSize: 14 }} />} label="Not Received" size="small" sx={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 700, '& .MuiChip-icon': { color: '#dc2626' } }} />;
  return <Chip icon={<HelpOutline sx={{ fontSize: 14 }} />} label="Not Checked" size="small" sx={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }} />;
};

// ─── packet row ──────────────────────────────────────────────────────────────
const PacketRow = ({ packet, data, isPvt }) => {
  const { label, icon: Icon, color, source } = packet;
  const received = data?.received ?? null;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: 2,
      p: 2, borderRadius: 2,
      background: received === true ? '#f0fdf4' : received === false ? '#fff1f2' : '#f8fafc',
      border: `1px solid ${received === true ? '#bbf7d0' : received === false ? '#fecaca' : '#e2e8f0'}`,
      transition: 'all 0.2s',
    }}>
      {/* Icon */}
      <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.3 }}>
        <Icon sx={{ fontSize: 18, color }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{label}</Typography>
          <Chip label={source} size="small" sx={{ fontSize: '0.62rem', height: 18, background: '#f1f5f9', color: '#64748b', fontFamily: 'monospace' }} />
          <PacketStatus received={received} />
        </Box>

        {data?.timestamp && (
          <Typography variant="caption" color="text.secondary">
            Latest: {new Date(data.timestamp).toLocaleString('en-IN')}
          </Typography>
        )}

        {data?.raw_data && (
          <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: '#64748b', mt: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {String(data.raw_data).substring(0, 80)}{String(data.raw_data).length > 80 ? '…' : ''}
          </Typography>
        )}

        {/* PVT lat/lon */}
        {isPvt && data?.lat !== undefined && data?.lon !== undefined && (
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
              Lat: {data.lat} &nbsp; Lon: {data.lon}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Step4GpsHealth({ entryId, onSuccess, setAlert }) {
  const [loading, setLoading] = useState(false);
  const [packets, setPackets] = useState(null); // { login: {...}, health: {...}, ... }
  const [checked, setChecked] = useState(false);

  const runCheck = async () => {
  if (!entryId) {
    setAlert({
      open: true,
      type: 'error',
      message: 'Entry ID is missing. Cannot check GPS packets.',
    });
    return;
  }

  setLoading(true);

  try {
    const res = await NewTaggingService.checkGpsPackets(entryId);

    const responseData = res?.data;
    const data = responseData?.data;

    const packetData = data?.packets || {};


    setPackets(packetData);
    setChecked(true);

    const allReceived = data?.all_received === true;

    if (allReceived && responseData?.status === 'success') {
      setAlert({
        open: true,
        type: 'success',
        message:
          responseData?.message ||
          'All GPS packets verified successfully.',
      });
    } else {
      setAlert({
        open: true,
        type: 'warning',
        message:
          responseData?.message ||
          'Some GPS packets are missing or stale — review the table below.',
      });
    }
  } catch (err) {
    console.error('STEP 4 API ERROR:', err);

    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      'GPS packet check failed.';

    setAlert({
      open: true,
      type: 'error',
      message: msg,
    });
  } finally {
    setLoading(false);
  }
};

  const allPassed =
  checked &&
  PACKETS.every(
    (p) => packets?.[p.key]?.received === true
  );
  const passCount = checked ? PACKETS.filter((p) => packets?.[p.key]?.received === true).length : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>GPS Packet Health</Typography>
          <Typography variant="body2" color="text.secondary">
            Checks 9 packet types across GPSDataLog and GPSemDataLog for this IMEI + ICCID.
          </Typography>
        </Box>
        {checked && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
            background: allPassed ? '#f0fdf4' : '#fff7ed',
            border: `1.5px solid ${allPassed ? '#86efac' : '#fed7aa'}`,
          }}>
            <SatelliteAlt sx={{ color: allPassed ? '#15803d' : '#d97706', fontSize: 22 }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Packets Received</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: allPassed ? '#15803d' : '#d97706' }}>
                {passCount} / {PACKETS.length}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Check button */}
      <Button
        variant={checked ? 'outlined' : 'contained'}
        startIcon={loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <Refresh />}
        onClick={runCheck}
        disabled={loading}
        sx={{
          mb: 3, borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3,
          ...(checked ? {} : {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
            color: '#fff',
            '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' },
          }),
        }}
      >
        {loading ? 'Checking…' : checked ? 'Re-check Live' : 'Run Packet Check'}
      </Button>

      {/* Packet rows */}
      {checked && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {PACKETS.map((p) => (
            <PacketRow key={p.key} packet={p} data={packets?.[p.key]} isPvt={p.key === 'pvt_packet'} />
          ))}
        </Box>
      )}

      {/* Proceed */}
      {checked && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="contained"
            onClick={() => onSuccess()}
            sx={{
              px: 5, py: 1.4, borderRadius: 2, fontWeight: 700, textTransform: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' },
            }}
          >
            Proceed to Owner OTP →
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            You can proceed even if some packets are missing — backend will enforce mandatory ones.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
