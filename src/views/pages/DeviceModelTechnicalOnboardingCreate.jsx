import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeviceModelServices from "../../services/DeviceModelServices";

const emptyDemoDevice = () => ({
  device_serial_no: "",
  imei: "",
  ccid1: "",
  ccid2: "",
  msisdn1: "",
  msisdn2: "",
});

const DeviceModelTechnicalOnboardingCreate = () => {
  const [deviceModelId, setDeviceModelId] = useState("");
  const [userManualPdf, setUserManualPdf] = useState(null);
  const [otCommandListPdf, setOtCommandListPdf] = useState(null);
  const [demoDevices, setDemoDevices] = useState([emptyDemoDevice()]);

  const [submitting, setSubmitting] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [message, setMessage] = useState("");

  const setAlert = (type, msg) => {
    setAlertType(type);
    setMessage(msg);
    setOpenAlert(true);
  };

  const canRemoveDemoDevice = useMemo(() => demoDevices.length > 1, [demoDevices.length]);

  const handleDemoDeviceChange = (index, key, value) => {
    setDemoDevices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleAddDemoDevice = () => {
    setDemoDevices((prev) => [...prev, emptyDemoDevice()]);
  };

  const handleRemoveDemoDevice = (index) => {
    setDemoDevices((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!deviceModelId || String(deviceModelId).trim() === "") {
      return "Device Model ID is required.";
    }
    if (!userManualPdf) {
      return "User Manual PDF is required.";
    }
    if (!otCommandListPdf) {
      return "OT Command List PDF is required.";
    }
    if (!Array.isArray(demoDevices) || demoDevices.length < 1) {
      return "At least 1 demo device is required.";
    }
    for (let i = 0; i < demoDevices.length; i += 1) {
      const d = demoDevices[i] || {};
      const requiredKeys = [
        "device_serial_no",
        "imei",
        "ccid1",
        "ccid2",
        "msisdn1",
        "msisdn2",
      ];
      for (const k of requiredKeys) {
        if (!d[k] || String(d[k]).trim() === "") {
          return `Demo device ${i + 1}: ${k} is required.`;
        }
      }
    }
    return null;
  };

  const resetForm = () => {
    setDeviceModelId("");
    setUserManualPdf(null);
    setOtCommandListPdf(null);
    setDemoDevices([emptyDemoDevice()]);
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      setAlert("error", error);
      return;
    }

    setSubmitting(true);
    try {
      await DeviceModelServices.createTechnicalOnboardingRequest({
        device_model_id: deviceModelId,
        user_manual_pdf: userManualPdf,
        ot_command_list_pdf: otCommandListPdf,
        demo_devices: JSON.stringify(demoDevices),
      });
      setAlert("success", "Technical onboarding request submitted.");
      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to submit technical onboarding request.";
      setAlert("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <AutoHideAlert
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        message={message}
        type={alertType}
      />
      <Grid item xs={12}>
        <MainCard title="Technical Onboarding Request">
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Submit technical onboarding request for a device model with required documents and demo devices.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Device Model ID"
                  value={deviceModelId}
                  onChange={(e) => setDeviceModelId(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button variant="outlined" component="label" fullWidth>
                  {userManualPdf ? userManualPdf.name : "Upload User Manual (PDF)"}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={(e) => setUserManualPdf(e.target.files?.[0] || null)}
                  />
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Button variant="outlined" component="label" fullWidth>
                  {otCommandListPdf
                    ? otCommandListPdf.name
                    : "Upload OT Command List (PDF)"}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={(e) => setOtCommandListPdf(e.target.files?.[0] || null)}
                  />
                </Button>
              </Grid>
            </Grid>

            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Demo Devices</Typography>
                <Button startIcon={<AddIcon />} onClick={handleAddDemoDevice} variant="contained">
                  Add
                </Button>
              </Stack>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {demoDevices.map((d, index) => (
                  <Box
                    key={index}
                    sx={{
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: "8px",
                      p: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Device {index + 1}</Typography>
                      <IconButton
                        onClick={() => handleRemoveDemoDevice(index)}
                        disabled={!canRemoveDemoDevice}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Device Serial No"
                          value={d.device_serial_no}
                          onChange={(e) =>
                            handleDemoDeviceChange(index, "device_serial_no", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="IMEI"
                          value={d.imei}
                          onChange={(e) => handleDemoDeviceChange(index, "imei", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="CCID1"
                          value={d.ccid1}
                          onChange={(e) => handleDemoDeviceChange(index, "ccid1", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="CCID2"
                          value={d.ccid2}
                          onChange={(e) => handleDemoDeviceChange(index, "ccid2", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="MSISDN1"
                          value={d.msisdn1}
                          onChange={(e) =>
                            handleDemoDeviceChange(index, "msisdn1", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="MSISDN2"
                          value={d.msisdn2}
                          onChange={(e) =>
                            handleDemoDeviceChange(index, "msisdn2", e.target.value)
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={resetForm} disabled={submitting}>
                Reset
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DeviceModelTechnicalOnboardingCreate;
