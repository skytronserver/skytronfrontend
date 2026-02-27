import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DevicesIcon from "@mui/icons-material/Devices";
import DescriptionIcon from "@mui/icons-material/Description";
import SimCardIcon from "@mui/icons-material/SimCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeviceModelServices from "../../services/DeviceModelServices";

/* ─────────────────────────────────────── constants ─── */

const STEPS = [
  { label: "Select Model" },
  { label: "Manufacturer Onboarding" },
  { label: "Required Documents" },
  { label: "VLTD Devices" },
];

const emptyTestDevice = () => ({
  device_serial_no: "",
  imei: "",
  ccid1: "",
  ccid2: "",
  msisdn1: "",
  msisdn2: "",
});

const TEST_DEVICE_FIELDS = [
  { key: "device_serial_no", label: "Device Serial No", placeholder: "e.g. SN-1001" },
  { key: "imei", label: "IMEI", placeholder: "15-digit IMEI number" },
  { key: "ccid1", label: "CCID 1", placeholder: "19-digit CCID" },
  { key: "ccid2", label: "CCID 2", placeholder: "19-digit CCID" },
  { key: "msisdn1", label: "MSISDN 1", placeholder: "e.g. 919876543210" },
  { key: "msisdn2", label: "MSISDN 2", placeholder: "e.g. 919876543211" },
];

/* ── reusable PDF upload card ── */
const PdfUploadCard = ({ label, icon: Icon, file, onChange, error }) => (
  <Paper
    variant="outlined"
    component="label"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      cursor: "pointer",
      borderRadius: 2,
      borderStyle: "dashed",
      borderColor: error ? "error.main" : file ? "primary.main" : "divider",
      bgcolor: file ? "primary.50" : "background.paper",
      transition: "all 0.2s ease",
      "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" },
    }}
  >
    <input type="file" hidden accept="application/pdf" onChange={onChange} />
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: file ? "primary.main" : "grey.100",
        color: file ? "white" : "text.secondary",
        flexShrink: 0,
        transition: "all 0.2s ease",
      }}
    >
      {file ? <CheckCircleIcon /> : <Icon />}
    </Box>
    <Box flex={1} minWidth={0}>
      <Typography variant="subtitle2" fontWeight={600} noWrap>
        {label}
      </Typography>
      <Typography
        variant="caption"
        color={file ? "primary.main" : error ? "error" : "text.secondary"}
        noWrap
        display="block"
      >
        {file ? file.name : error ? error : "Click to upload PDF"}
      </Typography>
    </Box>
    <UploadFileIcon
      sx={{ color: file ? "primary.main" : "text.disabled", flexShrink: 0 }}
    />
  </Paper>
);

/* ═══════════════════════════════════════════════════ */

