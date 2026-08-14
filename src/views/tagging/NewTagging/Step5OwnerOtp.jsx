/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { PhoneAndroid, Refresh, Lock, EmojiEvents, Send, CheckCircle } from '@mui/icons-material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import NewTaggingService from '../../../services/NewTaggingService';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 180;

// ─── success screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ onFinish }) => (
  <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
    <Box sx={{
      position: 'relative', width: 100, height: 100, margin: '0 auto 24px',
    }}>
      <Box sx={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'linear-gradient(135deg, #16a34a, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(22,163,74,0.45)',
        animation: 'pulse-ring 1.5s ease-in-out',
      }}>
        <EmojiEvents sx={{ fontSize: 48, color: '#fff' }} />
      </Box>
    </Box>

    <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>
      Tagging Complete!
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360, margin: '0 auto 32px' }}>
      Owner OTP verified. <strong>DeviceStock</strong> and <strong>DeviceTag</strong> records have been created successfully.
    </Typography>

    <Button
      variant="contained"
      size="large"
      onClick={onFinish}
      sx={{
        px: 5, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        boxShadow: '0 6px 24px rgba(124,58,237,0.45)',
        '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' },
      }}
    >
      Tag Another Device
    </Button>
  </Box>
);

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Step5OwnerOtp({ entryId, onSuccess, setAlert }) {
  const [phase, setPhase] = useState('send'); // 'send' | 'verify' | 'done'
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const startTimer = () => {
    setTimer(RESEND_COOLDOWN);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((p) => { if (p <= 1) { clearInterval(intervalRef.current); return 0; } return p - 1; });
    }, 1000);
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSend = async () => {
    setSending(true);
    try {
      await NewTaggingService.sendOwnerOtp(entryId);
      startTimer();
      setPhase('verify');
      setAlert({ open: true, type: 'success', message: 'OTP sent to the vehicle owner\'s phone.' });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Failed to send OTP. Please retry.';
      setAlert({ open: true, type: 'error', message: msg });
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await NewTaggingService.resendOwnerOtp(entryId);
      startTimer();
      setOtp('');
      setAlert({ open: true, type: 'success', message: 'OTP resent to the owner.' });
    } catch (err) {
      setAlert({ open: true, type: 'error', message: err?.response?.data?.detail || 'Resend failed.' });
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setAlert({ open: true, type: 'warning', message: `Enter all ${OTP_LENGTH} digits.` });
      return;
    }
    setVerifying(true);
    try {
      await NewTaggingService.verifyOwnerOtp(entryId, otp);
      setPhase('done');
      setAlert({ open: true, type: 'success', message: 'Owner OTP verified! Records created.' });
    } catch (err) {
      const status = err?.response?.status;
      const msg = (status === 400 || status === 401 || status === 403)
        ? 'Incorrect OTP. Ask the owner to re-confirm.'
        : (err?.response?.data?.detail || 'Verification failed.');
      setAlert({ open: true, type: 'error', message: msg });
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  if (phase === 'done') return <SuccessScreen onFinish={onSuccess} />;

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #16a34a20, #05966910)',
          border: '2px solid #16a34a30',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {phase === 'send'
            ? <PhoneAndroid sx={{ fontSize: 30, color: '#16a34a' }} />
            : <Lock sx={{ fontSize: 30, color: '#16a34a' }} />}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>
          {phase === 'send' ? 'Owner Verification' : 'Enter Owner OTP'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, margin: '0 auto' }}>
          {phase === 'send'
            ? 'Send a 6-digit OTP to the vehicle owner\'s registered phone number. The owner gives this code to you.'
            : 'The OTP has been sent to the vehicle owner. Ask the owner for the code and enter it below.'}
        </Typography>
      </Box>

      {/* Send phase */}
      {phase === 'send' && (
        <Box sx={{ textAlign: 'center' }}>
          <Paper elevation={0} sx={{ border: '1.5px solid #dcfce7', borderRadius: 3, p: 3, mb: 3, background: '#f0fdf4', maxWidth: 400, margin: '0 auto 24px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneAndroid sx={{ color: '#16a34a', fontSize: 24 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">Owner's registered number</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  ••••••••XX (from Step 1)
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Button
            variant="contained"
            size="large"
            startIcon={sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Send />}
            onClick={handleSend}
            disabled={sending}
            sx={{
              px: 5, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)' },
            }}
          >
            {sending ? 'Sending…' : 'Send OTP to Owner'}
          </Button>
        </Box>
      )}

      {/* Verify phase */}
      {phase === 'verify' && (
        <Box sx={{ maxWidth: 480, margin: '0 auto' }}>
          <Paper elevation={0} sx={{ border: '1.5px solid #e0e7ff', borderRadius: 3, p: 3, mb: 3 }}>
            <MuiOtpInput
              value={otp}
              onChange={setOtp}
              length={OTP_LENGTH}
              sx={{
                '& .MuiOtpInput-TextField .MuiOutlinedInput-root': {
                  borderRadius: 2, fontSize: '1.4rem', fontWeight: 700, background: '#fff',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16a34a', borderWidth: 2 },
                },
              }}
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerify}
                disabled={verifying || otp.length !== OTP_LENGTH}
                sx={{
                  py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)' },
                  '&.Mui-disabled': { opacity: 0.5 },
                }}
              >
                {verifying
                  ? <><CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} /> Verifying…</>
                  : <><CheckCircle sx={{ fontSize: 18, mr: 1 }} /> Verify & Complete Tagging</>}
              </Button>
            </Box>

            {/* Timer / resend */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              {timer > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Resend in{' '}
                  <Typography component="span" sx={{ fontWeight: 700, color: '#16a34a' }}>{fmtTime(timer)}</Typography>
                </Typography>
              ) : (
                <Button
                  size="small"
                  startIcon={resending ? <CircularProgress size={14} /> : <Refresh sx={{ fontSize: 16 }} />}
                  onClick={handleResend}
                  disabled={resending}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#16a34a' }}
                >
                  Resend OTP
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
