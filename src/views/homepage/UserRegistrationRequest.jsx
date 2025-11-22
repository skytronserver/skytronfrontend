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
import UserServices from "../../services/UserServices";

const UserRegistrationRequest = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    org_name: "",
    user_type: "Business",
    email: "support@skytron.in",
    mobile: "",
    dob: "1990-01-01",
    request: "",
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const payload = {
      name:
        formData.firstName + (formData.lastName ? ` ${formData.lastName}` : ""),
      org_name: formData.org_name,
      user_type: formData.user_type,
      email: formData.email,
      mobile: formData.mobile,
      dob: formData.dob,
      request_detail: formData.request,
    };

    try {
      await UserServices.publicUserRegistration(payload);
      setShowSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        org_name: "",
        user_type: "Business",
        email: "support@skytron.in",
        mobile: "",
        dob: "1990-01-01",
        request: "",
      });
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to submit registration request.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
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
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Organisation Name"
                    name="org_name"
                    value={formData.org_name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User Type"
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    placeholder="Business / Dealer / Individual"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{
                      pattern: '[0-9]{10}',
                      title: 'Please enter a valid 10-digit mobile number'
                    }}
                    placeholder="Enter 10-digit mobile number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
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
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Registration Request"}
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
