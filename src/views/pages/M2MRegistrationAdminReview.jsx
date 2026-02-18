import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PublicRegistrationMockService from "../../services/PublicRegistrationMockService";

const isApproved = (req) =>
  (req.currentStatus || "").toLowerCase().includes("user created");

const isRejected = (req) =>
  (req.currentStatus || "").toLowerCase().includes("rejected");

const getStatusChip = (req) => {
  if (isApproved(req)) return <Chip label="Approved" color="success" size="small" />;
  if (isRejected(req)) return <Chip label="Rejected" color="error" size="small" />;
  return <Chip label="Pending" color="warning" size="small" />;
};

const M2MRegistrationAdminReview = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [remarksByRef, setRemarksByRef] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const paperStyle = useMemo(
    () => ({
      p: 3,
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    }),
    []
  );

  const requests = useMemo(() => {
    void refreshKey;
    return PublicRegistrationMockService.listRequests().filter(
      (r) => (r.role || "") === "M2M Service Provider"
    );
  }, [refreshKey]);

  const handleApprove = (referenceNumber) => {
    setErrorMessage("");
    setInfoMessage("");
    try {
      PublicRegistrationMockService.approveRequest(referenceNumber);
      setInfoMessage("Request approved and credentials generated.");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setErrorMessage(e?.message || "Failed to approve request.");
    }
  };

  const handleReject = (referenceNumber) => {
    setErrorMessage("");
    setInfoMessage("");
    const remarks = (remarksByRef[referenceNumber] || "").trim();
    if (!remarks) {
      setErrorMessage("Please enter rejection remarks.");
      return;
    }

    try {
      PublicRegistrationMockService.rejectRequest(referenceNumber, remarks);
      setInfoMessage("Request rejected with remarks.");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setErrorMessage(e?.message || "Failed to reject request.");
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={10} lg={9}>
          <Paper sx={paperStyle}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#800080" }}>
                  M2M Service Provider Registration Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approve or reject requests submitted from the public registration form.
                </Typography>
              </Box>
            </Stack>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            {infoMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {infoMessage}
              </Alert>
            )}

            {requests.length === 0 ? (
              <Alert severity="info">No M2M registration requests found.</Alert>
            ) : (
              <Stack spacing={2}>
                {requests.map((req) => (
                  <Paper key={req.referenceNumber} variant="outlined" sx={{ p: 2 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {req.referenceNumber} {getStatusChip(req)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Applicant:</strong> {req.applicant?.name || "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {req.applicant?.email || "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Mobile:</strong> {req.applicant?.mobile || "-"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Organisation:</strong> {req.organization?.name || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Current Status:</strong> {req.currentStatus}
                        </Typography>
                        {req.remarks ? (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            {req.remarks}
                          </Alert>
                        ) : null}
                        {req.credentials ? (
                          <Alert severity="success" sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Username:</strong> {req.credentials.username}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Password:</strong> {req.credentials.password}
                            </Typography>
                          </Alert>
                        ) : null}
                      </Box>

                      <Box sx={{ minWidth: { sm: 320 } }}>
                        <Stack spacing={1}>
                          <Button
                            variant="contained"
                            disabled={isApproved(req) || isRejected(req)}
                            onClick={() => handleApprove(req.referenceNumber)}
                            sx={{
                              backgroundColor: "#800080",
                              "&:hover": { backgroundColor: "#660066" },
                            }}
                          >
                            Approve
                          </Button>
                          <Divider />
                          <TextField
                            label="Rejection Remarks"
                            multiline
                            minRows={2}
                            value={remarksByRef[req.referenceNumber] || ""}
                            onChange={(e) =>
                              setRemarksByRef((prev) => ({
                                ...prev,
                                [req.referenceNumber]: e.target.value,
                              }))
                            }
                            disabled={isApproved(req) || isRejected(req)}
                          />
                          <Button
                            variant="outlined"
                            disabled={isApproved(req) || isRejected(req)}
                            onClick={() => handleReject(req.referenceNumber)}
                            sx={{
                              borderColor: "#800080",
                              color: "#800080",
                              "&:hover": {
                                borderColor: "#660066",
                                color: "#660066",
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default M2MRegistrationAdminReview;
