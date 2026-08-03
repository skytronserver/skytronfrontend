import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  Tab,
  Tabs,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeviceModelServices from "../../services/DeviceModelServices";
import DeviceDataHealthService from "../../services/DeviceDataHealth";

/* ─────────────────────────────────────── constants ─── */

const STEPS = [
  { label: "Select Model" },
  { label: "Manufacturer Onboarding" },
  { label: "Required Documents" },
  { label: "VLTD Devices" },
  { label: "Device Data Health" },
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
  { key: "imei", label: "IMEI", placeholder: "15-digit IMEI number", maxLength: 15 },
  { key: "ccid1", label: "ICCID 1", placeholder: "19 or 20-digit ICCID", maxLength: 20 },
  { key: "ccid2", label: "ICCID 2", placeholder: "19 or 20-digit ICCID", maxLength: 20 },
  { key: "msisdn1", label: "MSISDN 1", placeholder: "e.g. 919876543210", maxLength: 15 },
  { key: "msisdn2", label: "MSISDN 2", placeholder: "e.g. 919876543211", maxLength: 15 },
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

/* ── health helpers ── */
const getHealthCardColor = (status) => {
  if (!status) return "#9e9e9e";
  const s = status.toLowerCase();
  if (s.includes("invalid") || s.includes("error")) return "#ef4444";
  if (s.includes("available") && !s.includes("not")) return "#22c55e";
  return "#f59e0b";
};

const formatHealthTime = (ts) => {
  if (!ts || ts === "—") return "—";
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString();
  } catch {
    return ts;
  }
};

