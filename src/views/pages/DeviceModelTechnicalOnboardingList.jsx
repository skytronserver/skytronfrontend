import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DevicesIcon from "@mui/icons-material/Devices";
import SimCardIcon from "@mui/icons-material/SimCard";
import DescriptionIcon from "@mui/icons-material/Description";
import CommentIcon from "@mui/icons-material/Comment";
import EventIcon from "@mui/icons-material/Event";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import { openFile } from "../../helper";

/* ─── helpers ─── */
const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return value;
    }
};

const DocumentButton = ({ label, path }) => {
    if (!path) return null;

    return (
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" sx={{ width: "100%" }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon fontSize="small" color="action" />
                <Typography variant="caption">{label}</Typography>
            </Stack>
            <Chip
                label="View / Download"
                size="small"
                color="primary"
                variant="outlined"
                clickable
                onClick={(e) => openFile(e, path)}
                sx={{ height: 20, fontSize: "0.65rem" }}
            />
        </Stack>
    );
};

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "warning" },
    submitted: { label: "Submitted", color: "info" },
    ongoing_evaluation: { label: "Ongoing Evaluation", color: "secondary" },
    technically_compatible: { label: "Technically Compatible", color: "success" },
    technically_not_compatible: { label: "Technically Not Compatible", color: "error" },
    stateadminapproved: { label: "State Admin Approved", color: "success" },
    stateadminrejected: { label: "State Admin Rejected", color: "error" },
    accepted: { label: "Accepted", color: "success" },
    rejected: { label: "Rejected", color: "error" },
    approved: { label: "Approved", color: "success" },
    processing: { label: "Processing", color: "info" },
};

const StatusChip = ({ status }) => {
    const key = String(status ?? "").trim().toLowerCase();
    const cfg = STATUS_CONFIG[key] ?? { label: status || "—", color: "default" };
    return (
        <Chip
            label={cfg.label}
            color={cfg.color}
            size="small"
            sx={{ fontWeight: 600, minWidth: 80 }}
        />
    );
};

