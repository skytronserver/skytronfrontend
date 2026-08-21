/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, CircularProgress, Paper, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, ToggleButtonGroup, ToggleButton, TextField,
  InputAdornment,
} from '@mui/material';
import {
  PlayArrow, Refresh, Search, CheckCircle, RadioButtonUnchecked,
  FilterList, AccessTime, ContentCopy,
  Check,
} from '@mui/icons-material';
import NewTaggingService from '../../../services/NewTaggingService';

// ─── step badge ───────────────────────────────────────────────────────────────
const StepBadge = ({ done, step }) => (
  <Tooltip title={`Step ${step}: ${done ? 'Complete' : 'Pending'}`}>
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%',
      background: done ? 'linear-gradient(135deg, #16a34a, #059669)' : '#f1f5f9',
      border: done ? 'none' : '1.5px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {done
        ? <CheckCircle sx={{ fontSize: 16, color: '#fff' }} />
        : <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.65rem' }}>{step}</Typography>}
    </Box>
  </Tooltip>
);

const StepProgress = ({ entry }) => {
  const steps = Array.isArray(entry?.steps) ? entry.steps : [];

  const isStepDone = (stepNumber) => {
    const step = steps.find((item) => item.step === stepNumber);
    return !!step?.completed;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <React.Fragment key={s}>
          <StepBadge
            done={isStepDone(s)}
            step={s}
          />

          {s < 5 && (
            <Box
              sx={{
                width: 12,
                height: 2,
                background:
                  isStepDone(s) && isStepDone(s + 1)
                    ? '#16a34a'
                    : '#e2e8f0',
                borderRadius: 1,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};



// ─── current step label ───────────────────────────────────────────────────────
const currentStepOf = (entry) => {
  if (entry?.is_completed) {
    return 'Complete';
  }

  return entry?.current_step_label
    || `Resume from Step ${entry?.current_step || 1}`;
};

const CopyRowButton = ({ entry }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();

    const rowText = `
IMEI: ${entry.imei || '-'}
ICCID: ${entry.iccid || '-'}
// Vehicle No: ${entry.vehicle_reg_no || '-'}
// Chassis No: ${entry.chassis_no || '-'}
Owner Name: ${entry.vehicle_owner?.name || '-'}
Mobile No: ${entry.vehicle_owner?.mobile || '-'}
Created: ${entry.created_at
        ? new Date(entry.created_at).toLocaleDateString('en-IN')
        : '-'
      }
Status: ${entry.current_step_label || '-'}
Current Step: ${entry.current_step || '-'}
Manufacturer: ${entry.manufacturer?.company_name || '-'}
Model: ${entry.device_model?.model_name || '-'}
eSIM Provider: ${entry.esim_provider?.company_name || '-'}
District: ${entry.district?.district || '-'}
Category: ${entry.category?.category || '-'}
`;

    try {
      await navigator.clipboard.writeText(rowText.trim());

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <Tooltip title={copied ? 'Copied' : 'Copy row details'}>
      <IconButton
        size="small"
        onClick={handleCopy}
        sx={{
          color: copied ? '#16a34a' : '#64748b',
          mr: 0.5,
          '&:hover': {
            background: '#f3f4f6',
            color: copied ? '#16a34a' : '#7c3aed',
          },
        }}
      >
        {copied ? (
          <Check sx={{ fontSize: 18 }} />
        ) : (
          <ContentCopy sx={{ fontSize: 18 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

// ─── filter toggle ────────────────────────────────────────────────────────────
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: '2', label: 'eSIM pending' },
  { value: '3', label: 'Dealer OTP pending' },
  { value: '4', label: 'GPS pending' },
  { value: '5', label: 'Owner OTP pending' },
  { value: 'done', label: 'Completed' },
];

// ─── main ─────────────────────────────────────────────────────────────────────
export default function MyTaggingEntries({ onResume }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};

      // API expects current_step, not step
      if (filter !== 'all' && filter !== 'done') {
        params.current_step = Number(filter);
      }

      // API expects is_completed, not completed
      if (filter === 'done') {
        params.is_completed = true;
      }

      const res = await NewTaggingService.getMyEntries(params);


      const apiEntries = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setEntries(apiEntries);
    } catch (e) {
      console.error('Failed to load entries:', e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // client-side IMEI / ICCID search
  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(e.imei || '').includes(q) ||
      String(e.iccid || '').includes(q) ||
      String(e.id || '').includes(q)
    );
  });

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search IMEI / ICCID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment>,
            sx: { borderRadius: 2 },
          }}
          sx={{ width: 240 }}
        />
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => { if (v !== null) setFilter(v); }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', px: 1.5, py: 0.5, borderRadius: '8px !important', border: '1.5px solid #e2e8f0' },
            '& .Mui-selected': { background: '#7c3aed !important', color: '#fff !important', borderColor: '#7c3aed !important' },
            gap: 0.5,
          }}
        >
          {FILTERS.map((f) => <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>)}
        </ToggleButtonGroup>
        <Tooltip title="Refresh">
          <IconButton onClick={load} size="small" sx={{ ml: 'auto' }}>
            <Refresh sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={40} sx={{ color: '#7c3aed' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading entries…</Typography>
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ border: '1.5px dashed #e2e8f0', borderRadius: 3, p: 6, textAlign: 'center' }}>
          <RadioButtonUnchecked sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600 }}>No entries found</Typography>
          <Typography variant="body2" color="text.secondary">Start a new tagging session using the form on the left.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{
          border: '1.5px solid #e2e8f0', borderRadius: 3, overflowX: 'auto',
          overflowY: 'hidden',
        }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: '#f8fafc' }}>
                {['ID', 'IMEI', 'ICCID', 'Owner', 'Mobile No.', 'Created', 'Steps', 'Status', ''].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((entry) => {
                const isComplete = !!entry.is_completed;
                const label = currentStepOf(entry);
                return (
                  <TableRow
                    key={entry.id}
                    hover
                    sx={{ '&:last-child td': { borderBottom: 0 }, cursor: 'pointer', transition: 'background 0.15s' }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>#{entry.id}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{entry.imei || '—'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>{entry.iccid || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', minWidth: 120 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {entry.vehicle_owner?.name || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', minWidth: 130 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontFamily: 'monospace',
                        }}
                      >
                        {entry.vehicle_owner?.mobile || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 13, color: '#94a3b8' }} />
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-IN') : '—'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StepProgress entry={entry} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isComplete ? 'Complete' : label.replace('Resume from ', '')}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.7rem',
                          background: isComplete ? '#dcfce7' : '#eff6ff',
                          color: isComplete ? '#15803d' : '#1d4ed8',
                          border: `1px solid ${isComplete ? '#86efac' : '#bfdbfe'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        minWidth: 130,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        {/* Copy button - ALWAYS visible */}
                        <CopyRowButton entry={entry} />

                        {/* Resume button - only for incomplete entries */}
                        {!isComplete && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PlayArrow sx={{ fontSize: 16 }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onResume(entry);
                            }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              borderRadius: 1.5,
                              px: 1.5,
                              py: 0.5,
                              background:
                                'linear-gradient(135deg, #7c3aed, #5b21b6)',
                              boxShadow: 'none',
                              whiteSpace: 'nowrap',
                              '&:hover': {
                                background:
                                  'linear-gradient(135deg, #6d28d9, #4c1d95)',
                              },
                            }}
                          >
                            Resume
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
