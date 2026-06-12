import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/material";
import {
  Timeline as TimelineIcon,
  CheckCircle,
  Error,
  HourglassEmpty,
  Cancel,
  FiberNew,
  Comment,
} from "@mui/icons-material";
import HelpDeskService from "../../services/helpDeskServices";
import { useLocation } from "react-router-dom";

const STATUS_CONFIG = {
  created: { label: "Created", color: "default" },
  in_review: { label: "In Review", color: "info" },
  pending: { label: "Pending", color: "warning" },
  closed: { label: "Closed", color: "success" },
  canceled: { label: "Canceled", color: "error" },
};

const ACTION_ICON = {
  created: <FiberNew fontSize="small" />,
  status_change: <HourglassEmpty fontSize="small" />,
  comment: <Comment fontSize="small" />,
};

const ACTION_LABEL = {
  created: "Ticket Submitted",
  status_change: "Status Updated",
  comment: "Note Added",
};

const PublicTracker = () => {
  const location = useLocation();
  const [ticketRef, setTicketRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) {
      setTicketRef(ref.toUpperCase());
      handleLookup(ref.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (ref) => {
    const query = (ref || ticketRef).trim().toUpperCase();
    if (!query) return;
    setLoading(true);
    setError("");
    setTicket(null);
    const response = await HelpDeskService.trackTicket(query);
    if (response.success) {
      setTicket(response.data);
    } else {
      setError(response.message || "No ticket found with this reference number.");
    }
    setLoading(false);
  };

  const statusCfg = ticket ? STATUS_CONFIG[ticket.status] || { label: ticket.status, color: "default" } : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Track Your Complaint
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" mb={4}>
            Enter your ticket reference number to check the current status.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
            <TextField
              fullWidth
              label="Ticket Reference Number (e.g. TKT-2026-00001)"
              value={ticketRef}
              onChange={(e) => setTicketRef(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => handleLookup()}
              disabled={loading}
              sx={{ minWidth: 120, whiteSpace: "nowrap" }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Track"}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {ticket && (
            <Box>
              <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Reference No.
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {ticket.ticket_ref}
                    </Typography>
                  </Box>
                  <Chip
                    label={statusCfg.label}
                    color={statusCfg.color}
                    sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                  />
                </Stack>

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {ticket.title}
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mt={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date Filed
                    </Typography>
                    <Typography variant="body2">{ticket.entry_date}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(ticket.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                {ticket.solution && (
                  <Box mt={2} p={2} bgcolor="#f0fdf4" borderRadius={1}>
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      Resolution
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                      {ticket.solution}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {ticket.activities && ticket.activities.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TimelineIcon fontSize="small" /> Activity Timeline
                  </Typography>
                  <Box sx={{ pl: 1 }}>
                    {ticket.activities.map((activity, index) => (
                      <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "primary.light",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "primary.main",
                              flexShrink: 0,
                            }}
                          >
                            {ACTION_ICON[activity.action_type] || <HourglassEmpty fontSize="small" />}
                          </Box>
                          {index < ticket.activities.length - 1 && (
                            <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.5 }} />
                          )}
                        </Box>
                        <Box pb={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {ACTION_LABEL[activity.action_type] || activity.action_type}
                            {activity.new_value && activity.action_type === "status_change" && (
                              <Chip
                                label={STATUS_CONFIG[activity.new_value]?.label || activity.new_value}
                                color={STATUS_CONFIG[activity.new_value]?.color || "default"}
                                size="small"
                                sx={{ ml: 1, fontSize: "0.7rem" }}
                              />
                            )}
                          </Typography>
                          {activity.comment && (
                            <Typography variant="body2" color="text.secondary" mt={0.25}>
                              {activity.comment}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.disabled">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicTracker;