const DeviceModelTechnicalOnboardingCreate = () => {
  const [activeStep, setActiveStep] = useState(0);

  /* ── form state ── */
  const [deviceModelId, setDeviceModelId] = useState("");
  const [userManualPdf, setUserManualPdf] = useState(null);
  const [otCommandListPdf, setOtCommandListPdf] = useState(null);
  const [testDevices, setTestDevices] = useState([emptyTestDevice()]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [message, setMessage] = useState("");

  const showAlert = (type, msg) => {
    setAlertType(type);
    setMessage(msg);
    setOpenAlert(true);
  };

  const canRemoveTestDevice = useMemo(() => testDevices.length > 1, [testDevices.length]);

  /* ── demo device CRUD ── */
  const handleTestDeviceChange = (index, key, value) => {
    setTestDevices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[`device_${index}_${key}`];
      return copy;
    });
  };

  const handleAddTestDevice = () =>
    setTestDevices((prev) => [...prev, emptyTestDevice()]);

  const handleRemoveTestDevice = (index) =>
    setTestDevices((prev) => prev.filter((_, i) => i !== index));

  /* ── per-step validation ── */
  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!deviceModelId || String(deviceModelId).trim() === "") {
        errors.deviceModelId = "Device Model ID is required.";
      }
    }
    if (step === 2) {
      if (!userManualPdf) errors.userManualPdf = "Required";
      if (!otCommandListPdf) errors.otCommandListPdf = "Required";
    }
    if (step === 3) {
      testDevices.forEach((d, i) => {
        TEST_DEVICE_FIELDS.forEach(({ key }) => {
          if (!d[key] || String(d[key]).trim() === "") {
            errors[`device_${i}_${key}`] = "Required";
          }
        });
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ── navigation ── */
  const handleNext = () => {
    if (!validateStep(activeStep)) {
      showAlert("error", "Please fix all errors before continuing.");
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setFieldErrors({});
    setActiveStep((s) => s - 1);
  };

  /* ── reset ── */
  const resetForm = () => {
    setDeviceModelId("");
    setUserManualPdf(null);
    setOtCommandListPdf(null);
    setTestDevices([emptyTestDevice()]);
    setFieldErrors({});
    setActiveStep(0);
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!validateStep(3)) {
      showAlert("error", "Please fix all errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("device_model_id", deviceModelId);
    formData.append("user_manual_pdf", userManualPdf);
    formData.append("ot_command_list_pdf", otCommandListPdf);
    formData.append("demo_devices", JSON.stringify(testDevices));

    setSubmitting(true);
    try {
      await DeviceModelServices.createTechnicalOnboardingRequest(formData);
      showAlert("success", "Technical onboarding request submitted successfully!");
      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Failed to submit technical onboarding request.";
      showAlert("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── step content ── */
  const renderStepContent = () => {
    switch (activeStep) {
      /* ── Step 0: Select Model ── */
      case 0:
        return (
          <SectionBlock
            label="Device Model"
            description="Enter the ID of the device model to onboard."
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="device_model_id"
                  label="Device Model ID"
                  placeholder="e.g. 12"
                  value={deviceModelId}
                  onChange={(e) => {
                    setDeviceModelId(e.target.value);
                    setFieldErrors((p) => {
                      const c = { ...p };
                      delete c.deviceModelId;
                      return c;
                    });
                  }}
                  error={!!fieldErrors.deviceModelId}
                  helperText={fieldErrors.deviceModelId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DevicesIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </SectionBlock>
        );

      /* ── Step 1: Manufacturer Onboarding ── */
      case 1:
        return (
          <SectionBlock
            label="Manufacturer Onboarding"
            description="Review the integration details before uploading documents."
          >
            <Stack spacing={3}>
              {/* A) Technical Document */}
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  A) Technical Document (Confidential)
                </Typography>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This section contains the confidential API integration document.
                  Review it carefully before proceeding.
                </Alert>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.open("/", "_blank")}
                >
                  Open Technical Document
                </Button>
              </Box>

              <Divider />

              {/* B) Test Server Details */}
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  B) Test Server Details
                </Typography>
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Base URL:</strong> http://UAT-IP-ADDRESS
                  </Typography>
                  <Typography variant="body2">
                    <strong>Port:</strong> 0000
                  </Typography>
                  <Typography variant="body2">
                    <strong>Note:</strong> Share your public IP for allowlisting (if required).
                  </Typography>
                </Alert>
              </Box>

              <Divider />

              {/* C) Integration Checklist */}
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  C) Test Device &amp; Integration Checklist
                </Typography>
                <Alert severity="success">
                  <Typography variant="body2">1) Login credentials received</Typography>
                  <Typography variant="body2">2) API integration completed on UAT</Typography>
                  <Typography variant="body2">3) Test device shared / arranged</Typography>
                  <Typography variant="body2">4) Functionality &amp; integration verified on platform</Typography>
                </Alert>
              </Box>
            </Stack>
          </SectionBlock>
        );

      /* ── Step 2: Required Documents ── */
      case 2:
        return (
          <SectionBlock
            label="Required Documents"
            description="Upload both PDFs. Max file size: 10 MB each."
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <PdfUploadCard
                  label="User Manual (PDF)"
                  icon={DescriptionIcon}
                  file={userManualPdf}
                  error={fieldErrors.userManualPdf}
                  onChange={(e) => {
                    setUserManualPdf(e.target.files?.[0] || null);
                    setFieldErrors((p) => {
                      const c = { ...p };
                      delete c.userManualPdf;
                      return c;
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PdfUploadCard
                  label="OT Command List (PDF)"
                  icon={DescriptionIcon}
                  file={otCommandListPdf}
                  error={fieldErrors.otCommandListPdf}
                  onChange={(e) => {
                    setOtCommandListPdf(e.target.files?.[0] || null);
                    setFieldErrors((p) => {
                      const c = { ...p };
                      delete c.otCommandListPdf;
                      return c;
                    });
                  }}
                />
              </Grid>
            </Grid>
          </SectionBlock>
        );

      /* ── Step 3: Demo Devices ── */
      case 3:
        return (
          <SectionBlock
            label="VLTD Devices"
            description="Minimum 1 VLTD device is required. All fields are mandatory."
            action={
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddTestDevice}
                variant="contained"
                size="small"
              >
                Add Device
              </Button>
            }
          >
            <Stack spacing={2}>
              {testDevices.map((d, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    borderColor: "divider",
                  }}
                >
                  {/* card header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SimCardIcon sx={{ color: "white", fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={700} color="white">
                        VLTD Device {index + 1}
                      </Typography>
                      {testDevices.length > 1 && (
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "white",
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </Stack>
                    <Tooltip
                      title={
                        canRemoveTestDevice
                          ? "Remove device"
                          : "At least 1 device required"
                      }
                    >
                      <span>
                        <IconButton
                          onClick={() => handleRemoveTestDevice(index)}
                          disabled={!canRemoveTestDevice}
                          size="small"
                          sx={{
                            color: "white",
                            "&.Mui-disabled": { color: "rgba(255,255,255,0.4)" },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* card body */}
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {TEST_DEVICE_FIELDS.map(({ key, label, placeholder }) => (
                        <Grid item xs={12} md={6} key={key}>
                          <TextField
                            fullWidth
                            id={`device_${index}_${key}`}
                            label={label}
                            placeholder={placeholder}
                            value={d[key]}
                            onChange={(e) =>
                              handleTestDeviceChange(index, key, e.target.value)
                            }
                            error={!!fieldErrors[`device_${index}_${key}`]}
                            helperText={fieldErrors[`device_${index}_${key}`]}
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </SectionBlock>
        );

      default:
        return null;
    }
  };

  const isLastStep = activeStep === STEPS.length - 1;

  /* ── render ── */
  return (
    <Grid container spacing={gridSpacing}>
      <AutoHideAlert
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        message={message}
        type={alertType}
      />

      <Grid item xs={12}>
        <MainCard
          title={
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <DevicesIcon color="primary" />
              <Typography variant="h4" fontWeight={700}>
                Technical Onboarding Request
              </Typography>
            </Stack>
          }
        >
          <Typography variant="body2" color="text.secondary" mb={4}>
            Submit a technical onboarding request for your device model. Provide the
            required documents and at least one VLTD device.
          </Typography>

          {/* ── Stepper ── */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((step, index) => (
              <Step key={step.label} completed={index < activeStep}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {/* ── Step Content ── */}
          {renderStepContent()}

          <Divider sx={{ my: 3 }} />

          {/* ── Navigation Buttons ── */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Left side */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={submitting}
                sx={{ minWidth: 100 }}
              >
                Reset
              </Button>
            </Stack>

            {/* Right side */}
            <Stack direction="row" spacing={2}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  disabled={submitting}
                  sx={{ minWidth: 110 }}
                >
                  Back
                </Button>
              )}

              {!isLastStep ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  sx={{ minWidth: 110 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{ minWidth: 160 }}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {submitting ? "Submitting…" : "Submit Request"}
                </Button>
              )}
            </Stack>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
};

/* ── layout helper ── */
const SectionBlock = ({ label, description, action, children }) => (
  <Box>
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={1}
      mb={2}
    >
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom={false}>
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Stack>
    {children}
  </Box>
);

export default DeviceModelTechnicalOnboardingCreate;
