/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Grid, Typography, Paper, Tab, Tabs, Divider, Chip, Button,
} from '@mui/material';
import {
  Step, StepLabel, Stepper, StepConnector,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  DirectionsCar, SimCard, LockOutlined, SatelliteAlt, EmojiEvents, List,
  ArrowBack,
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import Step1CreateEntry from './NewTagging/Step1CreateEntry';
import Step2ESim from './NewTagging/Step2ESim';
import Step3DealerOtp from './NewTagging/Step3DealerOtp';
import Step4GpsHealth from './NewTagging/Step4GpsHealth';
import Step5OwnerOtp from './NewTagging/Step5OwnerOtp';
import MyTaggingEntries from './NewTagging/MyTaggingEntries';

// ─── step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Vehicle & Vahan',    icon: DirectionsCar,  color: '#7c3aed' },
  { label: 'eSIM / M2M Check',   icon: SimCard,        color: '#0891b2' },
  { label: 'Dealer OTP',         icon: LockOutlined,   color: '#d97706' },
  { label: 'GPS Packets',        icon: SatelliteAlt,   color: '#059669' },
  { label: 'Owner OTP',          icon: EmojiEvents,    color: '#dc2626' },
];

// ─── custom step icon ─────────────────────────────────────────────────────────
const StepIconRoot = styled('div')(({ ownerState }) => ({
  width: 44, height: 44, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.completed && {
    background: 'linear-gradient(135deg, #16a34a, #059669)',
    boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
  }),
  ...(ownerState.active && {
    background: `linear-gradient(135deg, ${ownerState.color}, ${ownerState.color}cc)`,
    boxShadow: `0 4px 16px ${ownerState.color}60`,
  }),
  ...(!ownerState.active && !ownerState.completed && {
    background: '#f1f5f9',
    border: '2px solid #e2e8f0',
  }),
}));

function StepIcon({ active, completed, icon, stepDef }) {
  const { icon: Icon, color } = stepDef;
  return (
    <StepIconRoot ownerState={{ active, completed, color }}>
      <Icon sx={{
        fontSize: 20,
        color: active || completed ? '#fff' : '#94a3b8',
      }} />
    </StepIconRoot>
  );
}

// ─── custom connector ──────────────────────────────────────────────────────────
const FlowConnector = styled(StepConnector)(() => ({
  '& .MuiStepConnector-line': {
    borderColor: '#e2e8f0',
    borderTopWidth: 2,
    borderRadius: 1,
  },
  '&.Mui-active .MuiStepConnector-line, &.Mui-completed .MuiStepConnector-line': {
    borderColor: '#16a34a',
  },
}));

// ─── main container ───────────────────────────────────────────────────────────
export default function TagDeviceToVehicle() {
  const [tab, setTab] = useState(0);           // 0 = New/Resume flow, 1 = My Entries
  const [activeStep, setActiveStep] = useState(0);

  // Persistent session data (accumulates across steps)
  const [session, setSession] = useState({
    id: null,           // DeviceStockMaster id
    vahan: null,        // Vahan data from Step 1
    dateOfRegistration: null,
  });

  // Alert (snackbar)
  const [alert, setAlert] = useState({ open: false, type: 'info', message: '' });
  const handleAlertClose = () => setAlert((p) => ({ ...p, open: false }));

  // ── resume from entries list ─────────────────────────────────────────────
  const handleResume = useCallback((entry) => {
    let resumeStep = 0;
    for (let s = 1; s <= 5; s++) {
      if (!entry[`step${s}_completed_at`]) { resumeStep = s - 1; break; }
      if (s === 5) resumeStep = 5; // all done
    }
    setSession({
      id: entry.id,
      vahan: null, // not needed for resume
      dateOfRegistration: entry.date_of_registration || null,
    });
    setActiveStep(resumeStep);
    setTab(0);   // switch to form tab
    setAlert({ open: true, type: 'info', message: `Resuming entry #${entry.id} from Step ${resumeStep + 1}.` });
  }, []);

  // ── step success handlers ─────────────────────────────────────────────────
  const onStep1Success = useCallback(({ id, vahan }) => {
    setSession((p) => ({ ...p, id, vahan, dateOfRegistration: vahan?.dateOfRegistration || null }));
    setActiveStep(1);
  }, []);

  const advanceStep = useCallback(() => setActiveStep((p) => p + 1), []);

  // ── reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession({ id: null, vahan: null, dateOfRegistration: null });
    setActiveStep(0);
  };

  // ── step content ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <Step1CreateEntry onSuccess={onStep1Success} setAlert={setAlert} />;
      case 1:
        return (
          <Step2ESim
            entryId={session.id}
            vahanDateOfRegistration={session.dateOfRegistration}
            onSuccess={advanceStep}
            setAlert={setAlert}
          />
        );
      case 2:
        return <Step3DealerOtp entryId={session.id} onSuccess={advanceStep} setAlert={setAlert} />;
      case 3:
        return <Step4GpsHealth entryId={session.id} onSuccess={advanceStep} setAlert={setAlert} />;
      case 4:
        return <Step5OwnerOtp entryId={session.id} onSuccess={handleReset} setAlert={setAlert} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1400 }}
      >
        <Alert onClose={handleAlertClose} severity={alert.type} variant="filled" sx={{ width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ borderBottom: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.9rem', minHeight: 48 },
                '& .Mui-selected': { color: '#7c3aed' },
                '& .MuiTabs-indicator': { background: '#7c3aed', height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab label="Tag Device" />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <List sx={{ fontSize: 16 }} />
                    My Entries
                  </Box>
                }
              />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {tab === 0 && activeStep < 4 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (!session.id) setSession(p => ({ ...p, id: 'DEV_SKIP' }));
                    setActiveStep(p => p + 1);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#f59e0b', borderColor: '#fcd34d' }}
                >
                  Skip Step (Dev)
                </Button>
              )}
              {tab === 0 && session.id && (
                <Button
                  size="small"
                  startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                  onClick={handleReset}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
                >
                  Start New
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {tab === 0 && (
          <>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  border: '1.5px solid #f1f5f9',
                  borderRadius: 3,
                  p: { xs: 2, md: 3 },
                  background: 'linear-gradient(135deg, #fafbff 0%, #fff 100%)',
                  overflowX: 'auto',
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  connector={<FlowConnector />}
                >
                  {STEPS.map((step, index) => (
                    <Step key={step.label} completed={index < activeStep}>
                      <StepLabel
                        StepIconComponent={(props) => (
                          <StepIcon {...props} stepDef={step} />
                        )}
                        sx={{
                          '& .MuiStepLabel-label': {
                            mt: 0.8, fontWeight: 600, fontSize: '0.78rem',
                            color: index === activeStep ? step.color : index < activeStep ? '#16a34a' : '#94a3b8',
                          },
                        }}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                  {STEPS.map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        height: 4, borderRadius: 2,
                        width: i === activeStep ? 24 : 8,
                        background: i < activeStep ? '#16a34a' : i === activeStep ? STEPS[i].color : '#e2e8f0',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {session.id && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Entry #${session.id}`}
                    size="small"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Progress is auto-saved — you can resume this entry later.
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <MainCard>
                <Box sx={{ minHeight: 340 }}>
                  {renderStep()}
                </Box>
              </MainCard>
            </Grid>
          </>
        )}

        {tab === 1 && (
          <Grid item xs={12}>
            <MainCard title="My Tagging Entries">
              <MyTaggingEntries onResume={handleResume} />
            </MainCard>
          </Grid>
        )}
      </Grid>
    </>
  );
}
