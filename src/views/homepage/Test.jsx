import React from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Test() {
  const navigate = useNavigate();

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Test Page
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This is a test route.
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/")}>Back to Home</Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Test;
