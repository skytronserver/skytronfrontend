import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Radio,
    RadioGroup,
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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DevicesIcon from "@mui/icons-material/Devices";
import SimCardIcon from "@mui/icons-material/SimCard";
import DescriptionIcon from "@mui/icons-material/Description";
import CommentIcon from "@mui/icons-material/Comment";
import BusinessIcon from "@mui/icons-material/Business";
import SearchIcon from "@mui/icons-material/Search";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GavelIcon from "@mui/icons-material/Gavel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import { openFile } from "../../helper";

/* ─── helpers ─── */
const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return value; }
};

const toDatetimeLocalValue = (d) => {
    const dt = d ? new Date(d) : new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toISOString = (datetimeLocalVal) => {
    if (!datetimeLocalVal) return undefined;
    return new Date(datetimeLocalVal).toISOString();
};

/* extract a readable error message from an axios error */
const extractError = (err) => {
    const d = err?.response?.data;
    if (typeof d === "string") return d;
    if (d?.error) return d.error;
    if (d?.message) return d.message;
    if (d?.detail) return d.detail;
    if (d && typeof d === "object") {
        // join first field-level error found
        const first = Object.values(d)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === "string") return first;
    }
    return err?.message || "An unexpected error occurred.";
};

/* ── status configuration ── */
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "warning" },
    submitted: { label: "Submitted", color: "info" },
    ongoing_evaluation: { label: "Ongoing Evaluation", color: "secondary" },
    accepted: { label: "Accepted", color: "success" },
    rejected: { label: "Rejected", color: "error" },
    approved: { label: "Approved", color: "success" },
    processing: { label: "Processing", color: "info" },
    created: { label: "Created", color: "default" },
};

const StatusChip = ({ status }) => {
    const key = String(status ?? "").trim().toLowerCase();
    const cfg = STATUS_CONFIG[key] ?? { label: status || "—", color: "default" };
    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600, minWidth: 86 }} />;
};

/* ── resolve manufacturer name ── */
const resolveManufacturer = (row) => {
    const obj =
        row.manufacturer || row.manufacturer_info ||
        row.created_by_info || row.submitted_by || null;
    if (obj) {
        const name = obj.company_name || obj.name || obj.username || obj.email || null;
        if (name) return name;
    }
    return row.manufacturer_name || row.company_name ||
        row.created_by_name || row.submitted_by_name || "—";
};

