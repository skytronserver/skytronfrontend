import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Button,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MainCard from '../../ui-component/cards/MainCard';
import StockServices from '../../services/StockServices';

const PAGE_SIZE = 50;

const COLUMNS = [
  { key: 'imei',             label: 'IMEI' },
  { key: 'device_esn',       label: 'Device ESN' },
  { key: 'iccid',            label: 'ICCID 1' },
  { key: 'iccid2',           label: 'ICCID 2' },
  { key: 'msisdn1',          label: 'MSISDN 1' },
  { key: 'msisdn2',          label: 'MSISDN 2' },
  { key: 'imsi1',            label: 'IMSI 1' },
  { key: 'imsi2',            label: 'IMSI 2' },
  { key: 'telecom_provider1', label: 'Telecom 1' },
  { key: 'telecom_provider2', label: 'Telecom 2' },
  { key: 'stock_status',     label: 'Stock Status', chip: true },
  { key: 'upload_batch',     label: 'Batch ID' },
  { key: 'model',            label: 'Model',        nested: 'model_name' },
  { key: 'dealer',           label: 'Dealer RFC(Retro Fitment Center)',       nested: 'company_name', fallback: 'Unassigned' },
  { key: 'created_by',       label: 'Created By',   nested: 'name' },
  { key: 'created',          label: 'Created',      date: true },
];

const EMPTY_FILTERS = {
  imei: '',
  iccid: '',
  iccid2: '',
  msisdn1: '',
};

const statusColor = (status) => {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s.includes('deleted'))  return 'error';
  if (s.includes('assigned') || s.includes('active')) return 'success';
  if (s.includes('defective')) return 'error';
  return 'warning';
};

const fmtDate = (v) => {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const cellValue = (row, col) => {
  const raw = row[col.key];
  if (col.nested) return raw?.[col.nested] ?? col.fallback ?? '-';
  if (col.date)   return fmtDate(raw);
  if (col.chip)   return raw ?? '-';
  return raw ?? '-';
};

const UntaggedDeviceStock = () => {
  // filter state
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [activeFilters, setActive]    = useState(EMPTY_FILTERS);

  // table data
  const [rows, setRows]               = useState([]);
  const [pagination, setPagination]   = useState({ current_page: 1, total_pages: 1, total_count: 0 });
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [fetchError, setFetchError]   = useState('');

  // selection
  const [selected, setSelected]       = useState(new Set());

  // delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // snackbar
  const [snack, setSnack]             = useState({ open: false, severity: 'success', msg: '' });

  const fetchData = useCallback(async (appliedFilters, pageNum) => {
    setLoading(true);
    setFetchError('');
    setSelected(new Set());

    const payload = { page: pageNum, page_size: PAGE_SIZE };
    Object.entries(appliedFilters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) payload[k] = v;
    });

    try {
      const res = await StockServices.getUntaggedStockFilter(payload);
      setRows(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? { current_page: 1, total_pages: 1, total_count: 0 });
    } catch (err) {
      console.error('UntaggedDeviceStock fetch error:', err);
      setFetchError('Failed to load records. Please try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeFilters, page);
  }, [fetchData, activeFilters, page]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSearch = () => {
    setPage(1);
    setActive({ ...filters });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setActive(EMPTY_FILTERS);
  };

  // selection helpers
  const allIds       = rows.map((r) => r.id);
  const allSelected  = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = allIds.some((id) => selected.has(id)) && !allSelected;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // delete
  const handleDeleteClick  = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res  = await StockServices.softDeleteStock([...selected]);
      const data = res.data;

      let msg = data.message || `${(data.deleted_ids || []).length} record(s) deleted.`;
      if (data.blocked?.length) {
        msg += ` Blocked — ${data.blocked.map((b) => `#${b.id}: ${b.error}`).join('; ')}.`;
      }
      if (data.not_found?.length) {
        msg += ` Not found: IDs ${data.not_found.join(', ')}.`;
      }

      const severity = data.deleted_ids?.length > 0 ? 'success' : 'warning';
      setSnack({ open: true, severity, msg });
      setConfirmOpen(false);
      fetchData(activeFilters, page);
    } catch (err) {
      console.error('Soft delete error:', err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Delete failed. Please try again.';
      setSnack({ open: true, severity: 'error', msg: errMsg });
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainCard title="Unused Device Stock">
      {/* ── Filter row ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { name: 'imei',    label: 'IMEI' },
          { name: 'iccid',   label: 'ICCID' },
          { name: 'iccid2',  label: 'ICCID2' },
          { name: 'msisdn1', label: 'MSISDN' },
        ].map(({ name, label }) => (
          <Grid item xs={12} sm={6} md={3} key={name}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label={label}
              name={name}
              value={filters[name]}
              onChange={handleFilterChange}
              onKeyDown={handleKeyDown}
              inputProps={{ id: `untagged-filter-${name}` }}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              id="untagged-stock-search-btn"
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>

            <Button
              id="untagged-stock-clear-btn"
              variant="outlined"
              color="inherit"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={loading}
            >
              Clear Filters
            </Button>

            <Tooltip title={selected.size === 0 ? 'Select rows to delete' : ''} arrow>
              <span>
                <Button
                  id="untagged-stock-delete-btn"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  disabled={selected.size === 0 || deleting}
                  onClick={handleDeleteClick}
                >
                  Delete Selected ({selected.size})
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: 'grey.100', fontWeight: 700 } }}>
              <TableCell padding="checkbox">
                <Checkbox
                  id="untagged-select-all"
                  indeterminate={someSelected}
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={loading || rows.length === 0}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={`${col.key}-${col.label}`} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length + 2} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length + 2} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No rows
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isChecked = selected.has(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={isChecked}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => toggleRow(row.id)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id={`untagged-row-${row.id}`}
                        checked={isChecked}
                        onChange={() => toggleRow(row.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{row.id}</TableCell>
                    {COLUMNS.map((col) => {
                      const val = cellValue(row, col);
                      return (
                        <TableCell
                          key={`${row.id}-${col.key}-${col.label}`}
                          sx={{ whiteSpace: 'nowrap', fontSize: 13 }}
                        >
                          {col.chip ? (
                            <Chip
                              label={String(val).replace(/_/g, ' ')}
                              color={statusColor(val)}
                              size="small"
                            />
                          ) : (
                            String(val)
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {pagination.total_count ?? 0} record{pagination.total_count !== 1 ? 's' : ''} total
        </Typography>
        {(pagination.total_pages ?? 1) > 1 && (
          <Pagination
            count={pagination.total_pages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        )}
      </Box>

      {/* ── Confirm delete dialog ───────────────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="untagged-delete-dialog-title"
      >
        <DialogTitle id="untagged-delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{selected.size}</strong> selected record{selected.size !== 1 ? 's' : ''}? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="untagged-delete-cancel-btn" onClick={handleConfirmClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            id="untagged-delete-confirm-btn"
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Result snackbar ─────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={8000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%', maxWidth: 640 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default UntaggedDeviceStock;

