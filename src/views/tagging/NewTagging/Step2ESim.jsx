/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, CircularProgress, Typography, Grid, Paper, Chip, Divider,
} from '@mui/material';
import {
  SimCard, CheckCircle, ErrorOutline, Refresh, SignalCellularAlt,
  CalendarToday, AccessTime,
} from '@mui/icons-material';
import NewTaggingService from '../../../services/NewTaggingService';

// ─── helpers ─────────────────────────────────────────────────────────────────
const parseDDMMYYYY = (str) => {
  if (!str) return null;
  // Handle DD-MM-YYYY
  const parts = str.split('-');
  if (parts.length === 3 && parts[0].length === 2) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  // Already YYYY-MM-DD
  return new Date(str);
};

const formatDate = (str) => {
  const d = parseDDMMYYYY(str);
  if (!d || isNaN(d)) return str || '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ ok, label }) => (
  <Chip
    icon={ok ? <CheckCircle sx={{ fontSize: 14 }} /> : <ErrorOutline sx={{ fontSize: 14 }} />}
    label={label}
    size="small"
    sx={{
      fontWeight: 600, fontSize: '0.72rem',
      background: ok ? '#dcfce7' : '#fee2e2',
      color: ok ? '#15803d' : '#dc2626',
      border: `1px solid ${ok ? '#86efac' : '#fca5a5'}`,
      '& .MuiChip-icon': { color: ok ? '#15803d' : '#dc2626' },
    }}
  />
);

const InfoCell = ({ label, value, mono = false }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all', mt: 0.2 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const TSPBlock = ({ label, tsp, msisdn, status }) => (
  <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <InfoCell label="TSP" value={tsp} />
      <InfoCell label="MSISDN" value={msisdn} mono />
      <InfoCell label="Status" value={status} />
    </Box>
  </Paper>
);

