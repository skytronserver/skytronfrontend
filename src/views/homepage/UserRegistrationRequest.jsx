import React, { useState } from "react";
import {
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Grid,
  TextField,
  Alert,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import skytronlogo from "../../assets/images/skytron-logo2.png";

const UserRegistrationRequest = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    request: ''
  });
  
  const [showSuccess, setShowSuccess] = useState(false);

  const paperStyle = {
    p: 3,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
    setShowSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        request: ''
      });
    }, 3000);
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

            {showSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Registration request submitted successfully! We'll get back to you soon.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Request"
                    name="request"
                    value={formData.request}
                    onChange={handleInputChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Please describe your account request and requirements..."
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
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
              >
                Submit Registration Request
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserRegistrationRequest;
