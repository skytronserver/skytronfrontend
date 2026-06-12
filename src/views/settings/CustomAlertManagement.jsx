import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Tooltip, Typography, IconButton, Box, Divider,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import MainCard from '../../ui-component/cards/MainCard';
import DialogComponent from '../../ui-component/DialogComponent';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { gridSpacing } from '../../store/constant';
import CustomAlertService from '../../services/customAlertService';

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_SUBRULE = {
  parameter: '', operator: '', value: '', value_start: '', value_end: '',
};

const EMPTY_FORM = {
  name: '', description: '', subrule_logic: 'AND', time_from: '', time_to: '',
  subrules: [{ ...EMPTY_SUBRULE }],
};

// ── Helper Components ─────────────────────────────────────────────────────────

const StatusChip = ({ value }) => {
  const cfg = value === 'active'
    ? { label: 'Active', color: '#2e7d32', bg: '#e8f5e9' }
    : { label: 'Inactive', color: '#c62828', bg: '#ffebee' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 10,
      fontWeight: 700, fontSize: 12, color: cfg.color, background: cfg.bg,
      border: `1.5px solid ${cfg.color}33`,
    }}>
      {cfg.label}
    </span>
  );
};

const describeSubrule = (sr) => {
  if (sr.operator === 'in_range') return `${sr.parameter} in range ${sr.value_start}–${sr.value_end}`;
  return `${sr.parameter} ${sr.operator} ${sr.value}`;
};

// ── Main Component ─────────────────────────────────────────────────────────────

