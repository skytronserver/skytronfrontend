import React from "react";
import {
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Grid,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import skytronlogo from "../../assets/images/skytron-logo2.png";

const UserRegistrationRequest = () => {
  const paperStyle = {
    p: 2,
    backdropFilter: "blur(5px)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  };

  const logoStyle = {
    color: "#800080",
    fontFamily: "Quantico",
    fontWeight: "900",
    fontSize: "15px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ height: "70vh" }}
      >
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: { xs: "none", md: "block" } }}
        ></Grid>
        <Grid item xs={12} md={4} justifyContent="center" alignItems="center">
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

            <Box sx={{ textAlign: 'center', py: 2 }}>
              <SupportAgentIcon 
                sx={{ 
                  fontSize: 48, 
                  color: '#800080', 
                  mb: 2
                }} 
              />
              
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#800080',
                  mb: 2
                }}
              >
                Account Opening Request
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3, 
                  color: 'text.primary',
                  lineHeight: 1.5
                }}
              >
                Kindly write to <strong style={{ color: '#800080' }}>support@skytrack.in</strong> for account opening request.
              </Typography>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  mb: 3,
                  p: 1,
                  backgroundColor: '#cdcdcd',
                  borderRadius: '8px'
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 16, color: '#800080' }} />
                <Typography variant="body2" sx={{ color: '#800080', fontWeight: 'medium' }}>
                  2-3 Business Days Response
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                href="mailto:support@skytrack.in"
                startIcon={<EmailIcon />}
                fullWidth
                sx={{ 
                  mb: 2,
                  backgroundColor: '#800080',
                  '&:hover': {
                    backgroundColor: '#660066'
                  }
                }}
              >
                Send Email Request
              </Button>
            </Box>
            
            <Box sx={{ mt: 1, textAlign: 'center' }}>
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserRegistrationRequest;
