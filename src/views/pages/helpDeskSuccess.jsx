import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
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
        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          <CheckCircleIcon
            color="success"
            sx={{
              fontSize: 80,
              mb: 2,
            }}
          />

          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
          >
            Complaint Submitted Successfully
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "text.secondary",
            }}
          >
            Thank you very much for submitting the help ticket.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Your Reference No. is
          </Typography>

          <Typography
            variant="h4"
            color="primary"
            fontWeight={700}
            sx={{ mb: 3 }}
          >
            {ticketRef}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
            }}
          >
            Please use this reference number for further
            communication and tracking of your complaint.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ComplaintSuccess;