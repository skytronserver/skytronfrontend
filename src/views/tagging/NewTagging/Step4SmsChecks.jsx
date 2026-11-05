import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { CheckCircle, HourglassEmpty, Sms, SwapHoriz } from '@mui/icons-material';
import NewTaggingService from '../../../services/NewTaggingService';

// Step 4 SMS checks: health check SMS on profile 1 and profile 2, then the
// activation command and its reply. Replies come back by SMS and can take a
// few minutes, so the panel polls the status while it is open.
const POLL_MS = 15000;

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-IN') : '—');

const minutesLeft = (iso) => {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 60000));
};

const Badge = ({ passed, waiting }) => {
  if (passed)
    return <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Reply received" size="small" sx={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 700, '& .MuiChip-icon': { color: '#15803d' } }} />;
  if (waiting)
    return <Chip icon={<HourglassEmpty sx={{ fontSize: 14 }} />} label="Waiting for reply" size="small" sx={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontWeight: 700, '& .MuiChip-icon': { color: '#c2410c' } }} />;
  return <Chip label="Not sent" size="small" sx={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }} />;
};

export default function Step4SmsChecks({ entryId, setAlert, onStateChange }) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    if (!entryId) return;
    try {
      const res = await NewTaggingService.getStep4SmsStatus(entryId);
      const data = res?.data?.data || null;
      setState(data);
      if (onStateChange) onStateChange(data);
    } catch (err) {
      // Not at step 4 any more, or the entry is gone: stop quietly.
      console.error('Step 4 SMS status failed:', err);
    }
  }, [entryId, onStateChange]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const send = async (action, profile) => {
    setBusy(`${action}_${profile || ''}`);
    try {
      const res = await NewTaggingService.sendStep4Sms(entryId, action, profile);
      setAlert({ open: true, type: 'success', message: res?.data?.message || 'SMS sent.' });
      if (res?.data?.data) {
        setState(res.data.data);
        if (onStateChange) onStateChange(res.data.data);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not send the SMS.';
      setAlert({ open: true, type: 'error', message: msg });
      if (err?.response?.data?.data) setState(err.response.data.data);
    } finally {
      setBusy(null);
    }
  };

  if (!state) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
        <CircularProgress size={16} /> <Typography variant="body2" color="text.secondary">Loading SMS checks…</Typography>
      </Box>
    );
  }

  const steps = state.steps || [];
  const health = steps.filter((s) => s.key.startsWith('health_'));
  const activation = steps.find((s) => s.key === 'activation');
  const passedCount = steps.filter((s) => s.passed).length;
  const btnSx = { borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '0.78rem' };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e' }}>SMS Checks</Typography>
          <Typography variant="body2" color="text.secondary">
            Health check by SMS on both SIM profiles, then the activation command. The device is on
            {' '}<b>profile {state.current_profile}</b>. Replies go to {state.reply_number} and can take a few minutes.
            {!state.required && ' (Optional for now.)'}
          </Typography>
        </Box>
        <Chip label={`${passedCount} / ${steps.length} passed`} sx={{ fontWeight: 800, background: state.all_passed ? '#dcfce7' : '#fff7ed', color: state.all_passed ? '#15803d' : '#c2410c' }} />
      </Box>

      {/* Profile switch */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
        <SwapHoriz sx={{ color: '#64748b' }} />
        <Typography variant="body2" sx={{ color: '#334155' }}>Switch SIM profile:</Typography>
        {[1, 2].map((p) => (
          <Button
            key={p}
            size="small"
            variant={state.current_profile === p ? 'contained' : 'outlined'}
            disabled={!!busy || !!state.profile_cooldown_until}
            onClick={() => send('set_profile', p)}
            sx={btnSx}
          >
            {busy === `set_profile_${p}` ? 'Sending…' : `Profile ${p} (${p === 1 ? 'primary' : 'secondary'})`}
          </Button>
        ))}
        <Typography variant="caption" color="text.secondary">After switching, wait 2-5 minutes for the device to register.</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {health.map((s) => {
          const waiting = !s.passed && !!s.last_sent_at;
          return (
            <Box key={s.key} sx={{ p: 2, borderRadius: 2, background: s.passed ? '#f0fdf4' : '#f8fafc', border: `1px solid ${s.passed ? '#bbf7d0' : '#e2e8f0'}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Sms sx={{ fontSize: 18, color: '#0891b2' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.label}</Typography>
                <Badge passed={s.passed} waiting={waiting} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                SMS to {s.sms_to || 'no number on record'}{s.last_sent_at ? ` · last sent ${fmt(s.last_sent_at)}` : ''}
                {!s.passed && !s.device_on_profile && ` · switch to profile ${s.profile} first`}
              </Typography>
              {s.passed && s.result?.sms && (
                <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: '#15803d', mt: 0.5, wordBreak: 'break-all' }}>
                  {fmt(s.result.sms.received_at)} · network {s.result.network} · {s.result.sms.text}
                </Typography>
              )}
              {!s.passed && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={!!busy || !!s.next_send_at || !s.sms_to}
                  onClick={() => send('health', s.profile)}
                  sx={{ ...btnSx, mt: 1, background: '#0891b2' }}
                >
                  {busy === `health_${s.profile}` ? 'Sending…' : s.next_send_at
                    ? `Resend in ${minutesLeft(s.next_send_at)} min`
                    : s.last_sent_at ? 'Resend health check' : 'Send health check'}
                </Button>
              )}
            </Box>
          );
        })}

        {activation && (
          <Box sx={{ p: 2, borderRadius: 2, background: activation.passed ? '#f0fdf4' : '#f8fafc', border: `1px solid ${activation.passed ? '#bbf7d0' : '#e2e8f0'}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Sms sx={{ fontSize: 18, color: '#7c3aed' }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{activation.label}</Typography>
              <Badge passed={activation.passed} waiting={!activation.passed && !!activation.last_sent_at} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              SMS to {activation.sms_to || 'no number on record'}
              {activation.last_sent_at ? ` · last sent ${fmt(activation.last_sent_at)}` : ''}
              {activation.codes_sent?.length ? ` · code${activation.codes_sent.length > 1 ? 's' : ''} ${activation.codes_sent.join(', ')}` : ''}
            </Typography>
            {activation.passed && activation.result?.sms && (
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: '#15803d', mt: 0.5, wordBreak: 'break-all' }}>
                {fmt(activation.result.sms.received_at)} · {activation.result.sms.text}
              </Typography>
            )}
            {!activation.passed && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!!busy || !activation.can_send}
                  onClick={() => send('activation')}
                  sx={{ ...btnSx, mt: 1, background: '#7c3aed' }}
                >
                  {busy === 'activation_' ? 'Sending…'
                    : activation.last_sent_at
                      ? (activation.can_send ? 'Resend activation command' : `Resend available in ${minutesLeft(activation.next_send_at)} min`)
                      : 'Send activation command'}
                </Button>
                {activation.blocked_reason && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{activation.blocked_reason}</Typography>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