// ─── validity check logic ────────────────────────────────────────────────────
const calcValidityResult = (simData, dateOfRegistration) => {
  if (!simData) return null;

  const THRESHOLD_DAYS = 180; // 6 months (backend-defined — adjust to match)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiredOn = parseDDMMYYYY(simData.expiredOn);
  const regDate = parseDDMMYYYY(dateOfRegistration);

  let minYears = 2;
  if (regDate) {
    const diffDays = (today - regDate) / (1000 * 60 * 60 * 24);
    minYears = diffDays > THRESHOLD_DAYS ? 1 : 2;
  }

  const minExp = new Date(today);
  minExp.setFullYear(minExp.getFullYear() + minYears);

  return {
    ok: expiredOn && expiredOn >= minExp,
    minYears,
    expiredOn,
    minExp,
  };
};

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Step2ESim({ entryId, vahanDateOfRegistration, onSuccess, setAlert }) {
  const [loading, setLoading] = useState(false);
  const [simData, setSimData] = useState(null);
  const [checkResult, setCheckResult] = useState(null); // { ok, message }
  const [validityResult, setValidityResult] = useState(null);

  useEffect(() => {
    if (entryId) runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  const runCheck = async () => {
    setLoading(true);
    setSimData(null);
    setCheckResult(null);
    try {
      const res = await NewTaggingService.checkESim(entryId);
      const d = res?.data?.sim || res?.data;
      setSimData(d);

      // frontend-side validity validation
      const vr = calcValidityResult(d, vahanDateOfRegistration);
      setValidityResult(vr);

      const passed = res?.data?.passed ?? vr?.ok ?? true;
      setCheckResult({ ok: passed, message: res?.data?.message || (passed ? 'SIM check passed.' : 'SIM validity check failed.') });

      if (passed) {
        setAlert({ open: true, type: 'success', message: 'eSIM check passed. OTP will be sent to your registered number.' });
      } else {
        setAlert({ open: true, type: 'warning', message: 'eSIM check failed. See details below.' });
      }
    } catch (err) {
      const responseData = err?.response?.data;

  let msg = "eSIM check failed. Please retry.";

  if (typeof responseData === "string") {
    if (responseData.includes("Field 'id' expected a number")) {
      msg = "Invalid device ID. A numeric ID is required.";
    } else if (responseData.includes("ValueError")) {
      msg = "Server validation error occurred while checking eSIM.";
    } else {
      msg = "Server returned an unexpected error.";
    }
  } else {
    msg =
      responseData?.detail ||
      responseData?.error ||
      responseData?.message ||
      Object.values(responseData || {})
        .flat()
        .join(" ") ||
      msg;
  }

  setCheckResult({
    ok: false,
    message: msg,
  });

  setAlert({
    open: true,
    type: "error",
    message: msg,
  });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>eSIM / M2M Check</Typography>
        <Typography variant="body2" color="text.secondary">
          We query the eSIM provider to verify SIM validity and data quota.
        </Typography>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={48} sx={{ color: '#0891b2' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Querying eSIM provider…
          </Typography>
        </Box>
      )}

      {/* Result banner */}
      {!loading && checkResult && (
        <Paper
          elevation={0}
          sx={{
            p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2,
            border: `1.5px solid ${checkResult.ok ? '#86efac' : '#fca5a5'}`,
            background: checkResult.ok ? '#f0fdf4' : '#fff1f2',
          }}
        >
          {checkResult.ok
            ? <CheckCircle sx={{ color: '#16a34a', fontSize: 28 }} />
            : <ErrorOutline sx={{ color: '#dc2626', fontSize: 28 }} />}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: checkResult.ok ? '#15803d' : '#dc2626' }}>
              {checkResult.ok ? 'Check Passed' : 'Check Failed'}
            </Typography>
            <Typography variant="body2" sx={{ color: checkResult.ok ? '#166534' : '#b91c1c', mt: 0.2 }}>
              {checkResult.message}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* SIM data card */}
      {!loading && simData && (
        <Paper
          elevation={0}
          sx={{ border: '1.5px solid #e0e7ff', borderRadius: 3, overflow: 'hidden' }}
        >
          {/* Card header */}
          <Box sx={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SimCard sx={{ color: '#fff', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>SIM Card Details</Typography>
              <Typography variant="caption" sx={{ color: '#bae6fd' }}>ICCID: {simData.iccid || simData.iccId || '—'}</Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <StatusBadge ok={simData.cardStatus === 'Active'} label={simData.cardStatus || '—'} />
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2.5}>
              {/* Dates row */}
              <Grid item xs={12} sm={6} md={3}><InfoCell label="Card State" value={simData.cardState} /></Grid>
              <Grid item xs={12} sm={6} md={3}><InfoCell label="Activate On" value={formatDate(simData.activateOn)} /></Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                    Expires On
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(simData.expiredOn)}</Typography>
                    {validityResult && (
                      <StatusBadge ok={validityResult.ok} label={validityResult.ok ? `≥${validityResult.minYears}yr ✓` : `<${validityResult.minYears}yr ✗`} />
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}><InfoCell label="Data Usage" value={simData.dataUsage ? `${simData.dataUsage} MB` : '—'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><InfoCell label="Data Usage Date" value={formatDate(simData.dataUsageDate)} /></Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            {/* TSP blocks */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TSPBlock label="Primary" tsp={simData.primaryTSP} msisdn={simData.primaryMSISDN} status={simData.primaryStatus} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TSPBlock label="Fallback" tsp={simData.fallbackTSP} msisdn={simData.fallbackMSISDN} status={simData.fallbackStatus} />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Actions */}
      {!loading && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            startIcon={<Refresh />}
            variant="outlined"
            onClick={runCheck}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Re-check
          </Button>
          {checkResult?.ok && (
            <Button
              variant="contained"
              onClick={() => onSuccess()}
              sx={{
                px: 4, borderRadius: 2, fontWeight: 700, textTransform: 'none',
                background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                boxShadow: '0 4px 16px rgba(8,145,178,0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)' },
              }}
            >
              Proceed →
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
