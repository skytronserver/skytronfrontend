import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DescriptionIcon from '@mui/icons-material/Description';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import TestAgencyServices from '../../services/TestAgencyServices';
import { openFile } from '../../helper';

/* ─── helpers ─── */
const extractError = (err) => {
    const d = err?.response?.data;
    if (typeof d === 'string') return d;
    if (d?.error) return d.error;
    if (d?.message) return d.message;
    if (d?.detail) return d.detail;
    if (d && typeof d === 'object') {
        const first = Object.values(d)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === 'string') return first;
    }
    return err?.message || 'An unexpected error occurred.';
};

const formatDate = (val) => {
    if (!val) return '—';
    try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return val; }
};


/* ─── status chip ─── */
const STATUS_COLORS = {
    'accept': 'success',
    'reject': 'error',
    'allow to login': 'info',
    'allow to add dealer': 'secondary',
    'created': 'default',
};
const StatusChip = ({ status }) => {
    const key = String(status ?? '').trim().toLowerCase();
    const color = STATUS_COLORS[key] ?? 'default';
    return <Chip label={status || '—'} color={color} size="small" sx={{ fontWeight: 600, minWidth: 90 }} />;
};

/* ─── PDF upload mini card ─── */
const PdfUploadCard = ({ label, file, onChange, error }) => (
    <Paper
        variant="outlined"
        component="label"
        sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
            cursor: 'pointer', borderRadius: 2, borderStyle: 'dashed',
            borderColor: error ? 'error.main' : file ? 'primary.main' : 'divider',
            bgcolor: file ? 'primary.50' : 'background.paper',
            transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
        }}
    >
        <input type="file" hidden accept="application/pdf,.png,.jpg,.jpeg" onChange={onChange} />
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: file ? 'primary.main' : 'grey.100', color: file ? 'white' : 'text.secondary', flexShrink: 0 }}>
            {file ? <CheckCircleIcon fontSize="small" /> : <UploadFileIcon fontSize="small" />}
        </Box>
        <Box flex={1} minWidth={0}>
            <Typography variant="caption" fontWeight={600} noWrap display="block">{label}</Typography>
            <Typography variant="caption" color={file ? 'primary.main' : error ? 'error' : 'text.secondary'} noWrap display="block">
                {file ? file.name : error ? error : 'Click to upload'}
            </Typography>
        </Box>
    </Paper>
);

const STATUS_OPTIONS = ['Accept', 'Allow to login', 'Allow to add dealer', 'Reject'];

