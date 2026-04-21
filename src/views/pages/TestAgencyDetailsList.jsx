import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
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
    Typography,
    Tooltip,
    IconButton,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import TestAgencyServices from '../../services/TestAgencyServices';
import { formatDateTime } from '../../helper';

const TestAgencyDetailsList = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
        </Grid>
    );
};

export default TestAgencyDetailsList;
