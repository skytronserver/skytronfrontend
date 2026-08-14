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
  FilterList, AccessTime,
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

const StepProgress = ({ entry }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <React.Fragment key={s}>
        <StepBadge done={!!entry[`step${s}_completed_at`]} step={s} />
        {s < 5 && (
          <Box sx={{ width: 12, height: 2, background: entry[`step${s}_completed_at`] && entry[`step${s + 1}_completed_at`] ? '#16a34a' : '#e2e8f0', borderRadius: 1 }} />
        )}
      </React.Fragment>
    ))}
  </Box>
);

// ─── current step label ───────────────────────────────────────────────────────
const currentStepOf = (entry) => {
  for (let s = 5; s >= 1; s--) {
    if (entry[`step${s}_completed_at`]) return s === 5 ? 'Complete' : `Resume from Step ${s + 1}`;
  }
  return 'Resume from Step 1';
};

// ─── filter toggle ────────────────────────────────────────────────────────────
const FILTERS = [
  { value: 'all',    label: 'All' },
  { value: '1',      label: 'Step 1 done' },
  { value: '2',      label: 'Step 2 done' },
  { value: '3',      label: 'Step 3 done' },
  { value: '4',      label: 'Step 4 done' },
  { value: 'done',   label: 'Completed' },
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
      if (filter !== 'all' && filter !== 'done') params.step = Number(filter);
      if (filter === 'done') params.completed = true;
      const res = await NewTaggingService.getMyEntries(params);
      setEntries(res?.data?.results || res?.data || []);
    } catch (e) {
      console.error('Failed to load entries', e);
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
        <TableContainer component={Paper} elevation={0} sx={{ border: '1.5px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: '#f8fafc' }}>
                {['ID', 'IMEI', 'ICCID', 'Owner', 'Created', 'Steps', 'Status', ''].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((entry) => {
                const isComplete = !!entry.step5_completed_at;
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
                    <TableCell sx={{ fontSize: '0.82rem' }}>{entry.owner_name || '—'}</TableCell>
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
                    <TableCell>
                      {!isComplete && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PlayArrow sx={{ fontSize: 16 }} />}
                          onClick={() => onResume(entry)}
                          sx={{
                            textTransform: 'none', fontWeight: 700, fontSize: '0.78rem',
                            borderRadius: 1.5, px: 1.5, py: 0.5,
                            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                            boxShadow: 'none',
                            '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #4c1d95)' },
                          }}
                        >
                          Resume
                        </Button>
                      )}
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
