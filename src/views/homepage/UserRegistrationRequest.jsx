import React, { useMemo, useState } from "react";
import {
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import skytronlogo from "../../assets/images/skytron-logo2.png";
import PublicRegistrationMockService from "../../services/PublicRegistrationMockService";

const UserRegistrationRequest = () => {
  const [selectedRole, setSelectedRole] = useState("");

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

  const logoStyle = useMemo(
    () => ({
      color: "#800080",
      fontFamily: "Quantico",
      fontWeight: "900",
      fontSize: "15px",
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    }),
    []
  );

  const navigateToRole = () => {
    if (!selectedRole) return;

    const roleSlugMap = {
      "M2M Service Provider": "m2m-service-provider",
      "Vehicle Manufacturer": "vehicle-manufacturer",
      "AIS-140 Device Manufacturer": "ais-140-device-manufacturer",
      "School Administrator": "school-administrator",
      Others: "others",
    };
    const slug = roleSlugMap[selectedRole];
    if (!slug) return;
    window.location.href = `/user-registration-request/${slug}`;
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="flex-start"
      >
        <Grid item xs={12} md={8} lg={6}>
          <Paper sx={paperStyle}>
            <Typography variant="h6" gutterBottom align="center">
              <img
                src={skytronlogo}
                alt="Logo"
                style={{ height: "auto", width: "36px" }}
              />
              <br />
              <span style={logoStyle}>SKYTRON</span>
            </Typography>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PersonAddIcon 
                sx={{ 
                  fontSize: 48, 
                  color: '#800080', 
                  mb: 2
                }} 
              />
              
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#800080',
                  mb: 1
                }}
              >
                Account Registration
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.5
                }}
              >
                Fill out the form below to request a new account
              </Typography>
            </Box>

            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      label="User Type"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <MenuItem value="M2M Service Provider">M2M Service Provider</MenuItem>
                      <MenuItem value="Vehicle Manufacturer">Vehicle Manufacturer</MenuItem>
                      <MenuItem value="AIS-140 Device Manufacturer">AIS-140 Device Manufacturer</MenuItem>
                      <MenuItem value="School Administrator">School Administrator</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                type="button"
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#800080',
                  '&:hover': {
                    backgroundColor: '#660066'
                  },
                  py: 1.5
                }}
                startIcon={<PersonAddIcon />}
                disabled={!selectedRole}
                onClick={navigateToRole}
              >
                Next
              </Button>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button 
                  variant="text" 
                  onClick={() => window.location.href = '/'}
                  sx={{ 
                    color: '#800080',
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Login Here
                </Button>
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => (window.location.href = "/registration-status")}
                  sx={{
                    color: "#800080",
                    textTransform: "none",
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  Track Existing Request
                </Button>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => (window.location.href = "/registration-admin-review")}
                  sx={{
                    color: "#800080",
                    textTransform: "none",
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  Demo Admin Review
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserRegistrationRequest;
