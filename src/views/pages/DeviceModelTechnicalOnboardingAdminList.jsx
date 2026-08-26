/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
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
    Stepper,
    Step,
    StepLabel,
    StepContent,
    LinearProgress,
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
import ManufacturerServices from "../../services/ManufacturerServices";
import { openFile, getRole } from "../../helper";
import DeviceDataHealthService from "../../services/DeviceDataHealth";

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
    devices_received: { label: "Accepted", color: "success" },
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

    const demoDevices = useMemo(() => {
        if (!row?.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row?.demo_devices]);

    useEffect(() => {
        if (open) { 
            setEvalDatetime(toDatetimeLocalValue(new Date())); 
            setError(""); 
        }
    }, [open]);
    const handleConfirm = async () => {
        setError(""); 
        if (!evalDatetime) {
            setError("Evaluation date and time is mandatory.");
            return;
        }
        setSubmitting(true);
        try {
            const minVal = toDatetimeLocalValue(row?.request_datetime || row?.created_at || row?.created);
            if (evalDatetime < minVal) {
                setError("Testing date cannot be earlier than the request date.");
                setSubmitting(false);
                return;
            }
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
                    <Typography variant="h5" fontWeight={700}>Start Testing</Typography>
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
                            <Typography variant="subtitle2" fontWeight={600}>Evaluation Date &amp; Time *</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Schedule when the evaluation will start. This field is mandatory.
                        </Typography>
                        <TextField
                            fullWidth size="small" type="datetime-local" label="Evaluation Date & Time"
                            value={evalDatetime}
                            onChange={(e) => setEvalDatetime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            error={!evalDatetime && !!error}
                            inputProps={{
                                min: toDatetimeLocalValue(row?.request_datetime || row?.created_at || row?.created)
                            }}
                            helperText={
                                evalDatetime ? "Select a date on or after the request date." : "Required field."
                            }
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
                    {submitting ? "Starting…" : "Start Testing"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   FINALIZE DIALOG
═══════════════════════════════════════════════════ */
const FinalizeDialog = ({ open, row, onClose, onSuccess }) => {
    const [status, setStatus] = useState("technically_compatible");
    const [finalComment, setFinalComment] = useState("");
    const [reportPdf, setReportPdf] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    // Checklist states
    const [activeTestId, setActiveTestId] = useState(1);
    const [deviceTestResults, setDeviceTestResults] = useState({});
    
    // Test board data from API
    const [testBoardCategories, setTestBoardCategories] = useState([]);
    const [loadingBoard, setLoadingBoard] = useState(false);

    const demoDevices = useMemo(() => {
        if (!row?.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row?.demo_devices]);

    const fetchTestBoard = useCallback(async (showLoading = true) => {
        if (showLoading) setLoadingBoard(true);
        try {
            const res = await DeviceModelServices.getTestBoard({ onboarding_request_id: row?.id });
            let categories = [];
            if (Array.isArray(res?.data)) {
                categories = res.data;
            } else if (res?.data?.rows) {
                categories = res.data.rows;
            } else if (res?.data?.categories) {
                categories = res.data.categories;
            }
            
            if (categories.length > 0) {
                setTestBoardCategories(categories);
                // find the first active test id that has any incomplete execution, or default to 1
                let firstIncompleteId = 1;
                for (const cat of categories) {
                    const hasIncomplete = cat.executions.some(e => e.status === "incomplete" || e.status === "not_started" || e.status === "in_progress");
                    if (hasIncomplete) {
                        firstIncompleteId = cat.test_case.serial_no;
                        break;
                    }
                }
                // if all tests completed, it will set it to the max id
                if (categories.every(cat => cat.executions.every(e => e.status === "pass" || e.status === "completed"))) {
                     firstIncompleteId = categories.length + 1;
                }
                setActiveTestId(firstIncompleteId);
            }
        } catch (err) {
            setApiError(extractError(err));
        } finally {
            if (showLoading) setLoadingBoard(false);
        }
    }, [row?.id]);

    useEffect(() => {
        if (open) {
            setStatus("technically_compatible");
            setFinalComment("");
            setReportPdf(null);
            setFieldErrors({});
            setApiError("");
            setActiveTestId(1);
            setDeviceTestResults({});

            // Fetch test board data
            if (row?.id) fetchTestBoard();
        }
    }, [open, row?.id, fetchTestBoard]);

    // Polling effect for in-progress tests
    useEffect(() => {
        if (!open) return;

        const inProgressExecutions = [];
        testBoardCategories.forEach(cat => {
            if (cat.executions) {
                cat.executions.forEach(exec => {
                    if (exec.status === "in_progress" && exec.id) {
                        inProgressExecutions.push(exec.id);
                    }
                });
            }
        });

        if (inProgressExecutions.length === 0) return;

        const interval = setInterval(() => {
            Promise.all(inProgressExecutions.map(execId => 
                DeviceModelServices.heartbeatTestBoard({ execution_id: execId }).catch(e => console.error(e))
            ));
        }, 5000);

        return () => clearInterval(interval);
    }, [open, testBoardCategories, fetchTestBoard]);

    const handleStartTest = async (testCaseId, demoDeviceId) => {
        try {
            await DeviceModelServices.startTestBoard({
                onboarding_request_id: row.id,
                demo_device_id: demoDeviceId,
                test_case_id: testCaseId
            });
            fetchTestBoard(false);
        } catch (err) {
            setApiError(extractError(err));
        }
    };

    const handleRefreshLog = async (executionId) => {
        try {
            await DeviceModelServices.refreshLogTestBoard({ execution_id: executionId });
            fetchTestBoard(false);
        } catch (err) {
            setApiError(extractError(err));
        }
    };

    const handleCompleteTest = async (executionId) => {
        try {
            await DeviceModelServices.completeTestBoard({ execution_id: executionId });
            fetchTestBoard(false);
        } catch (err) {
            setApiError(extractError(err));
        }
    };

    const validate = () => {
        const errs = {};
        if (!finalComment.trim()) errs.finalComment = "Comment is required.";
        if (!reportPdf) errs.reportPdf = "Report PDF is required.";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setReportPdf(file);
        setFieldErrors((prev) => { const c = { ...prev }; delete c.reportPdf; return c; });
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
            fd.append("device_test_results", JSON.stringify(deviceTestResults));
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

    const imeis = Array.from({ length: 5 }, (_, i) => demoDevices[i]?.imei || `Device ${i + 1}`);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2L20 8L14 14M20 8H4M10 22L4 16L10 10M4 16H20" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Complete Testing & Finalize
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Please complete all testing steps below before uploading the report and finalizing.
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: '#f5f7fa' }}>
                <Box p={3}>
                    {/* Top Block */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3, bgcolor: '#f9fbfd', borderColor: '#e0e0e0' }}>
                        <Grid container rowSpacing={1} columnSpacing={2}>
                            {[
                                ["Request ID", row?.id],
                                ["Manufacturer", mfrName],
                                ["Device Model", modelName],
                                ["Current Status", row?.status],
                            ].map(([lbl, val]) => val ? (
                                <React.Fragment key={lbl}>
                                    <Grid item xs={3} md={2}><Typography variant="body2" color="text.secondary">{lbl}</Typography></Grid>
                                    <Grid item xs={9} md={10}><Typography variant="body2" fontWeight={600} color="text.primary">{val}</Typography></Grid>
                                </React.Fragment>
                            ) : null)}
                        </Grid>
                    </Paper>

                    {/* Test Board */}
                    <Box bgcolor="white" p={3} borderRadius={2} border="1px solid #e0e0e0">
                        <Typography variant="subtitle1" fontWeight={700} mb={1}>
                            Test Board — Request {row?.id} {row?.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Currently unlocked test: #{activeTestId <= testBoardCategories.length ? activeTestId : 'All completed'}
                        </Typography>

                        <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                    <TableRow>
                                        <TableCell sx={{ width: 40 }}><b>#</b></TableCell>
                                        <TableCell sx={{ minWidth: 250 }}><b>Test</b></TableCell>
                                        {imeis.map((imei, idx) => (
                                            <TableCell key={idx} align="center" sx={{ width: 120 }}><b>IMEI {idx + 1}</b></TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loadingBoard ? (
                                        <TableRow>
                                            <TableCell colSpan={2 + imeis.length} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} sx={{ mr: 1, verticalAlign: 'middle' }} /> Fetching Test Board...
                                            </TableCell>
                                        </TableRow>
                                    ) : testBoardCategories.map((category) => {
                                        const step = category.test_case;
                                        const isUnlocked = step.serial_no === activeTestId;
                                        const isCompleted = step.serial_no < activeTestId;
                                        return (
                                            <TableRow key={step.id}>
                                                <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>{step.serial_no}</TableCell>
                                                <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">{step.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{step.description}</Typography>
                                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>source: {step.source_table}</Typography>
                                                </TableCell>
                                                {imeis.map((imei, idx) => {
                                                    const exec = category.executions.find(e => (e.demo_device?.imei === imei) || (e.demo_device?.device_serial_no === imei));
                                                    // use index if match fails
                                                    const execution = exec || category.executions[idx];
                                                    const execStatus = execution?.status || "not_started";
                                                    
                                                    const isExecPass = execStatus === "pass" || execStatus === "completed";
                                                    const isExecIncomplete = execStatus === "incomplete" || execStatus === "in_progress";
                                                    
                                                    return (
                                                    <TableCell key={idx} align="center" sx={{ verticalAlign: 'top', pt: 2, borderLeft: '1px solid #f0f0f0' }}>
                                                        {isExecPass ? (
                                                            <>
                                                                <Chip label="pass" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', mb: 1 }} />
                                                                <Typography variant="caption" display="block" color="text.secondary">Done</Typography>
                                                            </>
                                                        ) : execStatus === "in_progress" ? (
                                                            <>
                                                                <Chip label="In progress" size="small" sx={{ height: 20, fontSize: '0.65rem', mb: 1, bgcolor: '#fff9c4', color: '#f57f17', borderRadius: 1 }} />
                                                                <Button variant="outlined" size="small" sx={{ fontSize: '0.65rem', minWidth: '60px', p: '2px 8px', mb: 0.5, display: 'block', mx: 'auto' }} onClick={() => handleRefreshLog(execution.id)}>
                                                                    Refresh Log
                                                                </Button>
                                                                {execution.test_log_snapshot && (
                                                                    <Box sx={{ my: 1, textAlign: 'left', lineHeight: 1.2 }}>
                                                                        {(() => {
                                                                            let logStr = "";
                                                                            if (typeof execution.test_log_snapshot === 'string') {
                                                                                logStr = execution.test_log_snapshot;
                                                                            } else if (typeof execution.test_log_snapshot === 'object' && execution.test_log_snapshot !== null) {
                                                                                if (execution.test_log_snapshot.matched_count !== undefined) {
                                                                                    logStr = `pass: ${execution.test_log_snapshot.pass} | matched: ${execution.test_log_snapshot.matched_count}/${execution.test_log_snapshot.required || '?'}\n${execution.test_log_snapshot.reason || ''}`;
                                                                                } else {
                                                                                    logStr = JSON.stringify(execution.test_log_snapshot, null, 2);
                                                                                }
                                                                            } else {
                                                                                logStr = String(execution.test_log_snapshot);
                                                                            }
                                                                            return logStr.split('\n').map((line, i) => (
                                                                                <Typography key={i} variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                                    {line}
                                                                                </Typography>
                                                                            ));
                                                                        })()}
                                                                    </Box>
                                                                )}
                                                                <Button variant="contained" disableElevation size="small" sx={{ bgcolor: '#1a237e', color: '#fff', fontSize: '0.7rem', minWidth: '60px', p: '2px 8px', display: 'block', mx: 'auto', '&:hover': { bgcolor: '#283593' } }} onClick={() => handleCompleteTest(execution.id)}>
                                                                    Complete
                                                                </Button>
                                                            </>
                                                        ) : (isUnlocked || isExecIncomplete) ? (
                                                            <>
                                                                <Chip label={execStatus} size="small" sx={{ height: 20, fontSize: '0.65rem', mb: 1, bgcolor: '#ffebee', color: '#c62828', borderRadius: 1 }} />
                                                                <Button variant="contained" disableElevation size="small" sx={{ bgcolor: '#1a237e', color: '#fff', fontSize: '0.7rem', minWidth: '60px', p: '2px 8px', '&:hover': { bgcolor: '#283593' } }} onClick={() => {
                                                                    if (execution?.demo_device?.id) {
                                                                        handleStartTest(step.id, execution.demo_device.id);
                                                                    }
                                                                }}>Start</Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Chip label={execStatus} size="small" sx={{ height: 20, fontSize: '0.65rem', mb: 1, bgcolor: '#f5f5f5', color: '#757575', borderRadius: 1 }} />
                                                                <Typography variant="caption" color="text.secondary" display="block">locked</Typography>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Finalize Form */}
                        <Box mt={3} pt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Finalize
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1, maxWidth: 250 }}>
                                    <Typography variant="caption" display="block" mb={0.5}>Compatibility Report PDF</Typography>
                                    <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ fontSize: '13px', width: '100%' }} />
                                    {fieldErrors.reportPdf && <Typography color="error" variant="caption" display="block">{fieldErrors.reportPdf}</Typography>}
                                </Box>
                                <Box sx={{ flex: 1, maxWidth: 200 }}>
                                    <Typography variant="caption" display="block" mb={0.5}>Decision</Typography>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)} 
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', background: '#fff' }}
                                    >
                                        <option value="technically_compatible">Technically Compatible</option>
                                        <option value="technically_not_compatible">Technically Not Compatible</option>
                                    </select>
                                </Box>
                                <Box sx={{ flex: 2 }}>
                                    <Typography variant="caption" display="block" mb={0.5}>Comment</Typography>
                                    <textarea 
                                        value={finalComment} 
                                        onChange={(e) => {
                                            setFinalComment(e.target.value);
                                            setFieldErrors((p) => { const c = { ...p }; delete c.finalComment; return c; });
                                        }} 
                                        rows={2}
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: fieldErrors.finalComment ? '1px solid red' : '1px solid #ccc', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', background: '#fff' }}
                                    />
                                    {fieldErrors.finalComment && <Typography color="error" variant="caption" display="block">{fieldErrors.finalComment}</Typography>}
                                </Box>
                            </Box>
                            
                            <Box mt={1}>
                                <Button 
                                    variant="contained"
                                    disableElevation
                                    disabled={submitting}
                                    onClick={handleConfirm}
                                    sx={{ bgcolor: '#b0bec5', color: '#fff', '&:not(:disabled)': { bgcolor: '#0d1b2a' } }}
                                >
                                    {submitting ? "Finalizing..." : "Finalize Onboarding"}
                                </Button>
                            </Box>
                            {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   COLLAPSIBLE TABLE ROW
═══════════════════════════════════════════════════ */
const RequestRow = ({ row, onMarkReceived, onConfirmReceipt, onMarkOngoing, onFinalize, onStateApprove, testBoardProgress }) => {
    const [open, setOpen] = useState(false);
    const userRole = getRole();
    const isStateAdmin = userRole === "stateadmin";

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

    // Real test board progress for ongoing_evaluation
    const tbProgress = testBoardProgress?.[row.id];

    // Compute steps display from real data
    const stepsDisplay = useMemo(() => {
        // No steps to show before testing starts
        if (statusKey === "submitted" || statusKey === "devices_received" || statusKey === "pending") {
            return null;
        }

        if (isOngoingEval && tbProgress) {
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

        // ongoing_evaluation without test board data yet
        if (isOngoingEval) {
            return {
                label: "Testing In Progress",
                pct: 0,
                pending: "Loading test progress...",
                color: "primary",
            };
        }

        return null;
    }, [statusKey, isOngoingEval, tbProgress]);

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

                {/* imei(s) */}
                <TableCell sx={{ py: 1 }}>
                    {demoDevices.length > 0 ? (
                        <Tooltip title={demoDevices.map(d => d.imei).join(", ")}>
                            <Typography variant="body2">
                                {demoDevices[0]?.imei} {demoDevices.length > 1 && <Typography component="span" variant="caption" color="primary" sx={{ cursor: 'pointer', ml: 0.5, fontWeight: 700 }}>(+{demoDevices.length - 1})</Typography>}
                            </Typography>
                        </Tooltip>
                    ) : "—"}
                </TableCell>

                {/* steps */}
                <TableCell sx={{ py: 1 }}>
                    {stepsDisplay ? (
                        <Stack spacing={1} sx={{ minWidth: 200, py: 1 }}>
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
                        <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                </TableCell>

                {/* status */}
                {!isStateAdmin && <TableCell sx={{ py: 1 }}><StatusChip status={row.status} /></TableCell>}

                {/* actions */}
                <TableCell sx={{ py: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap">
                        {isSubmitted && !isStateAdmin && (
                            <Tooltip title="Accept & Confirm Receipt of Devices">
                                <Button
                                    size="small" variant="contained" color="success"
                                    startIcon={<CheckCircleIcon fontSize="small" />}
                                    onClick={() => onConfirmReceipt(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Accept
                                </Button>
                            </Tooltip>
                        )}
                        {statusKey === "devices_received" && !isStateAdmin && (
                            <Tooltip title="Start Testing">
                                <Button
                                    size="small" variant="contained" color="info"
                                    startIcon={<PlayCircleOutlineIcon fontSize="small" />}
                                    onClick={() => onMarkOngoing(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Start Testing
                                </Button>
                            </Tooltip>
                        )}
                        {isOngoingEval && !isStateAdmin && (
                            <Tooltip title="Complete Testing & Finalize">
                                <Button
                                    size="small" variant="contained" color="primary"
                                    startIcon={<GavelIcon fontSize="small" />}
                                    onClick={() => onFinalize(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Complete Testing &amp; Finalize
                                </Button>
                            </Tooltip>
                        )}
                        {isStateAdmin && (statusKey === "technically_compatible" || statusKey === "accepted" || statusKey === "approved" || statusKey === "allow to login") && (
                            <Tooltip title="State Admin Final Approval">
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon fontSize="small" />}
                                    onClick={() => onStateApprove(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Approve Technical Onboarding
                                </Button>
                            </Tooltip>
                        )}
                        {isStateAdmin && (statusKey === "technicalonboardingapproved" || statusKey === "stateadminapproved" || statusKey === "active" || statusKey === "allow to add dealer") && (
                            <Typography variant="caption" sx={{ color: "green", fontWeight: "bold", px: 1 }}>
                                Manufacturer Active
                            </Typography>
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
                            <Tooltip title="Has compatibility test findings">
                                <CommentIcon fontSize="small" color="primary" />
                            </Tooltip>
                        ) : null}
                    </Stack>
                </TableCell>
            </TableRow>

            {/* ── expanded detail ── */}
            <TableRow>
                <TableCell colSpan={8} sx={{ py: 0, bgcolor: "primary.50" }}>
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
                                                ["Type", row.manufacturer_type || row.type || row.manufacturer?.manufacturer_type || row.manufacturer_info?.manufacturer_type || row.manufacturer_info?.type || "—"],
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
                                                            label="View / Print"
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

                                {/* Compatibility Test Findings */}
                                {hasReport && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "primary.light", bgcolor: "primary.50" }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <CommentIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Compatibility Test Findings</Typography>
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
const DeviceModelTechnicalOnboardingAdminList = ({ mfrType, title }) => {
    const userRole = getRole();
    const isStateAdmin = userRole === "stateadmin";
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [testBoardProgress, setTestBoardProgress] = useState({});

    /* dialog state */
    const [ongoingDialog, setOngoingDialog] = useState({ open: false, row: null });
    const [finalizeDialog, setFinalizeDialog] = useState({ open: false, row: null });
    const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

    const handleStateApprove = async (row) => {
        const mfrObj = row.manufacturer || row.manufacturer_info || row.created_by_info || {};
        const mfrId = mfrObj.id || row.manufacturer_id || row.created_by || row.submitted_by;

        if (!mfrId) {
            setActionMsg({ type: "error", text: "Could not identify manufacturer ID." });
            return;
        }

        setLoading(true);
        try {
            await ManufacturerServices.approveTechOnboarding({
                manufacturer_id: mfrId,
                model_id: row.model_id || row.device_model?.id || row.device_model_id,
                techonboardingrequest_id: row.id || row.techonboardingrequest_id,
                action: "approve"
            });
            setActionMsg({ type: "success", text: "Technical Onboarding approved successfully by State Admin!" });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
        } finally {
            setLoading(false);
        }
    };

    const loadData = useCallback(async () => {
        setError(""); setLoading(true);
        try {
            const role = getRole();
            if (role === "stateadmin") {
                const res = await ManufacturerServices.filterTechOnboardManufacturers({});
                const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
                const flattened = [];
                data.forEach((item) => {
                    const nestedModels = Array.isArray(item.tech_onboarded_models) ? item.tech_onboarded_models : [];
                    if (nestedModels.length > 0) {
                        nestedModels.forEach((model) => {
                            flattened.push({
                                ...item,
                                ...model,
                                manufacturer_info: item,
                                device_model: model,
                                manufacturer_id: item.id,
                                model_id: model.id,
                                id: model.id ?? item.id,
                            });
                        });
                    } else {
                        flattened.push({
                            ...item,
                            manufacturer_info: item.manufacturer || item.manufacturer_info || item,
                            device_model: item.device_model || item,
                            manufacturer_id: item.manufacturer?.id || item.manufacturer_id || item.id,
                            model_id: item.device_model?.id || item.model_id || item.id,
                            id: item.id,
                        });
                    }
                });
                setRows(flattened);
            } else {
                const res = await DeviceModelServices.listSuperadminTechnicalOnboardingRequests({});
                const data = res?.data;
                if (Array.isArray(data)) setRows(data);
                else if (Array.isArray(data?.results)) setRows(data.results);
                else if (Array.isArray(data?.data)) setRows(data.data);
                else setRows([]);
            }
        } catch (err) {
            setError(extractError(err) || "Failed to load technical onboarding requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── fetch test board progress for ongoing rows ── */
    useEffect(() => {
        const ongoingRows = rows.filter(r => String(r.status ?? "").trim().toLowerCase() === "ongoing_evaluation");
        if (ongoingRows.length === 0) return;

        const fetchProgress = async () => {
            const progressMap = {};
            await Promise.all(
                ongoingRows.map(async (r) => {
                    try {
                        const res = await DeviceModelServices.getTestBoard({ onboarding_request_id: r.id });
                        let categories = [];
                        if (Array.isArray(res?.data)) categories = res.data;
                        else if (res?.data?.rows) categories = res.data.rows;
                        else if (res?.data?.categories) categories = res.data.categories;

                        const total = categories.length;
                        // A test is completed when ALL its executions are pass/completed
                        const completed = categories.filter(cat =>
                            cat.executions && cat.executions.length > 0 &&
                            cat.executions.every(e => e.status === "pass" || e.status === "completed")
                        ).length;

                        // Find the first incomplete test name
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

    /* ── optimistic update helpers ── */
    const patchRow = useCallback((id, patch) => {
        setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
    }, []);

    const handleMarkOngoingSuccess = useCallback((id) => {
        setOngoingDialog({ open: false, row: null });
        loadData();
        setActionMsg({ type: "success", text: `Request #${id} marked as Ongoing Evaluation.` });
    }, [loadData]);

    const handleFinalizeSuccess = useCallback((id, decision) => {
        setFinalizeDialog({ open: false, row: null });
        loadData();
        setActionMsg({
            type: decision === "technically_compatible" ? "success" : "warning",
            text: `Request #${id} has been ${decision === "technically_compatible" ? "marked as Compatible ✓" : "marked as Not Compatible"}.`,
        });
    }, [loadData]);

    const handleMarkReceived = async (row) => {
        if (!window.confirm("Confirm that you have physically received all 5 VLTD devices for this request?")) return;
        setLoading(true);
        try {
            await DeviceModelServices.markTechnicalOnboardingDevicesReceived({ onboarding_request_id: row.id });
            setActionMsg({ type: "success", text: `Request #${row.id} marked as devices received.` });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
            setLoading(false);
        }
    };

    const handleConfirmReceipt = async (row) => {
        if (!window.confirm("Accept this technical onboarding request?")) return;
        setLoading(true);
        try {
            await DeviceModelServices.confirmReceipt({
                onboarding_request_id: row.id,
            });
            setActionMsg({ type: "success", text: `Request #${row.id} accepted successfully.` });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
            setLoading(false);
        }
    };

    /* ── search ── */
    const filteredRows = useMemo(() => {
        let items = rows;
        if (mfrType) {
            items = items.filter((r) => {
                const mfrObj = r.manufacturer || r.manufacturer_info || r.created_by_info || {};
                return mfrObj.manufacturer_type === mfrType;
            });
        }
        if (!search.trim()) return items;
        const q = search.trim().toLowerCase();
        return items.filter((r) => {
            const mfr = resolveManufacturer(r).toLowerCase();
            const model = (r.device_model?.model_name || r.device_model_name || "").toLowerCase();
            const status = (r.status || "").toLowerCase();
            const tac = (r.device_model?.tac_no || "").toLowerCase();
            return mfr.includes(q) || model.includes(q) || status.includes(q) || tac.includes(q);
        });
    }, [rows, search, mfrType]);

    /* ── stats ── */
    const stats = useMemo(() => {
        const count = (s) => rows.filter((r) => String(r.status ?? "").trim().toLowerCase() === s).length;
        return {
            total: rows.length,
            submitted: count("submitted"),
            ongoing: count("ongoing_evaluation"),
            accepted: count("technically_compatible") + count("stateadminapproved") + count("accepted") + count("approved"),
            rejected: count("technically_not_compatible") + count("stateadminrejected") + count("rejected"),
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
                                    <Typography variant="h4" fontWeight={700}>{title || "Technical Onboarding Requests"}</Typography>
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
                        {!isStateAdmin && (
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                Admin view of all technical onboarding requests. Use <strong>Mark Ongoing</strong> on{" "}
                                <em>Submitted</em> requests to start evaluation, then <strong>Finalize</strong> on{" "}
                                <em>Ongoing Evaluation</em> requests to accept or reject.
                            </Typography>
                        )}

                        {/* ── Action feedback ── */}
                        {actionMsg.text && (
                            <Alert severity={actionMsg.type || "success"} onClose={() => setActionMsg({ type: "", text: "" })} sx={{ mb: 2 }}>
                                {actionMsg.text}
                            </Alert>
                        )}

                        {/* ── Stats ── */}
                        {rows.length > 0 && !isStateAdmin && (
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
                                                    <TableCell sx={{ color: "white", fontWeight: 700 }}>IMEI(s)</TableCell>
                                                    <TableCell sx={{ color: "white", fontWeight: 700 }}>STEPS</TableCell>
                                                    {!isStateAdmin && <TableCell sx={{ color: "white", fontWeight: 700 }}>Status</TableCell>}
                                                    <TableCell sx={{ color: "white", fontWeight: 700 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {paginatedRows.map((row, idx) => (
                                                    <RequestRow
                                                        key={row.id ?? idx}
                                                        row={row}
                                                        onMarkReceived={handleMarkReceived}
                                                        onConfirmReceipt={handleConfirmReceipt}
                                                        onMarkOngoing={(r) => setOngoingDialog({ open: true, row: r })}
                                                        onFinalize={(r) => setFinalizeDialog({ open: true, row: r })}
                                                        onStateApprove={handleStateApprove}
                                                        testBoardProgress={testBoardProgress}
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
