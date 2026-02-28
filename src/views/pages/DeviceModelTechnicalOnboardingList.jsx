import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
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
    approved: { label: "Approved", color: "success" },
    rejected: { label: "Rejected", color: "error" },
    processing: { label: "Processing", color: "info" },
    created: { label: "Created", color: "default" },
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
const RequestRow = ({ row, index }) => {
    const [open, setOpen] = useState(false);

    const demoDevices = useMemo(() => {
        if (!row.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row.demo_devices]);

    const hasReport = row.final_comment || row.compatibility_report_pdf || row.report || row.comment || row.remarks;

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

                {/* status */}
                <TableCell sx={{ py: 1 }}>
                    <StatusChip status={row.status} />
                </TableCell>

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

                {/* report/comment indicator */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" justifyContent="center">
                        {row.compatibility_report_pdf ? (
                            <Tooltip title="Compatibility Report Available">
                                <DescriptionIcon fontSize="small" color="primary" />
                            </Tooltip>
                        ) : row.user_manual_pdf ? (
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
                <TableCell colSpan={5} sx={{ py: 0, bgcolor: "primary.50" }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2 }}>
                            <Grid container spacing={2}>

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
                                                    ["Status", row.device_model?.status],
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

                                {/* VLTD Demo Devices */}
                                {demoDevices.length > 0 && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <SimCardIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    VLTD Demo Devices ({demoDevices.length})
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            {demoDevices.map((device, i) => (
                                                <Box key={i} mb={i < demoDevices.length - 1 ? 1.5 : 0}>
                                                    <Typography variant="caption" color="primary" fontWeight={700} display="block" mb={0.5}>
                                                        Device {i + 1}
                                                    </Typography>
                                                    <Grid container rowSpacing={0.25} columnSpacing={1}>
                                                        {[
                                                            ["Serial No", device.device_serial_no],
                                                            ["IMEI", device.imei],
                                                            ["CCID 1", device.ccid1],
                                                            ["CCID 2", device.ccid2],
                                                            ["MSISDN 1", device.msisdn1],
                                                            ["MSISDN 2", device.msisdn2],
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
                                                    {i < demoDevices.length - 1 && <Divider sx={{ mt: 1 }} />}
                                                </Box>
                                            ))}
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Uploaded Documents */}
                                {(row.user_manual_pdf || row.ot_command_list_pdf || row.compatibility_report_pdf) && (
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
                                                <DocumentButton label="Compatibility Report" path={row.compatibility_report_pdf} />
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Report / Comment (finalization note) */}
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
                                                    Report / Comment
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

    const paginatedRows = useMemo(
        () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [rows, page, rowsPerPage]
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
                        View the status of all technical onboarding requests you have submitted. Click a row to see full details, documents, and any reports or comments.
                    </Typography>

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
                                            <TableCell sx={{ color: "white", fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: 700 }}>Device Model</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: 700 }}>Report</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedRows.map((row, idx) => (
                                            <RequestRow key={row.id ?? idx} row={row} index={idx} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                component="div"
                                count={rows.length}
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
