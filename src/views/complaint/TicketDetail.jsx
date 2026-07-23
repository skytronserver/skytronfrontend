import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate, useParams } from "react-router-dom";
import { gridSpacing } from "../../store/constant";
import HelpDeskService from "../../services/helpDeskServices";
import ManufacturerServices from "../../services/ManufacturerServices";
import {
  STATUS_CONFIG,
  ESCALATION_CONFIG,
  SOURCE_LABELS,
  ALLOWED_TRANSITIONS,
  ROLE_ESCALATION_TARGETS,
  getRoleFromCookie,
  formatDateTime,
} from "./complaintUtils";

const ACTIVITY_LABELS = {
  created: "Ticket Created",
  status_change: "Status Changed",
  comment: "Comment Added",
  final_report: "Final Report Submitted",
  attachment: "File Attached",
  escalation: "Ticket Escalated",
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = getRoleFromCookie();
  const isManufacturer = userRole === "devicemanufacture";
  const allowedEscalationTargets = ROLE_ESCALATION_TARGETS[userRole] || [];

  const [ticket, setTicket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Status update form
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [solution, setSolution] = useState("");

  // Comment form
  const [comment, setComment] = useState("");

  // Final report form
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState(null);

  // Escalation dialog
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateTo, setEscalateTo] = useState("");
  const [escalateComment, setEscalateComment] = useState("");
  const [manufacturerList, setManufacturerList] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [mfrLoading, setMfrLoading] = useState(false);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    const [ticketRes, activityRes] = await Promise.all([
      HelpDeskService.getComplaintById(id),
      HelpDeskService.getActivityLog(id),
    ]);
    if (ticketRes.success) setTicket(ticketRes.data);
    else setAlert({ type: "error", message: ticketRes.message });
    if (activityRes.success) setActivities(activityRes.data.activities || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 5000);
  };

  // Status update
  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setActionLoading(true);
    const payload = { status: newStatus };
    if (statusComment) payload.comment = statusComment;
    if (newStatus === "closed" && solution) payload.solution = solution;
    const response = await HelpDeskService.updateStatus(id, payload);
    if (response.success) {
      showAlert("success", `Status updated to ${newStatus}`);
      setNewStatus("");
      setStatusComment("");
      setSolution("");
      await loadTicket();
    } else {
      showAlert("error", response.message);
    }
    setActionLoading(false);
  };

  // Add comment
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setActionLoading(true);
    const response = await HelpDeskService.addComment(id, { comment });
    if (response.success) {
      showAlert("success", "Comment added");
      setComment("");
      await loadTicket();
    } else {
      showAlert("error", response.message);
    }
    setActionLoading(false);
  };

  // Final report
  const handleFinalReport = async () => {
    if (!reportText.trim() && !reportFile) {
      showAlert("error", "Provide solution text and/or a report file.");
      return;
    }
    setActionLoading(true);
    const fd = new FormData();
    if (reportText) fd.append("solution", reportText);
    if (reportFile) fd.append("final_report", reportFile);
    const response = await HelpDeskService.submitFinalReport(id, fd);
    if (response.success) {
      showAlert("success", "Final report submitted");
      setReportText("");
      setReportFile(null);
      await loadTicket();
    } else {
      showAlert("error", response.message);
    }
    setActionLoading(false);
  };

  // Open escalation dialog
  const openEscalate = async () => {
    setEscalateOpen(true);
    setEscalateTo("");
    setSelectedManufacturer("");
    setEscalateComment("");
  };

  const handleEscalateToChange = async (target) => {
    setEscalateTo(target);
    setSelectedManufacturer("");
    if (target === "manufacturer" && manufacturerList.length === 0) {
      setMfrLoading(true);
      try {
        const res = await ManufacturerServices.findManufacturer();
        setManufacturerList(Array.isArray(res.data) ? res.data : []);
      } catch {
        setManufacturerList([]);
      }
      setMfrLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateTo) return;
    if (escalateTo === "manufacturer" && !selectedManufacturer) {
      showAlert("error", "Please select a manufacturer.");
      return;
    }
    setActionLoading(true);
    const payload = { escalate_to: escalateTo };
    if (escalateTo === "manufacturer") payload.manufacturer_id = parseInt(selectedManufacturer);
    if (escalateComment) payload.comment = escalateComment;
    const response = await HelpDeskService.escalateTicket(id, payload);
    if (response.success) {
      showAlert("success", "Ticket escalated successfully");
      setEscalateOpen(false);
      await loadTicket();
    } else {
      showAlert("error", response.message);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard>
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  if (!ticket) return null;

  const isClosed = ticket.status === "closed" || ticket.status === "canceled";
  const validNextStatuses = ALLOWED_TRANSITIONS[ticket.status] || [];
  const statusCfg = STATUS_CONFIG[ticket.status] || { label: ticket.status, color: "default" };
  const escalationCfg = ticket.escalated_to ? ESCALATION_CONFIG[ticket.escalated_to] : null;

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <MainCard
          title={
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography variant="h5" fontWeight={700}>{ticket.ticket_ref}</Typography>
              <Chip label={statusCfg.label} color={statusCfg.color} size="small" />
              {escalationCfg && (
                <Chip label={`↑ ${escalationCfg.label}`} color={escalationCfg.color} size="small" />
              )}
              <Typography variant="body2" color="text.secondary">
                {SOURCE_LABELS[ticket.source] || ticket.source}
              </Typography>
            </Box>
          }
          secondary={
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadTicket}><RefreshIcon /></IconButton>
              </Tooltip>
              <Button startIcon={<ArrowBackIcon />} size="small" onClick={() => navigate(-1)}>
                Back
              </Button>
            </Box>
          }
        >
          {alert.message && (
            <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert({ type: "", message: "" })}>
              {alert.message}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left column: ticket info */}
            <Grid item xs={12} md={7}>
              {/* Applicant info */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                  APPLICANT INFORMATION
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Name</Typography><Typography>{ticket.applicant_name}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{ticket.applicant_phone}</Typography></Grid>
                  {ticket.applicant_email && (
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{ticket.applicant_email}</Typography></Grid>
                  )}
                </Grid>
              </Paper>

              {/* Complaint details */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                  COMPLAINT DETAILS
                </Typography>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>{ticket.title}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{ticket.details}</Typography>
                <Box mt={1} display="flex" gap={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Filed</Typography>
                    <Typography variant="body2">{ticket.entry_date}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body2">{formatDateTime(ticket.updated_at)}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Device info (if linked) */}
              {ticket.device_stock && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                    LINKED DEVICE
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">IMEI</Typography><Typography>{ticket.device_stock.imei}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">ESN</Typography><Typography>{ticket.device_stock.device_esn}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Model</Typography><Typography>{ticket.device_stock.model_name}</Typography></Grid>
                  </Grid>
                </Paper>
              )}

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                    ATTACHMENTS
                  </Typography>
                  <List dense>
                    {ticket.attachments.map((att) => (
                      <ListItem key={att.id}>
                        <ListItemText
                          primary={att.file_name}
                          secondary={formatDateTime(att.uploaded_at)}
                        />
                        <Button size="small" variant="outlined" href={`${process.env.REACT_APP_BASE_URL}files/${att.file_path}`} target="_blank" rel="noreferrer">
                          View
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {/* Solution / Final report */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                  SOLUTION / FINAL REPORT
                </Typography>
                {ticket.solution ? (
                  <Box mb={1} p={1.5} bgcolor="#f0fdf4" borderRadius={1}>
                    <Typography variant="body2">{ticket.solution}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled">No resolution submitted yet.</Typography>
                )}
                {ticket.final_report_file && (
                  <Button size="small" variant="outlined" href={`${process.env.REACT_APP_BASE_URL}files/${ticket.final_report_file}`} target="_blank" rel="noreferrer" sx={{ mt: 1 }}>
                    Download Final Report
                  </Button>
                )}
              </Paper>
            </Grid>

            {/* Right column: actions + activity */}
            <Grid item xs={12} md={5}>
              {/* Action panel — hidden for manufacturer (read-only) */}
              {!isManufacturer && (
                <>
                  {/* Status update */}
                  {!isClosed && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
                        UPDATE STATUS
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        label="New Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        size="small"
                        sx={{ mb: 1.5 }}
                      >
                        {validNextStatuses.map((s) => (
                          <MenuItem key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Note (optional)"
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        size="small"
                        sx={{ mb: 1.5 }}
                      />
                      {newStatus === "closed" && (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Resolution Summary"
                          value={solution}
                          onChange={(e) => setSolution(e.target.value)}
                          size="small"
                          sx={{ mb: 1.5 }}
                        />
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        disabled={!newStatus || actionLoading}
                        onClick={handleStatusUpdate}
                      >
                        {actionLoading ? <CircularProgress size={18} color="inherit" /> : "Update Status"}
                      </Button>
                    </Paper>
                  )}

                  {/* Escalate */}
                  {!isClosed && allowedEscalationTargets.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                        ESCALATION
                      </Typography>
                      {ticket.escalated_to ? (
                        <Box mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Currently escalated to:{" "}
                            <Chip
                              label={ESCALATION_CONFIG[ticket.escalated_to]?.label || ticket.escalated_to}
                              color={ESCALATION_CONFIG[ticket.escalated_to]?.color || "default"}
                              size="small"
                            />
                            {ticket.escalated_to === "manufacturer" && ticket.escalated_to_manufacturer && (
                              <Typography variant="caption" display="block" mt={0.5}>
                                {ticket.escalated_to_manufacturer.company_name}
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      ) : null}
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={openEscalate}
                        color="inherit"
                        sx={{ color: 'text.secondary', borderColor: 'text.secondary' }}
                      >
                        {ticket.escalated_to ? "Re-Escalate" : "Escalate Ticket"}
                      </Button>
                    </Paper>
                  )}

                  {/* Add comment */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
                      ADD INTERNAL NOTE
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      size="small"
                      sx={{ mb: 1.5 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      disabled={!comment.trim() || actionLoading}
                      onClick={handleAddComment}
                    >
                      Add Comment
                    </Button>
                  </Paper>

                  {/* Final report */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
                      SUBMIT FINAL REPORT
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Resolution Text"
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      size="small"
                      sx={{ mb: 1.5 }}
                    />
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      size="small"
                      sx={{ mb: 1, textTransform: "none", display: "block" }}
                    >
                      {reportFile ? reportFile.name : "Attach Report File (optional)"}
                      <input
                        hidden
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx"
                        onChange={(e) => setReportFile(e.target.files[0] || null)}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      disabled={(!reportText.trim() && !reportFile) || actionLoading}
                      onClick={handleFinalReport}
                      color="success"
                    >
                      Submit Report
                    </Button>
                  </Paper>
                </>
              )}

              {/* Activity timeline */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
                  ACTIVITY TRAIL
                </Typography>
                {activities.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">No activity yet.</Typography>
                ) : (
                  activities.map((act, i) => (
                    <Box key={act.id} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", mt: "5px", flexShrink: 0 }} />
                        {i < activities.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.25 }} />}
                      </Box>
                      <Box pb={1.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {ACTIVITY_LABELS[act.action_type] || act.action_type}
                          {act.action_type === "status_change" && act.old_value && (
                            <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                              {` ${act.old_value} → ${act.new_value}`}
                            </Typography>
                          )}
                          {act.action_type === "escalation" && act.new_value && (
                            <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                              {` → ${act.new_value}`}
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{act.actor_name}</Typography>
                        {act.comment && (
                          <Typography variant="body2" mt={0.25} sx={{ bgcolor: "#f5f5f5", p: 0.75, borderRadius: 1 }}>
                            {act.comment}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.disabled" display="block">
                          {formatDateTime(act.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Escalation Dialog */}
      <Dialog open={escalateOpen} onClose={() => setEscalateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Escalate Ticket</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Escalate To"
            value={escalateTo}
            onChange={(e) => handleEscalateToChange(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          >
            {allowedEscalationTargets.map((t) => (
              <MenuItem key={t} value={t}>{ESCALATION_CONFIG[t]?.label || t}</MenuItem>
            ))}
          </TextField>

          {escalateTo === "manufacturer" && (
            <TextField
              select
              fullWidth
              label="Select Manufacturer"
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              sx={{ mb: 2 }}
              disabled={mfrLoading}
              InputProps={{ endAdornment: mfrLoading ? <CircularProgress size={16} /> : null }}
            >
              {manufacturerList.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.company_name || m.name || `Manufacturer #${m.id}`}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason / Comment (optional)"
            value={escalateComment}
            onChange={(e) => setEscalateComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={!escalateTo || (escalateTo === "manufacturer" && !selectedManufacturer) || actionLoading}
            onClick={handleEscalate}
          >
            {actionLoading ? <CircularProgress size={18} color="inherit" /> : "Escalate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default TicketDetail;
