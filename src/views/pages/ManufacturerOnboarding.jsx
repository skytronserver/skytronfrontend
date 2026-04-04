import React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const ManufacturerOnboarding = () => {
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#800080" }}>
              Manufacturer Onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mock onboarding details for manufacturer integration.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              A) Technical Document (Confidential)
            </Typography>
            <Alert severity="info" sx={{ mb: 1 }}>
              This is a mock section. Replace with your actual API integration document link.
            </Alert>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#800080",
                color: "#800080",
                "&:hover": { borderColor: "#660066", color: "#660066" },
              }}
              onClick={() => {
                window.open("/docs/TechnicalOnboarding.pdf", "_blank");
              }}
            >
              Open Technical Document
            </Button>
          </Box>

          {/* B) Integration Checklist */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              B) Test Device &amp; Integration Checklist
            </Typography>
            <Alert severity="success" icon={false} sx={{ mb: 1 }}>
              <Typography variant="body2">
                1) Login credentials received
              </Typography>
              <Typography variant="body2">
                2) API integration completed on UAT
              </Typography>
              <Typography variant="body2">
                3) Test device shared / arranged
              </Typography>
              <Typography variant="body2">
                4) Functionality &amp; integration verified on platform
              </Typography>
            </Alert>
            <Alert severity="info">
              This is mock content. If you want, I can make this checklist dynamic (status tracking) later.
            </Alert>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ManufacturerOnboarding;
