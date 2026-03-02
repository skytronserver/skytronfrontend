import React, { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LoginIcon from "@mui/icons-material/Login";
import BusinessIcon from "@mui/icons-material/Business";
import RouterIcon from "@mui/icons-material/Router";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DevicesIcon from "@mui/icons-material/Devices";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import skytronlogo from "../../assets/images/skytron-logo2.png";
import "./registrationForm.css";

const ROLE_OPTIONS = [
  { value: "M2M Service Provider", label: "M2M Service Provider", icon: <RouterIcon fontSize="small" /> },
  { value: "Vehicle Manufacturer (Factory Fitted AIS-140 Device)", label: "Vehicle Manufacturer (Factory Fitted AIS-140 Device)", icon: <DirectionsBusIcon fontSize="small" /> },
  { value: "AIS-140 Device Manufacturer (Retrofitted AIS-140 Device)", label: "AIS-140 Device Manufacturer (Retrofitted AIS-140 Device)", icon: <DevicesIcon fontSize="small" /> },
  { value: "School Administrator", label: "School Administrator", icon: <BusinessIcon fontSize="small" /> },
  { value: "Others", label: "Others", icon: <HelpOutlineIcon fontSize="small" /> },
];

const UserRegistrationRequest = () => {
  const [selectedRole, setSelectedRole] = useState("");

  const navigateToRole = () => {
    if (!selectedRole) return;
    const roleSlugMap = {
      "M2M Service Provider": "m2m-service-provider",
      "Vehicle Manufacturer (Factory Fitted AIS-140 Device)": "vehicle-manufacturer",
      "AIS-140 Device Manufacturer (Retrofitted AIS-140 Device)": "ais-140-device-manufacturer",
      "School Administrator": "school-administrator",
      "Others": "others",
    };
    const slug = roleSlugMap[selectedRole];
    if (!slug) return;
    window.location.href = `/user-registration-request/${slug}`;
  };

  return (
    /* Full-width centering wrapper — same pattern as UserRegistrationForm */
    <Box
      className="reg-form-wrapper"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        px: { xs: 2, sm: 6, md: 16, lg: 28, xl: 36 },
        py: { xs: 4, sm: 6 },
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(128,0,128,0.13), 0 2px 8px rgba(0,0,0,0.08)",
          p: 0,
        }}
      >
        {/* ── Header Banner ── */}
        <Box className="reg-header-banner">
          <img src={skytronlogo} alt="Skytron Logo" className="reg-logo-img" />
          <span className="reg-brand-name">SKYTRON</span>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
            <HowToRegIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.92)", mb: 0.5 }} />
          </Box>
          <Typography className="reg-form-title">Account Registration</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "13px", mt: 0.5 }}>
            Select your user type to get started
          </Typography>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 3.5 }}>

          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#800080",
              mb: 1.5,
            }}
          >
            Select User Type
          </Typography>

          <FormControl
            fullWidth
            variant="outlined"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                background: "rgba(255,255,255,0.75)",
                "&:hover fieldset": { borderColor: "#9c27b0" },
                "&.Mui-focused fieldset": { borderColor: "#800080", borderWidth: "2px" },
              },
              "& label.Mui-focused": { color: "#800080" },
            }}
          >
            <InputLabel>User Type *</InputLabel>
            <Select
              label="User Type *"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(128,0,128,0.15)",
                    mt: 0.5,
                  },
                },
              }}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem
                  key={r.value}
                  value={r.value}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.2,
                    "&.Mui-selected": { bgcolor: "rgba(128,0,128,0.08)" },
                    "&:hover": { bgcolor: "rgba(128,0,128,0.05)" },
                  }}
                >
                  <Box sx={{ color: "#800080", display: "flex" }}>{r.icon}</Box>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            className="reg-submit-btn"
            disabled={!selectedRole}
            onClick={navigateToRole}
            sx={{ mt: 3, mb: 1 }}
          >
            Continue to Registration
          </Button>

          {/* ── Footer Links ── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
              mt: 2,
              pt: 2,
              borderTop: "1px solid rgba(128,0,128,0.1)",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
              Already have an account?
            </Typography>
            <Button
              className="reg-text-link"
              startIcon={<LoginIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => (window.location.href = "/")}
              sx={{ p: 0, minWidth: "auto", fontSize: "13px" }}
            >
              Login Here
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserRegistrationRequest;
