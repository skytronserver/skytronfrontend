import React, { useState, useRef, useCallback } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { gridSpacing } from "../../store/constant";
import HelpDeskService from "../../services/helpDeskServices";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const HelpDeskCreateTicket = () => {
  const navigate = useNavigate();
  const imeiDebounce = useRef(null);

  const [form, setForm] = useState({
    applicant_name: "",
    applicant_phone: "",
    applicant_email: "",
    title: "",
    details: "",
    source: "helpdesk_call",
    device_imei: "",
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(null);

  // IMEI autocomplete state
  const [imeiQuery, setImeiQuery] = useState("");
  const [imeiOptions, setImeiOptions] = useState([]);
  const [imeiLoading, setImeiLoading] = useState(false);
  const [imeiSelected, setImeiSelected] = useState(null);
  const [imeiOpen, setImeiOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImeiInput = useCallback((e) => {
    const value = e.target.value;
    setImeiQuery(value);
    setImeiSelected(null);
    setForm((prev) => ({ ...prev, device_imei: "" }));

    if (imeiDebounce.current) clearTimeout(imeiDebounce.current);
    if (value.length >= 4) {
      imeiDebounce.current = setTimeout(async () => {
        setImeiLoading(true);
        const response = await HelpDeskService.searchDeviceImei(value);
        if (response.success) {
          setImeiOptions(response.data.results || []);
          setImeiOpen(true);
        }
        setImeiLoading(false);
      }, 400);
    } else {
      setImeiOptions([]);
      setImeiOpen(false);
    }
  }, []);

  const selectImei = (device) => {
    setImeiSelected(device);
    setImeiQuery(device.imei);
    setForm((prev) => ({ ...prev, device_imei: device.imei }));
    setImeiOpen(false);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const fileErrors = [];
    const valid = [];
    selected.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        fileErrors.push(`${file.name}: unsupported type.`);
      } else if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(`${file.name}: exceeds 10 MB.`);
      } else {
        valid.push(file);
      }
    });
    if (fileErrors.length) setErrors((prev) => ({ ...prev, files: fileErrors.join(" ") }));
    else setErrors((prev) => ({ ...prev, files: "" }));
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const e = {};
    if (!form.applicant_name.trim()) e.applicant_name = "Name is required";
    if (!/^[0-9]{10}$/.test(form.applicant_phone)) e.applicant_phone = "Enter a valid 10-digit number";
    if (form.applicant_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicant_email))
      e.applicant_email = "Enter a valid email";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.details.trim()) e.details = "Details are required";
    if (!form.source) e.source = "Source is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setApiError("");

    const payload = new FormData();
    payload.append("applicant_name", form.applicant_name);
    payload.append("applicant_phone", form.applicant_phone);
    if (form.applicant_email) payload.append("applicant_email", form.applicant_email);
    payload.append("title", form.title);
    payload.append("details", form.details);
    payload.append("source", form.source);
    if (form.device_imei) payload.append("device_imei", form.device_imei);
    files.forEach((file, i) => payload.append(`file_${i}`, file));

    const response = await HelpDeskService.createComplaintStaff(payload);
    if (response.success) {
      setSuccess(response.data);
    } else {
      setApiError(response.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <MainCard>
            <Box textAlign="center" py={4}>
              <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                Ticket Created Successfully
              </Typography>
              <Typography variant="h5" color="primary" fontWeight={700} mb={2}>
                {success.ticket_ref}
              </Typography>
              <Typography color="text.secondary" mb={4}>
                {success.message}
              </Typography>
              <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <Button variant="contained" onClick={() => navigate(`/helpdesk/tickets/${success.id}`)}>
                  View Ticket
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSuccess(null);
                    setForm({ applicant_name: "", applicant_phone: "", applicant_email: "", title: "", details: "", source: "helpdesk_call", device_imei: "" });
                    setFiles([]);
                    setImeiQuery("");
                    setImeiSelected(null);
                  }}
                >
                  Create Another
                </Button>
                <Button variant="text" onClick={() => navigate("/helpdesk/tickets")}>
                  Back to Dashboard
                </Button>
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <MainCard
          title="Create Ticket on Behalf of Applicant"
          secondary={
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/helpdesk/tickets")}
              size="small"
            >
              Back
            </Button>
          }
        >
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError("")}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Source */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Source"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  error={!!errors.source}
                  helperText={errors.source}
                >
                  <MenuItem value="helpdesk_call">Phone Call</MenuItem>
                  <MenuItem value="helpdesk_email">Email</MenuItem>
                </TextField>
              </Grid>

              {/* IMEI lookup */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ position: "relative" }}>
                  <TextField
                    fullWidth
                    label="Device IMEI (Optional)"
                    value={imeiQuery}
                    onChange={handleImeiInput}
                    placeholder="Type at least 4 digits to search"
                    InputProps={{
                      endAdornment: imeiLoading ? <CircularProgress size={16} /> : null,
                    }}
                    helperText={imeiSelected ? `${imeiSelected.model_name} · ${imeiSelected.stock_status}` : ""}
                  />
                  {imeiOpen && imeiOptions.length > 0 && (
                    <Paper
                      sx={{
                        position: "absolute",
                        zIndex: 1300,
                        width: "100%",
                        maxHeight: 200,
                        overflowY: "auto",
                        border: "1px solid",
                        borderColor: "divider",
                        mt: 0.5,
                      }}
                    >
                      {imeiOptions.map((device) => (
                        <ListItem
                          key={device.id}
                          button
                          onClick={() => selectImei(device)}
                          sx={{ "&:hover": { bgcolor: "action.hover" } }}
                        >
                          <ListItemText
                            primary={device.imei}
                            secondary={`${device.model_name} · ESN: ${device.device_esn} · ${device.stock_status}`}
                          />
                        </ListItem>
                      ))}
                    </Paper>
                  )}
                  {imeiOpen && imeiOptions.length === 0 && !imeiLoading && (
                    <Paper sx={{ position: "absolute", zIndex: 1300, width: "100%", p: 1.5, mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">No devices found</Typography>
                    </Paper>
                  )}
                </Box>
              </Grid>

              {/* Applicant name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Applicant Full Name"
                  name="applicant_name"
                  value={form.applicant_name}
                  onChange={handleChange}
                  error={!!errors.applicant_name}
                  helperText={errors.applicant_name}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Applicant Phone Number"
                  name="applicant_phone"
                  value={form.applicant_phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, applicant_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                  }
                  error={!!errors.applicant_phone}
                  helperText={errors.applicant_phone}
                  inputProps={{ maxLength: 10, inputMode: "numeric" }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Applicant Email (Optional)"
                  name="applicant_email"
                  value={form.applicant_email}
                  onChange={handleChange}
                  error={!!errors.applicant_email}
                  helperText={errors.applicant_email}
                />
              </Grid>

              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Complaint Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title || `${form.title.length}/500`}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>

              {/* Details */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={5}
                  label="Complaint Details"
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  error={!!errors.details}
                  helperText={errors.details}
                />
              </Grid>

              {/* File upload */}
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Attach Files (PNG, JPEG, PDF, XLS, XLSX · max 10 MB each)
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
                        <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(0)} KB`} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ minWidth: 160 }}
                  >
                    {loading ? <CircularProgress size={22} color="inherit" /> : "Create Ticket"}
                  </Button>
                  <Button variant="outlined" onClick={() => navigate("/helpdesk/tickets")}>
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default HelpDeskCreateTicket;
