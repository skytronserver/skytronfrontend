import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useLocation, useNavigate } from "react-router-dom";

const ComplaintSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketRef = location.state?.ticketRef;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f6f8",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 5, borderRadius: 4, textAlign: "center" }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Complaint Submitted Successfully
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Thank you for submitting your complaint. Your reference number is:
          </Typography>

          <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 2 }}>
            {ticketRef}
          </Typography>

          <Typography variant="body2" sx={{ mb: 4, color: "text.secondary" }}>
            Save this reference number to track the status of your complaint at any time.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() =>
                navigate(`/complaint/track?ref=${ticketRef}`)
              }
            >
              Track My Complaint
            </Button>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ComplaintSuccess;
