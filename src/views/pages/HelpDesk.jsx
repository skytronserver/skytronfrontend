import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ComplaintService from "../../services/helpDeskServices";
import { useNavigate } from "react-router-dom";
const ComplaintBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    details: "",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [ticketRef, setTicketRef] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    image: "",
    title: "",
    details: "",
  });


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");

      setFormData((prev) => ({
        ...prev,
        name: filteredValue,
      }));

      return;
    }

    if (name === "phone") {
      const filteredValue = value.replace(/\D/g, "").slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        phone: filteredValue,
      }));

      return;
    }

    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        title: value.slice(0, 500),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only Image or PDF files are allowed.",
      }));
      return;
    }

    if (file.size > 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Maximum file size allowed is 1 MB.",
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    if (file.type !== "application/pdf") {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Only alphabets are allowed";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10 digit mobile number";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Complaint title is required";
    } else if (formData.title.length > 500) {
      newErrors.title = "Complaint title cannot exceed 500 characters";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Complaint details are required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({
      name: "",
      phone: "",
      email: "",
      image: "",
      title: "",
      details: "",
    });

    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("applicant_name", formData.name);
      payload.append("applicant_phone", formData.phone);
      payload.append("applicant_email", formData.email);
      payload.append("title", formData.title);
      payload.append("details", formData.details);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response =
        await ComplaintService.createComplaint(payload);


 if (response.success) {
  navigate("/help-desk-success", {
    state: {
      ticketRef: response.data.ticket_ref,
      message: response.data.message,
    },
  });
  return;
} else {
        setApiError(response.message);
        return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        py: 5,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight={700}
            gutterBottom
          >
 Help Desk
           </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            mb={4}
          >
            Submit your complaint and our team will get back to you shortly.
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}


          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          {ticketRef && (
  <Alert severity="info" sx={{ mb: 3 }}>
    Ticket Reference: <strong>{ticketRef}</strong>
  </Alert>
)}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complaint Title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={
                    errors.title ||
                    `${formData.title.length}/500 characters`
                  }
                  inputProps={{
                    maxLength: 500,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Complaint Details"
                  name="details"
                  required
                  value={formData.details}
                  onChange={handleChange}
                  error={!!errors.details}
                  helperText={
                    errors.details ||
                    `${formData.details.length}/10000 characters`
                  }
                  inputProps={{
                    maxLength: 10000,
                  }}

                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Upload Image (Optional)

                  <input
                    hidden
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.image?.type === "application/pdf" && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    PDF selected: {formData.image.name}
                  </Typography>
                )}
                {errors.image && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    {errors.image}
                  </Typography>
                )}
              </Grid>

              {preview && (
                <Grid item xs={12}>
                  <Box
                    component="img"
                    src={preview}
                    alt="preview"
                    sx={{
                      width: 180,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #ddd",
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit Complaint"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ComplaintBooking;