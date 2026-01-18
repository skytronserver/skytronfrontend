import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import PublicRegistrationMockService from "../../services/PublicRegistrationMockService";

const RegistrationStatusTracker = () => {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;
    setReferenceNumber(ref);
  }, []);

  const paperStyle = useMemo(
    () => ({
      p: 3,
      backdropFilter: "blur(5px)",
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    }),
    []
  );

  const handleSearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");
    setResult(null);

    const ref = referenceNumber.trim();
    if (!ref) {
      setErrorMessage("Please enter a reference number.");
      return;
    }

    const req = PublicRegistrationMockService.getRequestByReference(ref);
    if (!req) {
      setErrorMessage("No registration request found for this reference number.");
      return;
    }

    setResult(req);
  };

  useEffect(() => {
    if (!referenceNumber) return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;
    if (ref !== referenceNumber) return;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceNumber]);

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={7}>
          <Paper sx={paperStyle}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#800080" }}
            >
              Track Registration Status
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Reference Number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. SKY-REG-20260116-1234"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    sx={{
                      backgroundColor: "#800080",
                      "&:hover": { backgroundColor: "#660066" },
                      py: 1.5,
                    }}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {result && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Request Summary
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Reference:</strong> {result.referenceNumber}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Role:</strong> {result.role}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Current Status:</strong> {result.currentStatus}
                </Typography>

                {result.remarks ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {result.remarks}
                  </Alert>
                ) : null}

                {result.credentials ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Username:</strong> {result.credentials.username}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Password:</strong> {result.credentials.password}
                    </Typography>
                  </Alert>
                ) : null}

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Status History
                </Typography>
                <List dense>
                  {(result.statusHistory || []).map((s, idx) => (
                    <ListItem key={`${s.at}-${idx}`} divider>
                      <ListItemText
                        primary={s.message}
                        secondary={new Date(s.at).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => (window.location.href = "/")}
                    sx={{
                      borderColor: "#800080",
                      color: "#800080",
                      "&:hover": { borderColor: "#660066", color: "#660066" },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RegistrationStatusTracker;