/* ═══════════════════════════════════════════
   EDIT DIALOG
═══════════════════════════════════════════ */
const EditDialog = ({ open, row, onClose, onSuccess }) => {
    const [form, setForm] = useState({});
    const [authLetterFile, setAuthLetterFile] = useState(null);
    const [idProofFile, setIdProofFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (open && row) {
            const user = row.users?.[0] ?? {};
            setForm({
                agency_name: row.agency_name ?? '',
                company_address: row.company_address ?? '',
                company_pin: row.company_pin ?? '',
                idProofno: row.idProofno ?? '',
                status: row.status ?? 'Accept',
                name: user.name ?? '',
                email: user.email ?? '',
                mobile: user.mobile ?? '',
                dob: user.dob ?? '',
            });
            setAuthLetterFile(null);
            setIdProofFile(null);
            setApiError('');
        }
    }, [open, row]);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        setApiError('');
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('testagency_id', row.id);
            Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
            if (authLetterFile) fd.append('file_authLetter', authLetterFile);
            if (idProofFile) fd.append('file_idProof', idProofFile);
            const res = await TestAgencyServices.updateTestAgency(fd);
            onSuccess(res?.data);
        } catch (err) {
            setApiError(extractError(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <EditIcon color="primary" />
                    <Typography variant="h5" fontWeight={700}>Edit Test Agency</Typography>
                </Stack>
                {row && <Typography variant="caption" color="text.secondary">ID: {row.id} — {row.agency_name}</Typography>}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Agency Info */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="primary" mb={1.5}>Agency Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" label="Agency Name" name="agency_name"
                                    value={form.agency_name ?? ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select name="status" value={form.status ?? 'Accept'} label="Status" onChange={handleChange}>
                                        {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <TextField fullWidth size="small" label="Company Address" name="company_address"
                                    value={form.company_address ?? ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth size="small" label="PIN / Postal Code" name="company_pin"
                                    value={form.company_pin ?? ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" label="ID Proof Number" name="idProofno"
                                    value={form.idProofno ?? ''} onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><AssignmentIndIcon fontSize="small" /></InputAdornment> }} />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* Contact Person */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="primary" mb={1.5}>Contact Person</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" label="Full Name" name="name"
                                    value={form.name ?? ''} onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" label="Email" name="email" type="email"
                                    value={form.email ?? ''} onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" label="Mobile" name="mobile"
                                    value={form.mobile ?? ''} onChange={handleChange}
                                    inputProps={{ maxLength: 15 }}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" label="Date of Birth" name="dob" type="date"
                                    value={form.dob ?? ''} onChange={handleChange}
                                    InputLabelProps={{ shrink: true }} />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* Documents */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="primary" mb={1.5}>Replace Documents (optional)</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <PdfUploadCard label="Authorisation Letter" file={authLetterFile}
                                    onChange={(e) => setAuthLetterFile(e.target.files?.[0] || null)} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <PdfUploadCard label="ID Proof" file={idProofFile}
                                    onChange={(e) => setIdProofFile(e.target.files?.[0] || null)} />
                            </Grid>
                        </Grid>
                    </Box>

                    {apiError && <Alert severity="error">{apiError}</Alert>}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={submitting} variant="outlined">Cancel</Button>
                <Button
                    onClick={handleSubmit} disabled={submitting} variant="contained"
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                >
                    {submitting ? 'Saving…' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════
   COLLAPSIBLE ROW
═══════════════════════════════════════════ */
const AgencyRow = ({ row, onEdit, onUpdated }) => {
    const [open, setOpen] = useState(false);
    const user = row.users?.[0] ?? {};

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }} onClick={() => setOpen((p) => !p)}>
                {/* expand */}
                <TableCell sx={{ width: 40, py: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                {/* ID */}
                <TableCell sx={{ py: 1 }}><Typography variant="body2" fontWeight={600}>#{row.id}</Typography></TableCell>

                {/* Agency Name */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={600}>{row.agency_name || '—'}</Typography>
                    </Stack>
                </TableCell>

                {/* Contact */}
                <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2">{user.name || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email || ''}</Typography>
                </TableCell>

                {/* Created */}
                <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2">{formatDate(row.created)}</Typography>
                    <Typography variant="caption" color="text.secondary">Exp: {formatDate(row.expirydate)}</Typography>
                </TableCell>

                {/* Status */}
                <TableCell sx={{ py: 1 }}><StatusChip status={row.status} /></TableCell>

                {/* Actions */}
                <TableCell sx={{ py: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>

            {/* Expanded detail */}
            <TableRow>
                <TableCell colSpan={7} sx={{ py: 0, bgcolor: 'primary.50' }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2 }}>
                            <Grid container spacing={2}>

                                {/* Agency Details */}
                                <Grid item xs={12} md={4}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                            <BusinessIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>Agency Details</Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                                            {[
                                                ['Agency ID', row.id],
                                                ['Address', row.company_address],
                                                ['PIN', row.company_pin],
                                                ['ID Proof No.', row.idProofno],
                                                ['Created', formatDate(row.created)],
                                                ['Expiry', formatDate(row.expirydate)],
                                            ].map(([lbl, val]) => val ? (
                                                <React.Fragment key={lbl}>
                                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                </React.Fragment>
                                            ) : null)}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Contact Person */}
                                <Grid item xs={12} md={4}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                            <PersonIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>Contact Person</Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                                            {[
                                                ['Name', user.name],
                                                ['Email', user.email],
                                                ['Mobile', user.mobile],
                                                ['Role', user.role],
                                            ].map(([lbl, val]) => val ? (
                                                <React.Fragment key={lbl}>
                                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                </React.Fragment>
                                            ) : null)}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Documents */}
                                {(row.file_authLetter || row.file_idProof) && (
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DescriptionIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Documents</Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Stack spacing={1}>
                                                {[
                                                    ['Auth Letter', row.file_authLetter],
                                                    ['ID Proof', row.file_idProof],
                                                ].map(([lbl, path]) => path ? (
                                                    <Stack key={lbl} direction="row" alignItems="center" justifyContent="space-between">
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <DescriptionIcon fontSize="small" color="action" />
                                                            <Typography variant="caption">{lbl}</Typography>
                                                        </Stack>
                                                        <Chip
                                                            label="View"
                                                            size="small" color="primary" variant="outlined" clickable
                                                            onClick={(e) => openFile(e, path)}
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    </Stack>
                                                ) : null)}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

/* ─── stat card ─── */
const StatCard = ({ label, value, color }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderLeft: 4, borderLeftColor: `${color}.main`, flex: '1 1 120px', minWidth: 100 }}>
        <Typography variant="h4" fontWeight={700} color={`${color}.main`}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
);

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const TestAgencyList = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editRow, setEditRow] = useState(null);

    /* ── load list ── */
    const loadList = useCallback(async () => {
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await TestAgencyServices.listTestAgency();
            const data = Array.isArray(res?.data) ? res.data : [];
            data.sort((a, b) => new Date(b.created) - new Date(a.created));
            setRows(data);
        } catch (err) {
            setErrorMsg(extractError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadList(); }, [loadList]);

    /* ── stats ── */
    const stats = useMemo(() => {
        const total = rows.length;
        const accepted = rows.filter((r) => String(r.status).toLowerCase() === 'accept').length;
        const rejected = rows.filter((r) => String(r.status).toLowerCase() === 'reject').length;
        return { total, accepted, rejected };
    }, [rows]);

    /* ── filter ── */
    const filtered = useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.trim().toLowerCase();
        return rows.filter((r) =>
            String(r.agency_name ?? '').toLowerCase().includes(q) ||
            String(r.status ?? '').toLowerCase().includes(q) ||
            String(r.users?.[0]?.name ?? '').toLowerCase().includes(q) ||
            String(r.users?.[0]?.email ?? '').toLowerCase().includes(q) ||
            String(r.id ?? '').includes(q)
        );
    }, [rows, search]);

    const paginated = useMemo(() => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filtered, page, rowsPerPage]);

    /* ── edit callback ── */
    const handleUpdateSuccess = useCallback((updated) => {
        if (updated?.id) {
            setRows((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r));
        }
        setEditRow(null);
        setSuccessMsg('Test agency updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <EditDialog
                open={!!editRow}
                row={editRow}
                onClose={() => setEditRow(null)}
                onSuccess={handleUpdateSuccess}
            />

            <Grid item xs={12}>
                <MainCard
                    title={
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <BusinessIcon color="primary" />
                            <Typography variant="h4" fontWeight={700}>Test Agency List</Typography>
                        </Stack>
                    }
                >
                    {/* ── Stats ── */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} flexWrap="wrap">
                        <StatCard label="Total" value={stats.total} color="primary" />
                        <StatCard label="Accepted" value={stats.accepted} color="success" />
                        <StatCard label="Rejected" value={stats.rejected} color="error" />
                    </Stack>

                    {/* ── Toolbar ── */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center" justifyContent="space-between">
                        <TextField
                            size="small"
                            placeholder="Search agency, name, email, status…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            sx={{ minWidth: 280 }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                            onClick={loadList}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Stack>

                    {/* ── Alerts ── */}
                    {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
                    {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

                    {/* ── Table ── */}
                    {loading && rows.length === 0 ? (
                        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
                    ) : filtered.length === 0 ? (
                        <Alert severity="info">No test agencies found.</Alert>
                    ) : (
                        <>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: 'white', width: 40 }} />
                                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>ID</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Agency Name</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contact Person</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Dates</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginated.map((row) => (
                                            <AgencyRow
                                                key={row.id}
                                                row={row}
                                                onEdit={(r) => setEditRow(r)}
                                                onUpdated={handleUpdateSuccess}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filtered.length}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                onPageChange={(_, p) => setPage(p)}
                                onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                            />
                        </>
                    )}
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default TestAgencyList;