/* ═══════════════════════════════════════════════════
   MARK ONGOING DIALOG
═══════════════════════════════════════════════════ */
const MarkOngoingDialog = ({ open, row, onClose, onSuccess }) => {
    const [evalDatetime, setEvalDatetime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) { setEvalDatetime(toDatetimeLocalValue(new Date())); setError(""); }
    }, [open]);

    const handleConfirm = async () => {
        setError(""); setSubmitting(true);
        try {
            const payload = { onboarding_request_id: row.id };
            const isoVal = toISOString(evalDatetime);
            if (isoVal) payload.evaluation_datetime = isoVal;
            await DeviceModelServices.markTechnicalOnboardingOngoing(payload);
            onSuccess(row.id);
        } catch (err) {
            setError(extractError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const mfrName = row ? resolveManufacturer(row) : "";
    const modelName = row
        ? (row.device_model?.model_name || row.device_model_name || `ID ${row.device_model_id ?? row.device_model ?? ""}`)
        : "";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <PlayCircleOutlineIcon color="info" />
                    <Typography variant="h5" fontWeight={700}>Mark as Ongoing Evaluation</Typography>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                            {[
                                ["Request ID", row?.id],
                                ["Manufacturer", mfrName],
                                ["Device Model", modelName],
                                ["Current Status", row?.status],
                            ].map(([lbl, val]) => val ? (
                                <React.Fragment key={lbl}>
                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                </React.Fragment>
                            ) : null)}
                        </Grid>
                    </Paper>
                    <Divider />
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight={600}>Evaluation Date &amp; Time</Typography>
                            <Chip label="optional" size="small" variant="outlined" sx={{ fontSize: "0.68rem" }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Schedule when the evaluation will start. Clear the field to let the backend set the current time automatically.
                        </Typography>
                        <TextField
                            fullWidth size="small" type="datetime-local" label="Evaluation Date & Time"
                            value={evalDatetime}
                            onChange={(e) => setEvalDatetime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            helperText="Leave blank to use server time."
                        />
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={submitting} variant="outlined">Cancel</Button>
                <Button
                    onClick={handleConfirm} disabled={submitting} variant="contained" color="info"
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PlayCircleOutlineIcon />}
                >
                    {submitting ? "Marking…" : "Confirm — Mark Ongoing"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   FINALIZE DIALOG
═══════════════════════════════════════════════════ */
const FinalizeDialog = ({ open, row, onClose, onSuccess }) => {
    const [status, setStatus] = useState("accepted");
    const [finalComment, setFinalComment] = useState("");
    const [reportPdf, setReportPdf] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const fileInputRef = useRef(null);

    /* reset every time the dialog opens */
    useEffect(() => {
        if (open) {
            setStatus("accepted");
            setFinalComment("");
            setReportPdf(null);
            setFieldErrors({});
            setApiError("");
        }
    }, [open]);

    const validate = () => {
        const errs = {};
        if (!finalComment.trim()) errs.finalComment = "Final comment is required.";
        if (!reportPdf) errs.reportPdf = "Compatibility report PDF is required.";
        else if (reportPdf.type !== "application/pdf")
            errs.reportPdf = "Only PDF files are accepted.";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setReportPdf(file);
        setFieldErrors((prev) => { const c = { ...prev }; delete c.reportPdf; return c; });
        /* reset input so the same file can be re-selected after removal */
        e.target.value = "";
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setApiError(""); setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("onboarding_request_id", row.id);
            fd.append("status", status);
            fd.append("final_comment", finalComment.trim());
            fd.append("compatibility_report_pdf", reportPdf);
            await DeviceModelServices.finalizeTechnicalOnboardingRequest(fd);
            onSuccess(row.id, status);
        } catch (err) {
            setApiError(extractError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const mfrName = row ? resolveManufacturer(row) : "";
    const modelName = row
        ? (row.device_model?.model_name || row.device_model_name || `ID ${row.device_model_id ?? row.device_model ?? ""}`)
        : "";

    const isAccepting = status === "accepted";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <GavelIcon color="primary" />
                    <Typography variant="h5" fontWeight={700}>Finalize Onboarding Request</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    This action is irreversible. Fill in all required fields before confirming.
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5}>

                    {/* ── Request summary ── */}
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                            {[
                                ["Request ID", row?.id],
                                ["Manufacturer", mfrName],
                                ["Device Model", modelName],
                                ["Current Status", row?.status],
                            ].map(([lbl, val]) => val ? (
                                <React.Fragment key={lbl}>
                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                </React.Fragment>
                            ) : null)}
                        </Grid>
                    </Paper>

                    <Divider />

                    {/* ── Decision: Accept / Reject ── */}
                    <FormControl error={!!fieldErrors.status}>
                        <FormLabel sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
                            Decision *
                        </FormLabel>
                        <RadioGroup
                            row
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <FormControlLabel
                                value="accepted"
                                control={<Radio color="success" />}
                                label={
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                        <Typography variant="body2" fontWeight={600} color="success.main">Accept</Typography>
                                    </Stack>
                                }
                            />
                            <FormControlLabel
                                value="rejected"
                                control={<Radio color="error" />}
                                label={
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CancelIcon color="error" fontSize="small" />
                                        <Typography variant="body2" fontWeight={600} color="error.main">Reject</Typography>
                                    </Stack>
                                }
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* decision context callout */}
                    <Alert
                        severity={isAccepting ? "success" : "error"}
                        icon={isAccepting ? <CheckCircleIcon /> : <CancelIcon />}
                        sx={{ py: 0.5 }}
                    >
                        <Typography variant="caption">
                            {isAccepting
                                ? "Accepting will mark the device model as technically onboarded."
                                : "Rejecting will close this request. The manufacturer may need to resubmit."}
                        </Typography>
                    </Alert>

                    {/* ── Final Comment ── */}
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={6}
                        label="Final Comment *"
                        placeholder="Describe the evaluation outcome, findings, or reason for rejection…"
                        value={finalComment}
                        onChange={(e) => {
                            setFinalComment(e.target.value);
                            setFieldErrors((p) => { const c = { ...p }; delete c.finalComment; return c; });
                        }}
                        error={!!fieldErrors.finalComment}
                        helperText={fieldErrors.finalComment || `${finalComment.length} characters`}
                        inputProps={{ maxLength: 2000 }}
                    />

                    {/* ── Compatibility Report PDF ── */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                            Compatibility Report PDF *
                        </Typography>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={handleFileChange}
                        />
                        <Paper
                            variant="outlined"
                            component="label"
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 2,
                                cursor: "pointer",
                                borderRadius: 2,
                                borderStyle: "dashed",
                                borderColor: fieldErrors.reportPdf
                                    ? "error.main"
                                    : reportPdf
                                        ? "success.main"
                                        : "divider",
                                bgcolor: reportPdf ? "success.50" : "background.paper",
                                transition: "all 0.2s ease",
                                "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 44, height: 44, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: reportPdf ? "success.main" : "grey.100",
                                    color: reportPdf ? "white" : "text.secondary",
                                    flexShrink: 0, transition: "all 0.2s ease",
                                }}
                            >
                                {reportPdf ? <CheckCircleIcon /> : <UploadFileIcon />}
                            </Box>
                            <Box flex={1} minWidth={0}>
                                <Typography variant="subtitle2" fontWeight={600} noWrap>
                                    {reportPdf ? reportPdf.name : "Compatibility Report (PDF)"}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color={reportPdf ? "success.main" : fieldErrors.reportPdf ? "error" : "text.secondary"}
                                    noWrap display="block"
                                >
                                    {reportPdf
                                        ? `${(reportPdf.size / 1024).toFixed(1)} KB — click to change`
                                        : fieldErrors.reportPdf
                                            ? fieldErrors.reportPdf
                                            : "Click to upload PDF — max 10 MB"}
                                </Typography>
                            </Box>
                            <UploadFileIcon sx={{ color: reportPdf ? "success.main" : "text.disabled", flexShrink: 0 }} />
                        </Paper>
                        {fieldErrors.reportPdf && (
                            <FormHelperText error>{fieldErrors.reportPdf}</FormHelperText>
                        )}
                    </Box>

                    {/* ── API error ── */}
                    {apiError && <Alert severity="error">{apiError}</Alert>}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={submitting} variant="outlined">Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    disabled={submitting}
                    variant="contained"
                    color={isAccepting ? "success" : "error"}
                    startIcon={
                        submitting
                            ? <CircularProgress size={16} color="inherit" />
                            : isAccepting ? <CheckCircleIcon /> : <CancelIcon />
                    }
                >
                    {submitting
                        ? "Submitting…"
                        : isAccepting ? "Confirm — Accept" : "Confirm — Reject"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   COLLAPSIBLE TABLE ROW
═══════════════════════════════════════════════════ */
const RequestRow = ({ row, onMarkOngoing, onFinalize }) => {
    const [open, setOpen] = useState(false);

    const demoDevices = useMemo(() => {
        if (!row.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row.demo_devices]);

    const manufacturerName = useMemo(() => resolveManufacturer(row), [row]);
    const hasReport = row.final_comment || row.compatibility_report_pdf || row.report || row.comment || row.remarks;

    const mfrObj = row.manufacturer || row.manufacturer_info || row.created_by_info || {};
    const mfrEmail = mfrObj.email || row.created_by_email || null;
    const mfrMobile = mfrObj.mobile || row.created_by_mobile || null;

    const statusKey = String(row.status ?? "").trim().toLowerCase();
    const isSubmitted = statusKey === "submitted";
    const isOngoingEval = statusKey === "ongoing_evaluation";

    return (
        <>
            <TableRow
                hover
                sx={{ "& > *": { borderBottom: "unset" }, cursor: "pointer" }}
                onClick={() => setOpen((p) => !p)}
            >
                {/* expand toggle */}
                <TableCell sx={{ width: 40, py: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                {/* date */}
                <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(row.request_datetime || row.created_at || row.created)}
                    </Typography>
                </TableCell>

                {/* manufacturer */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={600} noWrap>{manufacturerName}</Typography>
                    </Stack>
                </TableCell>

                {/* device model */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DevicesIcon fontSize="small" color="action" />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {row.device_model?.model_name || row.device_model_name ||
                                    `Model ID: ${row.device_model_id ?? row.device_model ?? "—"}`}
                            </Typography>
                            {row.device_model?.tac_no && (
                                <Typography variant="caption" color="text.secondary">
                                    TAC: {row.device_model.tac_no}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </TableCell>

                {/* status */}
                <TableCell sx={{ py: 1 }}><StatusChip status={row.status} /></TableCell>

                {/* actions */}
                <TableCell sx={{ py: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap">
                        {isSubmitted && (
                            <Tooltip title="Mark as Ongoing Evaluation">
                                <Button
                                    size="small" variant="contained" color="info"
                                    startIcon={<PlayCircleOutlineIcon fontSize="small" />}
                                    onClick={() => onMarkOngoing(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Mark Ongoing
                                </Button>
                            </Tooltip>
                        )}
                        {isOngoingEval && (
                            <Tooltip title="Finalize — Accept or Reject this request">
                                <Button
                                    size="small" variant="contained" color="primary"
                                    startIcon={<GavelIcon fontSize="small" />}
                                    onClick={() => onFinalize(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Finalize
                                </Button>
                            </Tooltip>
                        )}
                        {row.compatibility_report_pdf ? (
                            <Tooltip title="View Compatibility Report">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openFile(e, row.compatibility_report_pdf);
                                    }}
                                >
                                    <DescriptionIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ) : hasReport ? (
                            <Tooltip title="Has evaluation comment">
                                <CommentIcon fontSize="small" color="primary" />
                            </Tooltip>
                        ) : null}
                    </Stack>
                </TableCell>
            </TableRow>

            {/* ── expanded detail ── */}
            <TableRow>
                <TableCell colSpan={6} sx={{ py: 0, bgcolor: "primary.50" }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2 }}>
                            <Grid container spacing={2}>

                                {/* Manufacturer */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                            <BusinessIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>Manufacturer Details</Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                                            {[
                                                ["Company", manufacturerName],
                                                ["Email", mfrEmail],
                                                ["Mobile", mfrMobile],
                                                ["Submitted", formatDateTime(row.request_datetime || row.created_at || row.created)],
                                                ["Request ID", row.id],
                                            ].map(([lbl, val]) => val ? (
                                                <React.Fragment key={lbl}>
                                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                </React.Fragment>
                                            ) : null)}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Device Model */}
                                {row.device_model && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DevicesIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Device Model Details</Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Grid container rowSpacing={0.5} columnSpacing={2}>
                                                {[
                                                    ["Model Name", row.device_model?.model_name],
                                                    ["TAC No", row.device_model?.tac_no],
                                                    ["TAC Validity", row.device_model?.tac_validity],
                                                    ["Hardware Version", row.device_model?.hardware_version],
                                                    ["Test Agency", row.device_model?.test_agency],
                                                    ["Model Status", row.device_model?.status],
                                                ].map(([lbl, val]) => val ? (
                                                    <React.Fragment key={lbl}>
                                                        <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                        <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                    </React.Fragment>
                                                ) : null)}
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Demo Devices */}
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
                                                        ].map(([lbl, val]) => val ? (
                                                            <React.Fragment key={lbl}>
                                                                <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                                <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                            </React.Fragment>
                                                        ) : null)}
                                                    </Grid>
                                                    {i < demoDevices.length - 1 && <Divider sx={{ mt: 1 }} />}
                                                </Box>
                                            ))}
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Documents */}
                                {(row.user_manual_pdf || row.ot_command_list_pdf || row.compatibility_report_pdf) && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DescriptionIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Uploaded Documents</Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Stack spacing={1}>
                                                {[
                                                    ["User Manual PDF", row.user_manual_pdf],
                                                    ["OT Command List PDF", row.ot_command_list_pdf],
                                                    ["Compatibility Report PDF", row.compatibility_report_pdf],
                                                ].map(([lbl, url]) => url ? (
                                                    <Stack key={lbl} direction="row" alignItems="center" spacing={1} justifyContent="space-between" sx={{ width: "100%" }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <DescriptionIcon fontSize="small" color="action" />
                                                            <Typography variant="caption">{lbl}</Typography>
                                                        </Stack>
                                                        <Chip
                                                            label="View / Download"
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            clickable
                                                            onClick={(e) => openFile(e, url)}
                                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                                        />
                                                    </Stack>
                                                ) : null)}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Report / Comment */}
                                {hasReport && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "primary.light", bgcolor: "primary.50" }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <CommentIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Report / Comment</Typography>
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

/* ─── summary stat card ─── */
const StatCard = ({ label, value, color }) => (
    <Paper variant="outlined" sx={{
        p: 2, borderRadius: 2, borderLeft: 4, borderLeftColor: `${color}.main`,
        flex: "1 1 120px", minWidth: 100,
    }}>
        <Typography variant="h4" fontWeight={700} color={`${color}.main`}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
);

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const DeviceModelTechnicalOnboardingAdminList = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* dialog state */
    const [ongoingDialog, setOngoingDialog] = useState({ open: false, row: null });
    const [finalizeDialog, setFinalizeDialog] = useState({ open: false, row: null });
    const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

    const loadData = useCallback(async () => {
        setError(""); setLoading(true);
        try {
            const res = await DeviceModelServices.listSuperadminTechnicalOnboardingRequests({});
            const data = res?.data;
            if (Array.isArray(data)) setRows(data);
            else if (Array.isArray(data?.results)) setRows(data.results);
            else if (Array.isArray(data?.data)) setRows(data.data);
            else setRows([]);
        } catch (err) {
            setError(extractError(err) || "Failed to load technical onboarding requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── optimistic update helpers ── */
    const patchRow = useCallback((id, patch) => {
        setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
    }, []);

    const handleMarkOngoingSuccess = useCallback((id) => {
        setOngoingDialog({ open: false, row: null });
        patchRow(id, { status: "ongoing_evaluation" });
        setActionMsg({ type: "success", text: `Request #${id} marked as Ongoing Evaluation.` });
    }, [patchRow]);

    const handleFinalizeSuccess = useCallback((id, decision) => {
        setFinalizeDialog({ open: false, row: null });
        patchRow(id, { status: decision });
        setActionMsg({
            type: decision === "accepted" ? "success" : "warning",
            text: `Request #${id} has been ${decision === "accepted" ? "accepted ✓" : "rejected"}.`,
        });
    }, [patchRow]);

    /* ── search ── */
    const filteredRows = useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.trim().toLowerCase();
        return rows.filter((r) => {
            const mfr = resolveManufacturer(r).toLowerCase();
            const model = (r.device_model?.model_name || r.device_model_name || "").toLowerCase();
            const status = (r.status || "").toLowerCase();
            const tac = (r.device_model?.tac_no || "").toLowerCase();
            return mfr.includes(q) || model.includes(q) || status.includes(q) || tac.includes(q);
        });
    }, [rows, search]);

    /* ── stats ── */
    const stats = useMemo(() => {
        const count = (s) => rows.filter((r) => String(r.status ?? "").trim().toLowerCase() === s).length;
        return {
            total: rows.length,
            submitted: count("submitted"),
            ongoing: count("ongoing_evaluation"),
            accepted: count("accepted") + count("approved"),
            rejected: count("rejected"),
        };
    }, [rows]);

    const paginatedRows = useMemo(
        () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredRows, page, rowsPerPage]
    );

    return (
        <>
            {/* ── Dialogs ── */}
            <MarkOngoingDialog
                open={ongoingDialog.open}
                row={ongoingDialog.row}
                onClose={() => setOngoingDialog({ open: false, row: null })}
                onSuccess={handleMarkOngoingSuccess}
            />
            <FinalizeDialog
                open={finalizeDialog.open}
                row={finalizeDialog.row}
                onClose={() => setFinalizeDialog({ open: false, row: null })}
                onSuccess={handleFinalizeSuccess}
            />

            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <MainCard
                        title={
                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <DevicesIcon color="primary" />
                                    <Typography variant="h4" fontWeight={700}>Technical Onboarding Requests</Typography>
                                    <Chip label={`${rows.length} total`} size="small" color="primary" variant="outlined" />
                                </Stack>
                                <Tooltip title="Refresh">
                                    <span>
                                        <IconButton onClick={loadData} disabled={loading} size="small" color="primary">
                                            {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        }
                    >
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Admin view of all technical onboarding requests. Use <strong>Mark Ongoing</strong> on{" "}
                            <em>Submitted</em> requests to start evaluation, then <strong>Finalize</strong> on{" "}
                            <em>Ongoing Evaluation</em> requests to accept or reject.
                        </Typography>

                        {/* ── Action feedback ── */}
                        {actionMsg.text && (
                            <Alert severity={actionMsg.type || "success"} onClose={() => setActionMsg({ type: "", text: "" })} sx={{ mb: 2 }}>
                                {actionMsg.text}
                            </Alert>
                        )}

                        {/* ── Stats ── */}
                        {rows.length > 0 && (
                            <Stack direction="row" flexWrap="wrap" gap={2} mb={3}>
                                <StatCard label="Total" value={stats.total} color="primary" />
                                <StatCard label="Submitted" value={stats.submitted} color="info" />
                                <StatCard label="Ongoing Eval." value={stats.ongoing} color="secondary" />
                                <StatCard label="Accepted" value={stats.accepted} color="success" />
                                <StatCard label="Rejected" value={stats.rejected} color="error" />
                            </Stack>
                        )}

                        {/* ── Search ── */}
                        {rows.length > 0 && (
                            <Box mb={2} maxWidth={420}>
                                <TextField
                                    fullWidth size="small"
                                    placeholder="Search by manufacturer, model, TAC, status…"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {loading && rows.length === 0 ? (
                            <Stack alignItems="center" py={6}>
                                <CircularProgress />
                                <Typography variant="body2" color="text.secondary" mt={2}>Loading requests…</Typography>
                            </Stack>
                        ) : rows.length === 0 && !loading ? (
                            <Alert severity="info">No technical onboarding requests found.</Alert>
                        ) : filteredRows.length === 0 ? (
                            <Alert severity="info">No results match your search query.</Alert>
                        ) : (
                            <>
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: "primary.main" }}>
                                                <TableCell sx={{ width: 40 }} />
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Request Date &amp; Time</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Manufacturer</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Device Model</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Status</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedRows.map((row, idx) => (
                                                <RequestRow
                                                    key={row.id ?? idx}
                                                    row={row}
                                                    onMarkOngoing={(r) => setOngoingDialog({ open: true, row: r })}
                                                    onFinalize={(r) => setFinalizeDialog({ open: true, row: r })}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    component="div"
                                    count={filteredRows.length}
                                    page={page}
                                    onPageChange={(_, newPage) => setPage(newPage)}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                />
                            </>
                        )}
                    </MainCard>
                </Grid>
            </Grid>
        </>
    );
};

export default DeviceModelTechnicalOnboardingAdminList;