/* ─── collapsible row ─── */
const RequestRow = ({ row, index, testBoardProgress }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const demoDevices = useMemo(() => {
        if (!row.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row.demo_devices]);

    const allDevicesReceived = demoDevices.length > 0 && demoDevices.every(d => d.receipt_confirmed);

    const hasReport = row.final_comment || row.compatibility_report_pdf || row.report || row.comment || row.remarks;

    const statusKey = String(row.status ?? "").trim().toLowerCase();
    const isOngoingEval = statusKey === "ongoing_evaluation";
    const tbProgress = testBoardProgress?.[row.id];

    // Compute steps display from real data
    const stepsDisplay = useMemo(() => {
        // Guard against dummy DB data: if admin hasn't confirmed devices, testing mathematically cannot have started
        if (!allDevicesReceived) {
            return null;
        }

        if (statusKey === "submitted") {
            return null;
        }

        if (tbProgress && tbProgress.total > 0) {
            // Use real test board data
            const total = tbProgress.total || 0;
            const completed = tbProgress.completed || 0;
            const currentTestName = tbProgress.currentTestName || "";
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                label: `${completed} / ${total} Tests Completed`,
                pct,
                pending: completed < total
                    ? `In Progress: ${currentTestName}`
                    : "All tests completed",
                color: completed === total ? "success" : "primary",
            };
        }

        // Finalized statuses
        const isFailed = statusKey === "technically_not_compatible" || statusKey === "rejected" || statusKey === "stateadminrejected";
        if (statusKey === "technically_compatible" || statusKey === "accepted" || statusKey === "approved" || statusKey === "stateadminapproved" || isFailed) {
            return {
                label: "Testing Completed",
                pct: 100,
                pending: isFailed ? "Not Compatible" : "All tests completed",
                color: isFailed ? "error" : "success",
            };
        }

        // not started or no data yet
        if (statusKey === "pending" || statusKey === "stock_received" || statusKey === "devices_received" || isOngoingEval) {
            return {
                label: "Testing In Progress",
                pct: 0,
                pending: "Loading test progress...",
                color: "primary",
            };
        }

        return null;
    }, [statusKey, isOngoingEval, tbProgress, allDevicesReceived]);

    return (
        <>
            <TableRow
                hover
                sx={{
                    "& > *": { borderBottom: "unset" },
                    bgcolor: index % 2 === 0 ? "background.paper" : "grey.50",
                    cursor: "pointer",
                }}
                onClick={() => setOpen((p) => !p)}
            >
                {/* expand toggle */}
                <TableCell sx={{ width: 40, py: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                {/* request date-time */}
                <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(row.request_datetime || row.created_at || row.created)}
                    </Typography>
                </TableCell>

                {/* status removed - redundant with STEPS column */}
                
                {/* action required / progress */}
                <TableCell sx={{ py: 1, minWidth: 200 }}>
                    {stepsDisplay ? (
                        <Stack spacing={1} sx={{ py: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600}>
                                    {stepsDisplay.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    {stepsDisplay.pct}%
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={stepsDisplay.pct} 
                                color={stepsDisplay.color}
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {stepsDisplay.pending}
                            </Typography>
                        </Stack>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Testing not started</Typography>
                    )}
                </TableCell>

                {/* evaluation datetime removed */}

                {/* device model */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DevicesIcon fontSize="small" color="action" />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {row.device_model?.model_name || row.device_model_name || `Model ID: ${row.device_model_id ?? row.device_model ?? "—"}`}
                            </Typography>
                            {row.device_model?.tac_no && (
                                <Typography variant="caption" color="text.secondary">
                                    TAC: {row.device_model.tac_no}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </TableCell>

                {/* Compatibility test findings indicator */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" justifyContent="center">
                        {/* row.compatibility_report_pdf ? (
                            <Tooltip title="Compatibility Report Available">
                                <DescriptionIcon fontSize="small" color="primary" />
                            </Tooltip>
                        ) : */ row.user_manual_pdf ? (
                                <Tooltip title="User Manual Available">
                                    <DescriptionIcon fontSize="small" color="info" />
                                </Tooltip>
                            ) : hasReport ? (
                                <Tooltip title="Evaluation Comment Available">
                                    <CommentIcon fontSize="small" color="primary" />
                                </Tooltip>
                            ) : null}
                    </Stack>
                </TableCell>
            </TableRow>

            {/* ── expanded detail row ── */}
            <TableRow>
                <TableCell colSpan={6} sx={{ py: 0, bgcolor: "primary.50" }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2 }}>
                            <Grid container spacing={2}>

                                {/* VLTD Demo Devices Table */}
                                {demoDevices.length > 0 && (
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <SimCardIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    VLTD Devices ({demoDevices.length})
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <TableContainer sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                <Table size="small">
                                                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Device</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>IMEI / Serial No.</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>CCID / MSISDN (SIM 1)</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>CCID / MSISDN (SIM 2)</TableCell>
                                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', align: 'right' }}>Status</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {demoDevices.map((device, i) => (
                                                            <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                                <TableCell sx={{ py: 1 }}>
                                                                    <Typography variant="caption" color="primary" fontWeight={700}>
                                                                        #{i + 1}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ py: 1 }}>
                                                                    <Typography variant="caption" display="block" color="text.secondary">IMEI: {device.imei}</Typography>
                                                                    <Typography variant="caption" display="block" color="text.secondary">SN: {device.device_serial_no || device.serial_no}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ py: 1 }}>
                                                                    <Typography variant="caption" display="block" color="text.secondary">CCID: {device.ccid1}</Typography>
                                                                    <Typography variant="caption" display="block" color="text.secondary">MSISDN: {device.msisdn1}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ py: 1 }}>
                                                                    <Typography variant="caption" display="block" color="text.secondary">CCID: {device.ccid2}</Typography>
                                                                    <Typography variant="caption" display="block" color="text.secondary">MSISDN: {device.msisdn2}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ py: 1, textAlign: 'right' }}>
                                                                    <Chip 
                                                                        label={device.receipt_confirmed ? "Received" : "Pending"} 
                                                                        color={device.receipt_confirmed ? "success" : "warning"}
                                                                        variant="outlined" 
                                                                        size="small" 
                                                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Request Info */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                            <EventIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                Request Info
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                                            {[
                                                ["Submitted", formatDateTime(row.request_datetime || row.created_at || row.created)],
                                                ["Request ID", row.id],
                                                ["Evaluation Date", row.evaluation_datetime ? formatDateTime(row.evaluation_datetime) : null],
                                                ["Finalized", row.decision_datetime ? formatDateTime(row.decision_datetime) : null],
                                            ].map(([lbl, val]) =>
                                                val ? (
                                                    <React.Fragment key={lbl}>
                                                        <Grid item xs={5}>
                                                            <Typography variant="caption" color="text.secondary">{lbl}</Typography>
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <Typography variant="caption" fontWeight={600}>{val}</Typography>
                                                        </Grid>
                                                    </React.Fragment>
                                                ) : null
                                            )}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Device Model Details */}
                                {row.device_model && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DevicesIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    Device Model Details
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Grid container rowSpacing={0.5} columnSpacing={2}>
                                                {[
                                                    ["Model Name", row.device_model?.model_name],
                                                    ["TAC No", row.device_model?.tac_no],
                                                    ["TAC Validity", row.device_model?.tac_validity],
                                                    ["Hardware Version", row.device_model?.hardware_version],
                                                    ["Test Agency", row.device_model?.test_agency],
                                                ].map(([lbl, val]) =>
                                                    val ? (
                                                        <React.Fragment key={lbl}>
                                                            <Grid item xs={5}>
                                                                <Typography variant="caption" color="text.secondary">{lbl}</Typography>
                                                            </Grid>
                                                            <Grid item xs={7}>
                                                                <Typography variant="caption" fontWeight={600}>{val}</Typography>
                                                            </Grid>
                                                        </React.Fragment>
                                                    ) : null
                                                )}
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                )}


                                {(row.user_manual_pdf || row.ot_command_list_pdf /* || row.compatibility_report_pdf */) && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DescriptionIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    Uploaded Documents
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Stack spacing={1.5}>
                                                <DocumentButton label="User Manual PDF" path={row.user_manual_pdf} />
                                                <DocumentButton label="OT Command List PDF" path={row.ot_command_list_pdf} />
                                                {/* <DocumentButton label="Compatibility Report" path={row.compatibility_report_pdf} /> */}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Compatibility Test Findings (finalization note) */}
                                {hasReport && (
                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                borderColor: "primary.light",
                                                bgcolor: "primary.50",
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <CommentIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    Compatibility Test Findings
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
                                                {row.final_comment || row.report || row.comment || row.remarks}
                                            </Typography>
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

/* ═══════════════════════════════════════════════════ */

const DeviceModelTechnicalOnboardingList = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [testBoardProgress, setTestBoardProgress] = useState({});

    const loadData = useCallback(async () => {
        setError("");
        setLoading(true);
        try {
            const res = await DeviceModelServices.listManufacturerTechnicalOnboardingRequests({});
            const data = res?.data;
            if (Array.isArray(data)) {
                setRows(data);
            } else if (Array.isArray(data?.results)) {
                setRows(data.results);
            } else if (Array.isArray(data?.data)) {
                setRows(data.data);
            } else {
                setRows([]);
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to load technical onboarding requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Fetch test board progress for ongoing rows
    useEffect(() => {
        const activeRows = rows.filter(r => {
            const s = String(r.status ?? "").trim().toLowerCase();
            return s !== "submitted" && !["technically_not_compatible", "rejected", "stateadminrejected", "technically_compatible", "accepted", "approved", "stateadminapproved"].includes(s);
        });
        if (activeRows.length === 0) return;

        const fetchProgress = async () => {
            const progressMap = {};
            await Promise.all(
                activeRows.map(async (r) => {
                    try {
                        const res = await DeviceModelServices.getTestBoard({ onboarding_request_id: r.id });
                        let categories = [];
                        if (Array.isArray(res?.data)) categories = res.data;
                        else if (res?.data?.rows) categories = res.data.rows;
                        else if (res?.data?.categories) categories = res.data.categories;

                        const total = categories.length;
                        const completed = categories.filter(cat =>
                            cat.executions && cat.executions.length > 0 &&
                            cat.executions.every(e => e.status === "pass" || e.status === "completed")
                        ).length;

                        let currentTestName = "";
                        for (const cat of categories) {
                            const allDone = cat.executions && cat.executions.every(e => e.status === "pass" || e.status === "completed");
                            if (!allDone) {
                                currentTestName = cat.test_case?.name || `Test #${cat.test_case?.serial_no}`;
                                break;
                            }
                        }

                        progressMap[r.id] = { total, completed, currentTestName };
                    } catch {
                        // silently skip if test board fetch fails
                    }
                })
            );
            setTestBoardProgress(progressMap);
        };

        fetchProgress();
    }, [rows]);

    const filteredRows = useMemo(() => {
        return rows.filter((r) => {
            let match = true;
            // Search Query: Request ID, Model Name, TAC
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const idStr = String(r.id || "").toLowerCase();
                const modelStr = String(r.device_model?.model_name || r.device_model_name || "").toLowerCase();
                const tacStr = String(r.device_model?.tac_no || "").toLowerCase();
                if (!idStr.includes(q) && !modelStr.includes(q) && !tacStr.includes(q)) match = false;
            }
            // Status filter
            if (statusFilter) {
                const s = String(r.status ?? "").trim().toLowerCase();
                if (s !== statusFilter.toLowerCase()) match = false;
            }
            // Date filter
            if (dateFilter) {
                const rowDate = new Date(r.request_datetime || r.created_at || r.created).toISOString().split('T')[0];
                if (rowDate !== dateFilter) match = false;
            }
            return match;
        });
    }, [rows, searchQuery, statusFilter, dateFilter]);

    const paginatedRows = useMemo(
        () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredRows, page, rowsPerPage]
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <MainCard
                    title={
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <DevicesIcon color="primary" />
                                <Typography variant="h4" fontWeight={700}>
                                    My Technical Onboarding Requests
                                </Typography>
                            </Stack>
                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton
                                        onClick={loadData}
                                        disabled={loading}
                                        size="small"
                                        color="primary"
                                    >
                                        {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    }
                >
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        View the status of all technical onboarding requests you have submitted. Click a row to see full details, documents, and any compatibility test findings.
                    </Typography>

                    {/* Filter Bar */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Search (ID, Model, TAC)"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                    >
                                        <MenuItem value=""><em>All Statuses</em></MenuItem>
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                            <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={dateFilter}
                                    onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {loading && rows.length === 0 ? (
                        <Stack alignItems="center" py={6}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary" mt={2}>
                                Loading requests…
                            </Typography>
                        </Stack>
                    ) : rows.length === 0 && !loading ? (
                        <Alert severity="info">
                            No technical onboarding requests found. Submit a new request using the <strong>Technical Onboarding</strong> form.
                        </Alert>
                    ) : (
                        <>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "primary.main" }}>
                                            <TableCell sx={{ width: 40 }} />
                                            <TableCell sx={{ color: "white", fontWeight: 700 }}>Request Date &amp; Time</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: 700, minWidth: 200 }}>STEPS</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: 700 }}>Device Model</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: 700 }}>Report</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRows.length > 0 ? (
                                            paginatedRows.map((row, idx) => (
                                                <RequestRow key={row.id ?? idx} row={row} index={idx} testBoardProgress={testBoardProgress} />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                                    <Typography variant="body2" color="text.secondary">No matching requests found for these filters.</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                component="div"
                                count={filteredRows.length}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                            />
                        </>
                    )}
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default DeviceModelTechnicalOnboardingList;
