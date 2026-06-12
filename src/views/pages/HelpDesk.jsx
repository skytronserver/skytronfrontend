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
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpDeskService from "../../services/helpDeskServices";
import { useNavigate } from "react-router-dom";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ComplaintBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    details: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setFormData((prev) => ({ ...prev, name: value.replace(/[^a-zA-Z\s]/g, "") }));
    } else if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: value.replace(/\D/g, "").slice(0, 10) }));
    } else if (name === "title") {
      setFormData((prev) => ({ ...prev, title: value.slice(0, 500) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const fileErrors = [];
    const valid = [];
    selected.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        fileErrors.push(`${file.name}: unsupported file type.`);
      } else if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(`${file.name}: exceeds 10 MB limit.`);
      } else {
        valid.push(file);
      }
    });
    if (fileErrors.length) {
      setErrors((prev) => ({ ...prev, files: fileErrors.join(" ") }));
    } else {
      setErrors((prev) => ({ ...prev, files: "" }));
    }
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit mobile number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.title.trim()) newErrors.title = "Complaint title is required";
    if (!formData.details.trim()) newErrors.details = "Complaint details are required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("applicant_name", formData.name);
      payload.append("applicant_phone", formData.phone);
      if (formData.email) payload.append("applicant_email", formData.email);
      payload.append("title", formData.title);
      payload.append("details", formData.details);
      files.forEach((file, i) => payload.append(`file_${i}`, file));

      const response = await HelpDeskService.createComplaintPublic(payload);
      if (response.success) {
        navigate("/help-desk-success", {
          state: {
            ticketRef: response.data.ticket_ref,
            message: response.data.message,
          },
        });
      } else {
        setApiError(response.message);
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Help Desk
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" mb={4}>
            Submit your complaint and our team will get back to you shortly.
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError("")}>
              {apiError}
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
                  inputProps={{ maxLength: 10, inputMode: "numeric" }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address (Optional)"
                  name="email"
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
                  helperText={errors.title || `${formData.title.length}/500`}
                  inputProps={{ maxLength: 500 }}
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
                  helperText={errors.details}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Attach Files (Optional — PNG, JPEG, PDF, XLS, XLSX · max 10 MB each)
                  <input
                    hidden
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                </Button>
                {errors.files && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.files}
                  </Typography>
                )}
                {files.length > 0 && (
                  <List dense sx={{ mt: 1 }}>
                    {files.map((file, i) => (
                      <ListItem
                        key={i}
                        secondaryAction={
                          <IconButton edge="end" size="small" onClick={() => removeFile(i)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(0)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Complaint"}
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
