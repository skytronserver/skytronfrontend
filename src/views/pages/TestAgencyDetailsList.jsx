import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
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
    Snackbar,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import TestAgencyServices from '../../services/TestAgencyServices';
import { formatDateTime } from '../../helper';

const TestAgencyDetailsList = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [editForm, setEditForm] = useState({
        address: '',
        pincode: ''
    });
    const [editErrors, setEditErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Delete confirmation dialog
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteRow, setDeleteRow] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: 'success',
        message: ''
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            severity,
            message
        });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;

        setSnackbar((prev) => ({
            ...prev,
            open: false
        }));
    };
    const loadList = useCallback(async () => {
        setErrorMsg('');
        setLoading(true);
        try {
            const res = await TestAgencyServices.listAgencyDetails();
            const data = Array.isArray(res?.data) ? res.data : [];
            setRows(data);
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to load agency details.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadList();
    }, [loadList]);

    const filteredRows = useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.toLowerCase();
        return rows.filter(r =>
            String(r.name || '').toLowerCase().includes(q) ||
            String(r.address || '').toLowerCase().includes(q) ||
            String(r.pincode || '').toLowerCase().includes(q)
        );
    }, [rows, search]);

    const paginatedRows = useMemo(() =>
        filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredRows, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    // Open edit dialog and populate existing values
    const handleEditClick = (row) => {
        setSelectedRow(row);

        setEditForm({
            address: row.address || '',
            pincode: String(row.pincode ?? '')
        });

        setErrorMsg('');
        setSuccessMsg('');
        setEditOpen(true);
    };

    const handleEditClose = () => {
        if (saving) return;

        setEditOpen(false);
        setSelectedRow(null);
        setEditErrors({});
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Update agency details


    const handleUpdate = async () => {
        if (!selectedRow) return;

        setSaving(true);

        try {
            const payload = {
                detail_id: selectedRow.id,
                address: editForm.address,
                pincode: editForm.pincode
            };

            const res = await TestAgencyServices.updateAgencyDetails(payload);

            // Your API returns the updated record directly.
            if (res?.data?.id) {
                setEditOpen(false);
                setSelectedRow(null);

                showSnackbar(
                    'Agency details updated successfully.',
                    'success'
                );

                // Refresh the list without clearing the notification.
                try {
                    const listRes =
                        await TestAgencyServices.listAgencyDetails();

                    setRows(
                        Array.isArray(listRes?.data) ? listRes.data : []
                    );
                } catch (refreshError) {
                    // Update succeeded, but refreshing the list failed.
                    showSnackbar(
                        'Agency updated successfully, but refreshing the list failed.',
                        'warning'
                    );
                }
            } else {
                showSnackbar(
                    res?.data?.message ||
                    res?.data?.error ||
                    'Unable to update agency details.',
                    'error'
                );
            }
        } catch (err) {
            showSnackbar(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Failed to update agency details.',
                'error'
            );
        } finally {
            setSaving(false);
        }
    };



    // Open delete confirmation dialog
    const handleDeleteClick = (row) => {
        setDeleteRow(row);
        setDeleteOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteOpen(false);
        setDeleteRow(null);
    };

    /*
     * Delete API is not included in the supplied service.
     * Add the real delete endpoint and payload here before
     * enabling server-side deletion.
     */
    const handleDeleteConfirm = () => {
        setErrorMsg(
            'Delete API is not configured. Please provide the delete endpoint and required payload.'
        );
        setDeleteOpen(false);
        setDeleteRow(null);
    };


    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <MainCard
                    title={
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <BusinessIcon color="primary" />
                            <Typography variant="h4" fontWeight={700}>Test Agency Details List</Typography>
                        </Stack>
                    }
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="center" justifyContent="space-between">
                        <TextField
                            size="small"
                            placeholder="Search by name, address, state..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            sx={{ minWidth: 300 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
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

                    {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                    {loading && rows.length === 0 ? (
                        <Stack alignItems="center" py={6}>
                            <CircularProgress />
                        </Stack>
                    ) : filteredRows.length === 0 ? (
                        <Alert severity="info">No test agency details found.</Alert>
                    ) : (
                        <>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Agency Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Pincode</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRows.map((row) => (
                                            <TableRow key={row.id} hover>
                                                <TableCell>#{row.id}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <BusinessIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <LocationOnIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">{row.address}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{row.pincode}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <CalendarMonthIcon fontSize="inherit" color="action" />
                                                        <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                                                            {row.created ? formatDateTime(row.created) : 'N/A'}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="center"
                                                        spacing={0.5}
                                                    >
                                                        <Tooltip title="Edit agency details">
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleEditClick(row)
                                                                }
                                                                aria-label="Edit agency details"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Delete agency details">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleDeleteClick(row)
                                                                }
                                                                aria-label="Delete agency details"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredRows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </MainCard>
            </Grid>
            {/* Edit Dialog */}
            <Dialog
                open={editOpen}
                onClose={handleEditClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Edit Test Agency Details
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Agency Name"
                            value={selectedRow?.name || ''}
                            fullWidth
                            size="small"
                            disabled
                        />

                        <TextField
                            label="Address"
                            name="address"
                            value={editForm.address}
                            onChange={handleEditChange}
                            fullWidth
                            multiline
                            minRows={2}
                        />

                        <TextField
                            label="Pincode"
                            name="pincode"
                            value={editForm.pincode}
                            onChange={handleEditChange}
                            fullWidth
                            size="small"
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleEditClose}
                        disabled={saving}
                        color="inherit"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={saving}
                        startIcon={
                            saving ? <CircularProgress size={16} /> : null
                        }
                    >
                        {saving ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteOpen}
                onClose={handleDeleteClose}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Confirm Delete
                </DialogTitle>

                <DialogContent>
                    Are you sure you want to delete the details for{' '}
                    <strong>{deleteRow?.name || 'this agency'}</strong>
                    {' '}(ID: {deleteRow?.id})?
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleDeleteClose} color="inherit">
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                sx={{ zIndex: 9999 }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default TestAgencyDetailsList;