const DeviceModelTechnicalOnboardingCreate = () => {
  const [activeStep, setActiveStep] = useState(0);

  /* ── form state ── */
  const [deviceModelId, setDeviceModelId] = useState("");
  const [deviceModels, setDeviceModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [userManualPdf, setUserManualPdf] = useState(null);
  const [otCommandListPdf, setOtCommandListPdf] = useState(null);
  const [testDevices, setTestDevices] = useState(
    Array.from({ length: 5 }, emptyTestDevice)
  );

  /* ── device data health state ── */
  const [healthProtocol, setHealthProtocol] = useState("");
  const [healthFormats, setHealthFormats] = useState([]);
  const [healthLookbackDays, setHealthLookbackDays] = useState(3);
  const [deviceHealthResults, setDeviceHealthResults] = useState([]); // array per device
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthFetched, setHealthFetched] = useState(false);
  const [activeHealthTab, setActiveHealthTab] = useState(0);
  const [imeiSearch, setImeiSearch] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const [stateApprovedResp, superApprovedResp, existingRequestsResp] = await Promise.all([
          DeviceModelServices.getFilterModels({ status: "StateAdminApproved" }),
          DeviceModelServices.getFilterModels({ status: "SuperAdminApproved" }).catch(() => null),
          DeviceModelServices.listManufacturerTechnicalOnboardingRequests({}).catch(() => null),
        ]);

        const stateList = Array.isArray(stateApprovedResp?.data) ? stateApprovedResp.data : [];
        const superList = Array.isArray(superApprovedResp?.data) ? superApprovedResp.data : [];
        const merged = [...stateList, ...superList];

        // Get IDs of models that already have a non-rejected onboarding request
        const existingData = existingRequestsResp?.data || existingRequestsResp?.results || existingRequestsResp?.data?.results || [];
        const existingModelIds = new Set(
          Array.isArray(existingData)
            ? existingData
              .filter(r => {
                const s = String(r?.status ?? "").trim().toLowerCase();
                return s !== "rejected"; // Allow re-submission only if rejected
              })
              .map(r => String(r?.device_model_id || (typeof r?.device_model === 'object' ? r?.device_model?.id : r?.device_model)))
            : []
        );

        const unique = [...new Map(merged.map((m) => [String(m?.id), m])).values()]
          .filter((m) => m?.id !== undefined && m?.id !== null)
          .filter((m) => !existingModelIds.has(String(m.id))); // Filter out already onboarded models

        if (isMounted) setDeviceModels(unique);
      } catch (err) {
        if (isMounted) setDeviceModels([]);
      } finally {
        if (isMounted) setModelsLoading(false);
      }
    };

    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ── load protocol formats for health step ── */
  useEffect(() => {
    let isMounted = true;
    const loadFormats = async () => {
      try {
        const res = await DeviceDataHealthService.getFormats();
        let formatList = [];
        if (res.data?.options && Array.isArray(res.data.options)) {
          formatList = res.data.options;
        } else if (res.data && typeof res.data === "object") {
          const obj = res.data.data ? res.data.data : res.data;
          formatList = Object.entries(obj).map(([k, v]) => ({ value: k, label: v }));
        }
        if (formatList.length === 0) {
          formatList = [
            { value: "ARAI_2025", label: "ARAI (current)" },
            { value: "Amendment3", label: "Amendment 3" },
          ];
        }
        if (isMounted) {
          setHealthFormats(formatList);
          setHealthProtocol(formatList[0].value);
        }
      } catch {
        const fallback = [
          { value: "ARAI_2025", label: "ARAI (current)" },
          { value: "Amendment3", label: "Amendment 3" },
        ];
        if (isMounted) {
          setHealthFormats(fallback);
          setHealthProtocol(fallback[0].value);
        }
      }
    };
    loadFormats();
    return () => { isMounted = false; };
  }, []);

  /* ── fetch health for all devices ── */
  const fetchAllDeviceHealth = async () => {
    setHealthLoading(true);
    setHealthFetched(false);
    const results = await Promise.all(
      testDevices.map(async (device) => {
        const imei = String(device.imei || "").trim();
        if (!imei) return { imei: "—", error: "No IMEI", data: null };
        try {
          const res = await DeviceDataHealthService.getHealthData(imei, healthProtocol, healthLookbackDays);
          return { imei, error: null, data: res.data };
        } catch (err) {
          return {
            imei,
            error: err?.response?.data?.detail || err?.message || "Failed to fetch",
            data: null,
          };
        }
      })
    );
    setDeviceHealthResults(results);
    setHealthLoading(false);
    setHealthFetched(true);
  };

  const canRemoveTestDevice = useMemo(() => testDevices.length > 5, [testDevices.length]);

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
      if (testDevices.length < 5) {
        errors.testDevices = "Minimum 5 devices are required.";
      }
      testDevices.forEach((d, i) => {
        TEST_DEVICE_FIELDS.forEach(({ key }) => {
          const val = String(d[key] || "").trim();
          if (!val) {
            errors[`device_${i}_${key}`] = "Required";
          } else {
            // length-specific validations
            if (key === "imei" && val.length !== 15) {
              errors[`device_${i}_${key}`] = "IMEI must be 15 digits";
            }
            if ((key === "ccid1" || key === "ccid2") && val.length !== 19 && val.length !== 20) {
              errors[`device_${i}_${key}`] = "ICCID must be 19 or 20 digits";
            }
          }
        });
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ── navigation ── */
  const handleNext = async () => {
    if (!validateStep(activeStep)) {
      showAlert("error", "Please fix all errors before continuing.");
      return;
    }
    // When moving from Step 3 (VLTD Devices) to Step 4 (Device Data Health), auto-fetch
    if (activeStep === 3) {
      setActiveStep((s) => s + 1);
      // Fetch health after navigating to step 4
      setTimeout(() => fetchAllDeviceHealth(), 100);
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
    setTestDevices(Array.from({ length: 5 }, emptyTestDevice));
    setFieldErrors({});
    setActiveStep(0);
    setDeviceHealthResults([]);
    setHealthFetched(false);
    setActiveHealthTab(0);
    setImeiSearch("");
  };

  /* ── submit ── */
  const handleSubmit = async () => {
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
            description="Select the device model to onboard."
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={deviceModels}
                  loading={modelsLoading}
                  noOptionsText={modelsLoading ? "Loading models..." : "No approved models"}
                  value={
                    deviceModels.find((m) => String(m?.id) === String(deviceModelId)) || null
                  }
                  onChange={(_, newValue) => {
                    setDeviceModelId(newValue?.id ? String(newValue.id) : "");
                    setFieldErrors((p) => {
                      const c = { ...p };
                      delete c.deviceModelId;
                      return c;
                    });
                  }}
                  getOptionLabel={(option) => {
                    const name = option?.model_name;
                    if (name && String(name).trim() !== "") return String(name);
                    const id = option?.id;
                    if (id === undefined || id === null) return "";
                    return String(id);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    String(option?.id) === String(value?.id)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="device_model_id"
                      label="Device Model"
                      placeholder={modelsLoading ? "Loading models..." : "Select model"}
                      error={!!fieldErrors.deviceModelId}
                      helperText={fieldErrors.deviceModelId}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <DevicesIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {modelsLoading ? (
                              <CircularProgress color="inherit" size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
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
                  onClick={() => window.open("/docs/TechnicalOnboarding.pdf", "_blank")}
                >
                  Open Technical Document
                </Button>
              </Box>

              {/* B) Integration Checklist */}
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  B) Test Device &amp; Integration Checklist
                </Typography>
                <Alert severity="success" icon={false}>
                  <Typography variant="body2">1) Login credentials received</Typography>
                  <Typography variant="body2">2) API integration completed on UAT</Typography>
                  <Typography variant="body2">3) Test device shared / arranged</Typography>
                  <Typography variant="body2">4) Functionality &amp; integration verified on platform</Typography>
                </Alert>
              </Box>

              {/* C) MQTT Secrets */}
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  C) MQTT Secrets
                </Typography>
                <Alert severity="warning" icon={false}>
                  <Typography variant="body2" sx={{ wordBreak: "break-all", mb: 2 }}>
                    <strong>1) MQTT Password:</strong>{" "}
                    {deviceModels.find((m) => String(m?.id) === String(deviceModelId))?.mqtt_pw || ""}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-all", mb: 1 }}>
                    <strong>2) CA Certificate:</strong>
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      bgcolor: "rgba(0,0,0,0.05)",
                      borderRadius: 1,
                      overflowX: "auto",
                      fontSize: "0.75rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      m: 0,
                    }}
                  >
                    {`-----BEGIN CERTIFICATE-----
MIIDrzCCApegAwIBAgIUXTpF43hyS9QoRuJeo7sHr8LASSYwDQYJKoZIhvcNAQEL
BQAwZzELMAkGA1UEBhMCSU4xDjAMBgNVBAgMBVN0YXRlMQ0wCwYDVQQHDARDaXR5
MRUwEwYDVQQKDAxPcmdhbml6YXRpb24xEDAOBgNVBAsMB09yZ1VuaXQxEDAOBgNV
BAMMB01RVFQtQ0EwHhcNMjUxMDI1MTk0NDA3WhcNMzUxMDIzMTk0NDA3WjBnMQsw
CQYDVQQGEwJJTjEOMAwGA1UECAwFU3RhdGUxDTALBgNVBAcMBENpdHkxFTATBgNV
BAoMDE9yZ2FuaXphdGlvbjEQMA4GA1UECwwHT3JnVW5pdDEQMA4GA1UEAwwHTVFU
VC1DQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALVaU/+UkIHHUkdW
ra4yLCv8fE0Ll2swFcOKRgjZidnE1Zz7hrp72jwTB3UvpgKWnH9dA8RVSQxYemDV
Q/ejTZ7KXwtebmWYIAz1DHeJsu8hnN0GTH+rfP6oRja7zSNzawFn5/yF9oAoNXSg
r6rP3k+OihOKP/sG10BX76p2sKRwfZInsijXMZDM8nCqzD6/ls4GHVXfZg+CaZU/
5LAKYa+MI/hIiCvYouUKa9UYTeJhh2MX7GAx57Jv8p3jVdtLy6uwwYiDwV7k6+YW
fgyECbIRqtGld1jZLM9kyBB4lD829vdlsVGIzSwCZuq/jmdOSXNi0uWRAf9HtgnW
DhbX2K8CAwEAAaNTMFEwHQYDVR0OBBYEFLRBemkUQZNenqXnIJ26/+ExIXftMB8G
A1UdIwQYMBaAFLRBemkUQZNenqXnIJ26/+ExIXftMA8GA1UdEwEB/wQFMAMBAf8w
DQYJKoZIhvcNAQELBQADggEBAC/TRc0N343DC9I6xD0sYsF3jxvcT4K/8JdoRhuK
jlDde6liF7zI5gfhnsfGmvRLl3l6DJqNZpaqDS6bbCFU4vof8Eo6ZKdfN7bRQ9Jc
vOtpK7Ml4MwSaSJLbRJ3xC4agmxftNL6K7xMVSbeg7YVc5aWdx9u7ojsxUpDO1b5
5PuMUoXaehYST1HOVRy5wyBQpb5R2cJ8SvlHZPL5LpdLnFAutMOyYf4ig3v3BluK
GBQcBR0OIaxrHdINGPW+cRNTQlemgKwGtCPKLTQ2RnQinmVZWrngZJtqNImguxXY
oEO40NoUqYCSs/fdqNV+h9xbDERr25Oq6kYkYOaPwae9jmo=
-----END CERTIFICATE-----`}
                  </Box>
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
            description="Upload both PDFs. Max file size: 2 MB each."
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <PdfUploadCard
                  label="User Manual (PDF)"
                  icon={DescriptionIcon}
                  file={userManualPdf}
                  error={fieldErrors.userManualPdf}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 2 * 1024 * 1024) {
                      setFieldErrors((p) => ({ ...p, userManualPdf: "File size exceeds 2MB limit" }));
                      setUserManualPdf(null);
                      return;
                    }
                    setUserManualPdf(file);
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
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 2 * 1024 * 1024) {
                      setFieldErrors((p) => ({ ...p, otCommandListPdf: "File size exceeds 2MB limit" }));
                      setOtCommandListPdf(null);
                      return;
                    }
                    setOtCommandListPdf(file);
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
            description="Five VLTD devices are required for compatibility assessment. All fields are mandatory."
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
                      {testDevices.length > 5 && (
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
                          : "At least 5 devices required"
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
                            inputProps={{
                              maxLength: TEST_DEVICE_FIELDS.find(f => f.key === key)?.maxLength
                            }}
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

      /* ── Step 4: Device Data Health ── */
      case 4: {
        // Derive which tab to show based on IMEI search
        const searchedTabIdx = imeiSearch.trim()
          ? deviceHealthResults.findIndex((r) =>
              r.imei.toLowerCase().includes(imeiSearch.trim().toLowerCase())
            )
          : -1;
        const displayTabIdx = searchedTabIdx >= 0 ? searchedTabIdx : activeHealthTab;

        const activeResult = healthFetched ? deviceHealthResults[displayTabIdx] : null;
        const activeDevice = testDevices[displayTabIdx];

        // Parse categories & alerts for the active tab
        let categoriesArray = [];
        let alertsArray = [];
        if (activeResult?.data) {
          const cats =
            activeResult.data.categories ||
            activeResult.data.summary ||
            activeResult.data.packet_categories ||
            activeResult.data.data;
          if (Array.isArray(cats)) {
            categoriesArray = cats;
          } else if (cats && typeof cats === "object") {
            categoriesArray = Object.entries(cats).map(([key, val]) => ({
              name: key,
              ...(typeof val === "object" ? val : { status: val }),
            }));
          }
          const alts =
            activeResult.data.alerts ||
            activeResult.data.reference ||
            activeResult.data.alert_reference;
          if (Array.isArray(alts)) alertsArray = alts;
          else if (alts && typeof alts === "object") alertsArray = Object.values(alts);
        }

        return (
          <SectionBlock
            label="Device Data Health"
            description="Review live data health for all registered VLTD devices before submitting."
            action={
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Protocol Format</InputLabel>
                  <Select
                    value={healthProtocol}
                    label="Protocol Format"
                    onChange={(e) => { setHealthProtocol(e.target.value); setHealthFetched(false); }}
                  >
                    {healthFormats.map((f, i) => (
                      <MenuItem key={i} value={f.value}>{f.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Lookback days"
                  type="number"
                  value={healthLookbackDays}
                  onChange={(e) => { setHealthLookbackDays(e.target.value); setHealthFetched(false); }}
                  sx={{ width: 110 }}
                  inputProps={{ min: 1, max: 30 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={healthLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
                  onClick={fetchAllDeviceHealth}
                  disabled={healthLoading}
                >
                  {healthLoading ? "Checking…" : healthFetched ? "Re-check" : "Check Health"}
                </Button>
              </Stack>
            }
          >
            {/* IMEI Search bar */}
            <Box mb={2}>
              <TextField
                size="small"
                placeholder="Search by IMEI…"
                value={imeiSearch}
                onChange={(e) => setImeiSearch(e.target.value)}
                sx={{ width: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SimCardIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: imeiSearch ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setImeiSearch("")}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              {imeiSearch && searchedTabIdx === -1 && (
                <Typography variant="caption" color="error" ml={1}>
                  No device found with IMEI "{imeiSearch}"
                </Typography>
              )}
            </Box>

            {!healthFetched && !healthLoading && (
              <Alert severity="info" icon={<HealthAndSafetyIcon />}>
                Click <strong>Check Health</strong> above to fetch live data health for all {testDevices.length} VLTD devices.
              </Alert>
            )}
            {healthLoading && (
              <Box display="flex" alignItems="center" gap={2} py={4} justifyContent="center">
                <CircularProgress size={32} />
                <Typography color="text.secondary">Fetching health data for {testDevices.length} devices…</Typography>
              </Box>
            )}

            {healthFetched && !healthLoading && (
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                {/* ── Device Tabs ── */}
                <Tabs
                  value={displayTabIdx}
                  onChange={(_, val) => { setActiveHealthTab(val); setImeiSearch(""); }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                    minHeight: 44,
                  }}
                >
                  {deviceHealthResults.map((result, idx) => (
                    <Tab
                      key={idx}
                      value={idx}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: result.error ? "error.main" : "primary.main",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                            Device {idx + 1}
                          </span>
                        </Stack>
                      }
                      sx={{ minHeight: 44, px: 2, py: 0 }}
                    />
                  ))}
                </Tabs>

                {/* ── Active Device Content ── */}
                <Box sx={{ p: 2 }}>
                  {/* Device info row */}
                  <Stack direction="row" alignItems="center" spacing={1} mb={2} flexWrap="wrap">
                    <HealthAndSafetyIcon color={activeResult?.error ? "error" : "primary"} fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Device {displayTabIdx + 1} — IMEI: {activeResult?.imei}
                    </Typography>
                    {activeDevice?.device_serial_no && (
                      <Chip label={`SN: ${activeDevice.device_serial_no}`} size="small" variant="outlined" />
                    )}
                    {activeResult?.error ? (
                      <Chip label="Error" size="small" color="error" />
                    ) : (
                      <Chip label="Health fetched" size="small" color="success" />
                    )}
                  </Stack>

                  {activeResult?.error ? (
                    <Alert severity="error">{activeResult.error}</Alert>
                  ) : (
                    <Stack spacing={2}>
                      {activeResult?.data && (
                        <Typography variant="caption" color="text.secondary">
                          Checked at {new Date().toLocaleString()} — Server format:{" "}
                          {activeResult.data.current_server_format || activeResult.data.server_format || healthProtocol}
                        </Typography>
                      )}

                      {/* Packet categories */}
                      {categoriesArray.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} mb={1}>Packet Categories</Typography>
                          <Grid container spacing={1.5}>
                            {categoriesArray.map((cat, cIdx) => (
                              <Grid item xs={6} sm={4} md={2.4} key={cIdx}>
                                <Card sx={{ bgcolor: getHealthCardColor(cat.status), color: "white", minHeight: 90 }}>
                                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                                    <Typography variant="caption" fontWeight={700} textTransform="uppercase" display="block" color="inherit">
                                      {cat.name || `Cat ${cIdx + 1}`}
                                    </Typography>
                                    <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", my: 0.5 }} />
                                    <Typography variant="caption" display="block" color="inherit" sx={{ opacity: 0.85 }}>
                                      {formatHealthTime(cat.time || cat.last_seen || cat.timestamp)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color="inherit" sx={{ fontSize: "0.7rem" }}>
                                      {(cat.status || "unknown").replace(/_/g, " ")}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Alert table */}
                      {alertsArray.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} mb={1}>Alert / Packet Type Reference</Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead sx={{ bgcolor: "grey.50" }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600 }}>Packet Type</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Alert ID</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Available</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Last Seen</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {alertsArray.map((row, rIdx) => {
                                  const isAvail =
                                    row.available === true ||
                                    row.available === "available" ||
                                    row.status === "available";
                                  return (
                                    <TableRow key={rIdx}>
                                      <TableCell>{row.packet_type || row.packetType || "—"}</TableCell>
                                      <TableCell>{row.alert_id || row.alertId || "—"}</TableCell>
                                      <TableCell>{row.trigger || row.description || "—"}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={isAvail ? "available" : "not available"}
                                          size="small"
                                          sx={{
                                            bgcolor: isAvail ? "#22c55e" : "#f59e0b",
                                            color: "white", fontWeight: 600, fontSize: 10, height: 18,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>{formatHealthTime(row.last_seen || row.lastSeen)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      {categoriesArray.length === 0 && alertsArray.length === 0 && (
                        <Alert severity="warning">No detailed health data available for this device.</Alert>
                      )}
                    </Stack>
                  )}
                </Box>
              </Paper>
            )}
          </SectionBlock>
        );
      }

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
            required documents and five VLTD devices for compatibility assessment.
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