const CustomAlertManagement = () => {
  const [parameters, setParameters] = useState([]);
  const [maxSubrules, setMaxSubrules] = useState(4);
  const [rules, setRules] = useState([]);
  const [listLoaded, setListLoaded] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [busyId, setBusyId] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertState, setAlertState] = useState({ error: false, message: '', errorList: [] });

  const showAlert = (message, error = false, errorList = []) => {
    setAlertState({ error, message, errorList });
    setAlertOpen(true);
  };

  // ── Data Loading ─────────────────────────────────────────────────────────────

  const loadParameters = useCallback(async () => {
    const res = await CustomAlertService.getParameters();
    if (res.success) {
      setParameters(res.data.parameters || []);
      setMaxSubrules(res.data.max_subrules || 4);
    }
  }, []);

  const loadRules = useCallback(async () => {
    setListLoaded(false);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterSearch) params.search = filterSearch;
    const res = await CustomAlertService.getRules(params);
    if (res.success) {
      setRules(res.data.data || []);
    }
    setListLoaded(true);
  }, [filterStatus, filterSearch]);

  useEffect(() => { loadParameters(); }, [loadParameters]);
  useEffect(() => { loadRules(); }, [loadRules]);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getOperators = (paramCode) => {
    const p = parameters.find((param) => param.code === paramCode);
    return p ? p.operators : [];
  };

  const formatTime = (t) => {
    if (!t) return null;
    return t.length === 5 ? `${t}:00` : t;
  };

  // ── Dialog Handlers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditRule(null);
    setForm({ ...EMPTY_FORM, subrules: [{ ...EMPTY_SUBRULE }] });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (rule) => {
    setEditRule(rule);
    setForm({
      name: rule.name || '',
      description: rule.description || '',
      subrule_logic: rule.subrule_logic || 'AND',
      time_from: rule.time_from ? rule.time_from.substring(0, 5) : '',
      time_to: rule.time_to ? rule.time_to.substring(0, 5) : '',
      subrules: (rule.subrules || []).map((sr) => ({
        parameter: sr.parameter || '',
        operator: sr.operator || '',
        value: sr.value || '',
        value_start: sr.value_start || '',
        value_end: sr.value_end || '',
      })),
    });
    setErrors({});
    setDialogOpen(true);
  };

  // ── Subrule Mutations ─────────────────────────────────────────────────────────

  const setSubruleField = (idx, field, value) => {
    setForm((f) => {
      const subrules = f.subrules.map((sr, i) => {
        if (i !== idx) return sr;
        const updated = { ...sr, [field]: value };
        if (field === 'parameter') {
          updated.operator = '';
          updated.value = '';
          updated.value_start = '';
          updated.value_end = '';
        }
        if (field === 'operator') {
          updated.value = '';
          updated.value_start = '';
          updated.value_end = '';
        }
        return updated;
      });
      return { ...f, subrules };
    });
  };

  const addSubrule = () => {
    if (form.subrules.length >= maxSubrules) return;
    setForm((f) => ({ ...f, subrules: [...f.subrules, { ...EMPTY_SUBRULE }] }));
  };

  const removeSubrule = (idx) => {
    if (form.subrules.length <= 1) return;
    setForm((f) => ({ ...f, subrules: f.subrules.filter((_, i) => i !== idx) }));
  };

  // ── Validation ────────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Rule name is required';
    form.subrules.forEach((sr, i) => {
      if (!sr.parameter) e[`sr_${i}_param`] = 'Required';
      if (!sr.operator) e[`sr_${i}_op`] = 'Required';
      if (sr.operator === 'in_range') {
        if (!sr.value_start) e[`sr_${i}_vs`] = 'Required';
        if (!sr.value_end) e[`sr_${i}_ve`] = 'Required';
      } else if (sr.operator && !sr.value) {
        e[`sr_${i}_val`] = 'Required';
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      subrule_logic: form.subrule_logic,
      ...(form.time_from ? { time_from: formatTime(form.time_from) } : {}),
      ...(form.time_to ? { time_to: formatTime(form.time_to) } : {}),
      subrules: form.subrules.map((sr, idx) => ({
        order: idx + 1,
        parameter: sr.parameter,
        operator: sr.operator,
        value: sr.operator !== 'in_range' ? sr.value : '',
        value_start: sr.operator === 'in_range' ? sr.value_start : '',
        value_end: sr.operator === 'in_range' ? sr.value_end : '',
      })),
    };
    if (!editRule) payload.status = 'active';

    const res = editRule
      ? await CustomAlertService.updateRule(editRule.id, payload)
      : await CustomAlertService.createRule(payload);

    setSubmitting(false);
    if (res.success) {
      showAlert(editRule ? 'Alert rule updated successfully.' : 'Alert rule created successfully.');
      setDialogOpen(false);
      loadRules();
    } else {
      const errList = res.errors
        ? Object.entries(res.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        : [];
      showAlert(res.message || 'Failed to save rule.', true, errList);
    }
  };

  // ── Status Toggle ─────────────────────────────────────────────────────────────

  const handleToggleStatus = async (rule) => {
    setBusyId(rule.id);
    const res = rule.status === 'active'
      ? await CustomAlertService.deactivateRule(rule.id)
      : await CustomAlertService.updateRule(rule.id, { status: 'active' });
    setBusyId(null);
    if (res.success) {
      showAlert(`Rule ${rule.status === 'active' ? 'deactivated' : 'activated'} successfully.`);
      loadRules();
    } else {
      showAlert(res.message || 'Failed to update status.', true);
    }
  };

  // ── Table Columns ─────────────────────────────────────────────────────────────

  const columns = [
    { name: 'name', label: 'Rule Name', options: { filter: true, sort: true } },
    {
      name: 'status',
      label: 'Status',
      options: {
        filter: true, sort: false,
        customBodyRender: (v) => <StatusChip value={v} />,
      },
    },
    {
      name: 'subrule_logic',
      label: 'Logic',
      options: {
        filter: true, sort: false,
        customBodyRender: (v) => (
          <Chip label={v} size="small" color={v === 'AND' ? 'primary' : 'secondary'} />
        ),
      },
    },
    {
      name: 'subrules',
      label: 'Conditions',
      options: {
        filter: false, sort: false,
        customBodyRender: (v) => {
          if (!v?.length) return '—';
          const tips = v.map((sr, i) => `${i + 1}. ${describeSubrule(sr)}`).join('\n');
          return (
            <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{tips}</span>}>
              <Chip
                label={`${v.length} condition${v.length > 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
                style={{ cursor: 'default' }}
              />
            </Tooltip>
          );
        },
      },
    },
    {
      name: 'log_count',
      label: 'Triggers',
      options: { filter: false, sort: true },
    },
    {
      name: 'state_name',
      label: 'Scope',
      options: {
        filter: true, sort: false,
        customBodyRender: (v) => v || <em style={{ color: '#888', fontStyle: 'italic' }}>Global</em>,
      },
    },
    { name: 'created_by_name', label: 'Created By', options: { filter: false, sort: false } },
    {
      name: 'created_at',
      label: 'Created At',
      options: {
        filter: false, sort: true,
        customBodyRender: (v) => (v ? new Date(v).toLocaleString('en-IN') : '—'),
      },
    },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        filter: false, sort: false, empty: true,
        customBodyRenderLite: (dataIndex) => {
          const rule = rules[dataIndex];
          if (!rule) return null;
          const busy = busyId === rule.id;
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title="Edit rule">
                <IconButton size="small" color="primary" onClick={() => openEdit(rule)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={rule.status === 'active' ? 'Deactivate' : 'Activate'}>
                <span>
                  <IconButton
                    size="small"
                    color={rule.status === 'active' ? 'error' : 'success'}
                    onClick={() => handleToggleStatus(rule)}
                    disabled={busy}
                  >
                    {busy
                      ? <CircularProgress size={16} />
                      : rule.status === 'active'
                        ? <StopIcon fontSize="small" />
                        : <PlayArrowIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <DialogComponent
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alertState.message}
        errorList={alertState.errorList}
      />

      {/* ── Create / Edit Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => { if (!submitting) setDialogOpen(false); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editRule ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {submitting && (
            <Box
              position="absolute" top={0} left={0} width="100%" height="100%"
              zIndex={9999} bgcolor="rgba(255,255,255,0.7)"
              display="flex" alignItems="center" justifyContent="center"
            >
              <CircularProgress />
            </Box>
          )}

          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Rule Name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            {/* Subrule Logic */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Evaluation Logic *</InputLabel>
                <Select
                  label="Evaluation Logic *"
                  value={form.subrule_logic}
                  onChange={(e) => setForm((f) => ({ ...f, subrule_logic: e.target.value }))}
                >
                  <MenuItem value="AND">AND — all conditions must match</MenuItem>
                  <MenuItem value="OR">OR — any condition must match</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" label="Description" multiline rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Grid>

            {/* Rule-level time window */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Active From (optional)"
                type="time" inputProps={{ step: 60 }}
                value={form.time_from}
                onChange={(e) => setForm((f) => ({ ...f, time_from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Rule only evaluates after this time"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Active Until (optional)"
                type="time" inputProps={{ step: 60 }}
                value={form.time_to}
                onChange={(e) => setForm((f) => ({ ...f, time_to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Rule only evaluates before this time"
              />
            </Grid>

            {/* Subrules header */}
            <Grid item xs={12}>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} mb={0.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Conditions{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    (up to {maxSubrules})
                  </Typography>
                </Typography>
                <Button
                  size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={addSubrule}
                  disabled={form.subrules.length >= maxSubrules}
                >
                  Add Condition
                </Button>
              </Box>
            </Grid>

            {/* Subrule rows */}
            {form.subrules.map((sr, idx) => (
              <Grid item xs={12} key={idx}>
                <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary" mb={1} display="block">
                    Condition #{idx + 1}
                  </Typography>
                  <Grid container spacing={1} alignItems="flex-start">
                    {/* Parameter */}
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small" error={!!errors[`sr_${idx}_param`]}>
                        <InputLabel>Parameter *</InputLabel>
                        <Select
                          label="Parameter *"
                          value={sr.parameter}
                          onChange={(e) => setSubruleField(idx, 'parameter', e.target.value)}
                        >
                          {parameters.map((p) => (
                            <MenuItem key={p.code} value={p.code}>{p.label}</MenuItem>
                          ))}
                        </Select>
                        {errors[`sr_${idx}_param`] && (
                          <FormHelperText>{errors[`sr_${idx}_param`]}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Operator */}
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small" error={!!errors[`sr_${idx}_op`]}>
                        <InputLabel>Operator *</InputLabel>
                        <Select
                          label="Operator *"
                          value={sr.operator}
                          onChange={(e) => setSubruleField(idx, 'operator', e.target.value)}
                          disabled={!sr.parameter}
                        >
                          {getOperators(sr.parameter).map((op) => (
                            <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                          ))}
                        </Select>
                        {errors[`sr_${idx}_op`] && (
                          <FormHelperText>{errors[`sr_${idx}_op`]}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Value(s) */}
                    {sr.operator === 'in_range' ? (
                      <>
                        <Grid item xs={5} sm={2.5}>
                          <TextField
                            fullWidth size="small" label="From *"
                            value={sr.value_start}
                            onChange={(e) => setSubruleField(idx, 'value_start', e.target.value)}
                            error={!!errors[`sr_${idx}_vs`]}
                            helperText={errors[`sr_${idx}_vs`]}
                          />
                        </Grid>
                        <Grid item xs={5} sm={2.5}>
                          <TextField
                            fullWidth size="small" label="To *"
                            value={sr.value_end}
                            onChange={(e) => setSubruleField(idx, 'value_end', e.target.value)}
                            error={!!errors[`sr_${idx}_ve`]}
                            helperText={errors[`sr_${idx}_ve`]}
                          />
                        </Grid>
                      </>
                    ) : (
                      <Grid item xs={10} sm={5}>
                        <TextField
                          fullWidth size="small" label="Value *"
                          value={sr.value}
                          onChange={(e) => setSubruleField(idx, 'value', e.target.value)}
                          disabled={!sr.operator}
                          error={!!errors[`sr_${idx}_val`]}
                          helperText={errors[`sr_${idx}_val`]}
                        />
                      </Grid>
                    )}

                    {/* Remove button */}
                    <Grid item xs={2} sm={1} display="flex" justifyContent="center" alignItems="center">
                      <Tooltip title="Remove condition">
                        <span>
                          <IconButton
                            size="small" color="error"
                            onClick={() => removeSubrule(idx)}
                            disabled={form.subrules.length <= 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}

            {/* Status note for new rules */}
            {!editRule && (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  style={{ color: '#1565c0', background: '#e3f2fd', borderRadius: 6, padding: '8px 12px' }}
                >
                  New rules are created with status <strong>Active</strong> and begin evaluating immediately.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: '12px 24px' }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined" color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained" color="primary"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : editRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  fullWidth size="small" label="Search by name"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="outlined" size="small"
                  startIcon={<RefreshIcon />}
                  onClick={loadRules}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* ── Rules Table ──────────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <MainCard
            title="Custom Alert Rules"
            secondary={
              <Button variant="contained" color="primary" onClick={openCreate}>
                + Add New Rule
              </Button>
            }
          >
            {!listLoaded ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : (
              <DynamicDatatables
                tableTitle="Custom Alert Rules"
                rows={rules}
                columns={columns}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default CustomAlertManagement;
