/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { LockOutlined, Refresh, CheckCircle } from '@mui/icons-material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import NewTaggingService from '../../../services/NewTaggingService';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 180; // seconds

export default function Step3DealerOtp({ entryId, onSuccess, setAlert }) {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const intervalRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    setTimer(RESEND_COOLDOWN);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await NewTaggingService.resendDealerOtp(entryId);
      startTimer();
      setAlert({ open: true, type: 'success', message: 'OTP resent to your registered number.' });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Failed to resend OTP.';
      setAlert({ open: true, type: 'error', message: msg });
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setAlert({ open: true, type: 'warning', message: `Please enter all ${OTP_LENGTH} digits.` });
      return;
    }
    setVerifying(true);
    try {
      await NewTaggingService.verifyDealerOtp(entryId, otp);
      setAlert({ open: true, type: 'success', message: 'Dealer OTP verified successfully.' });
      onSuccess();
    } catch (err) {
      const status = err?.response?.status;
      const msg = (status === 400 || status === 401 || status === 403)
        ? 'Incorrect OTP. Please try again.'
        : (err?.response?.data?.detail || 'OTP verification failed.');
      setAlert({ open: true, type: 'error', message: msg });
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Box sx={{ maxWidth: 480, margin: '0 auto' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #7c3aed20 0%, #5b21b610 100%)',
          border: '2px solid #7c3aed30',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LockOutlined sx={{ fontSize: 30, color: '#7c3aed' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>
          Dealer Verification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A 6-digit OTP has been sent to your registered mobile number.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1.5px solid #e0e7ff', borderRadius: 3, p: 3, mb: 3 }}>
        <MuiOtpInput
          value={otp}
          onChange={setOtp}
          length={OTP_LENGTH}
          sx={{
            '& .MuiOtpInput-TextField': {
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.4rem',
                fontWeight: 700,
                background: '#fff',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed', borderWidth: 2 },
              },
            },
          }}
        />

        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleVerify}
            disabled={verifying || otp.length !== OTP_LENGTH}
            sx={{
              py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' },
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            {verifying
              ? <><CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} /> Verifying…</>
              : <><CheckCircle sx={{ fontSize: 18, mr: 1 }} /> Verify OTP</>}
          </Button>
        </Box>

        {/* Timer / Resend */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          {timer > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Resend OTP in{' '}
              <Typography component="span" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {fmtTime(timer)}
              </Typography>
            </Typography>
          ) : (
            <Button
              size="small"
              startIcon={resending ? <CircularProgress size={14} /> : <Refresh sx={{ fontSize: 16 }} />}
              onClick={handleResend}
              disabled={resending}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#7c3aed' }}
            >
              Resend OTP
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
