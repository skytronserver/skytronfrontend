import { Button, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography } from "@mui/material";
import { Formik } from "formik";
import React, { useState } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import StockServices from "../../services/StockServices";
import HomePageService from "../../services/HomePage";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { convertErrorObjectToArray } from "../../helper";
import { sendCommandFields, sendCommandInitials } from "../../formjson/sendCommand";
function SendCommand() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firmwareDialogOpen, setFirmwareDialogOpen] = useState(false);
    const [firmwareVersion, setFirmwareVersion] = useState("");
    const [currentImei, setCurrentImei] = useState("");
    const [isFetchingFirmware, setIsFetchingFirmware] = useState(false);
    const [alert, setAlert] = useState({
        error: false,
        message: "",
        errorList: [],
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleAlert = (message) => {
        setAlert((prevAlert) => ({ ...prevAlert, message: message }));
        setOpen(true);
    };

    const validationSchema = Yup.object(
        Object.keys(sendCommandFields).reduce((acc, field) => {
            acc[field] = sendCommandFields[field].validation;
            return acc;
        }, {})
    );

    const sendCommandService = async (formData) => {
        try {
            const response = await SettingService.send_command(formData);
            return { code: "200", message: response.data };
        } catch (error) {
            console.error("Error sending command:", error);
            return {
                code: "400",
                message: error.message,
                errors: error.response?.data,
            };
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setSubmitting(true);
        setLoading(true);

        // Check if command starts with "GET" and use "0*" as value
        const isGetCommand = values.selected_command.toUpperCase().startsWith("GET");
        const payload = {
            imei: values.imei,
            command_base: `@${values.selected_command}`,
            value: isGetCommand ? "0*" : `${values.input_value}*`,
        };

        const fallbackFinalCommand = `@@${values.selected_command}${isGetCommand ? "*" : `${values.input_value}*`}`;

        const resp = await sendCommandService(payload);
        if (resp.code === "200") {
            const imeiFromResponse = resp?.message?.imei ?? values.imei;
            const finalCommandFromResponse = resp?.message?.final_command ?? fallbackFinalCommand;
            const normalizedFinalCommand = String(finalCommandFromResponse)
                .replace(/^@{3,}/, "@@")
                .replace(/\*$/, "");

            let firmwareVersion = "N/A";
            try {
                const gpsResp = await HomePageService.getGpsDataLog({ search: imeiFromResponse });
                const dataString = gpsResp?.data?.data;
                const parsed = dataString ? JSON.parse(dataString) : [];
                const list = Array.isArray(parsed) ? parsed : [];

                for (const item of list) {
                    const raw = item?.fields?.raw_data;
                    if (!raw || typeof raw !== "string") continue;

                    // Expected format sample: ",PVT,SKIN,1.0.0,NR,01,..."
                    // Firmware version is the token immediately after "SKIN".
                    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
                    const skinIdx = parts.findIndex((p) => p.toUpperCase() === "SKIN");
                    if (skinIdx >= 0 && parts[skinIdx + 1]) {
                        firmwareVersion = parts[skinIdx + 1];
                    }

                    // Fallback: find a semver-like token anywhere in raw string.
                    if (firmwareVersion === "N/A") {
                        const m = raw.match(/\b\d+\.\d+\.\d+\b/);
                        if (m?.[0]) firmwareVersion = m[0];
                    }

                    if (firmwareVersion !== "N/A") break;
                }
            } catch (e) {
                firmwareVersion = "N/A";
            }

            setAlert((prevAlert) => ({
                ...prevAlert,
                error: false,
                errorList: [],
            }));
            handleAlert(
                `${normalizedFinalCommand} send to device with ${imeiFromResponse}<br/>Firmware Version: ${firmwareVersion}`
            );
            setSubmitting(false);
            setLoading(false);
            resetForm(sendCommandInitials);

            // Open dialog immediately so user sees the "Confirm Submit" button and status
            setCurrentImei(values.imei);
            setFirmwareDialogOpen(true);
            setFirmwareVersion(""); // Clear initially

            // Function to fetch firmware with polling
            const fetchFirmwareWithPolling = async (attempts = 5) => {
                setIsFetchingFirmware(true);
                const rawImei = values.imei;
                const imeiToSearch = rawImei ? rawImei.toString().trim() : "";

                console.log("Starting automatic firmware fetch for IMEI:", imeiToSearch);
                if (!imeiToSearch) {
                    setIsFetchingFirmware(false);
                    return;
                }

                for (let i = 0; i < attempts; i++) {
                    try {
                        // 1. Try GPS Data Log API (User Specified - Highly accurate)
                        try {
                            const gpsLogResp = await HomePageService.getGpsDataLog({ search: imeiToSearch });

                            if (gpsLogResp.data) {
                                let logData = gpsLogResp.data.data || gpsLogResp.data;
                                let logs = [];
                                try {
                                    logs = typeof logData === 'string' ? JSON.parse(logData) : logData;
                                } catch (pe) {
                                    console.error("Error parsing GPS log JSON:", pe);
                                }

                                if (Array.isArray(logs) && logs.length > 0) {
                                    const rawData = logs[0].fields?.raw_data || logs[0].raw_data;
                                    if (rawData) {
                                        console.log("Found raw data in GPS log:", rawData);
                                        const parts = rawData.split(',');

                                        let foundVersion = "";

                                        // Pattern 1: Regex for @PREFIX-VERSION or @PREFIX,VERSION
                                        const match = rawData.match(/@[\w]+[-|,]?([\d.]+)/);
                                        if (match) {
                                            foundVersion = match[1];
                                        }

                                        // Pattern 2: Search deeper into parts (index 3 found in logs: SKTN,1.0.0)
                                        if (!foundVersion) {
                                            // Search first 6 parts for any string like X.Y.Z or X.Y
                                            for (let part of parts.slice(0, 7)) {
                                                const cleaned = part.replace('@', '').replace('*', '').trim();
                                                // Version pattern: starts with digit, contains dot, only digits and dots
                                                if (/^\d[\d.]*\d$/.test(cleaned) && cleaned.includes('.')) {
                                                    foundVersion = cleaned;
                                                    break;
                                                }
                                            }
                                        }

                                        if (foundVersion) {
                                            console.log("Successfully extracted firmware version:", foundVersion);
                                            setFirmwareVersion(foundVersion);
                                            setIsFetchingFirmware(false);
                                            return;
                                        }
                                    }
                                }
                            }
                        } catch (gpsErr) {
                            console.error("GPS Log API Failure:", gpsErr.message);
                        }

                        // 2. Fallback to Stock Filter (Fixing 400 error)
                        try {
                            let stockResp;
                            try {
                                stockResp = await StockServices.stockFilter({ search: imeiToSearch });
                            } catch (e) {
                                // Try again with empty but valid object to list all and then find
                                stockResp = await StockServices.stockFilter({ is_tagged: "True" });
                            }

                            const devices = stockResp.data?.data || stockResp.data || [];
                            if (Array.isArray(devices)) {
                                const deviceData = devices.find(d =>
                                    d.imei === imeiToSearch || d.device_id === imeiToSearch || d.id === imeiToSearch
                                );

                                if (deviceData && (deviceData.firmware_version || deviceData.version)) {
                                    const v = deviceData.firmware_version || deviceData.version;
                                    setFirmwareVersion(v);
                                    setIsFetchingFirmware(false);
                                    return;
                                }
                            }
                        } catch (stockErr) {
                            console.error("Stock Filter Fallback Failure:", stockErr.message);
                        }

                    } catch (err) {
                        console.error(`Attempt ${i + 1} overall failure:`, err);
                    }
                    if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, 3000));
                }
                setIsFetchingFirmware(false);
            };

            // Start fetching in the background
            fetchFirmwareWithPolling();
        } else {
            setAlert((prevAlert) => ({
                ...prevAlert,
                error: true,
                errorList: convertErrorObjectToArray(resp.errors),
            }));
            handleAlert("Failed to send command");
            setLoading(false);
        }
    };

    const handleFirmwareConfirm = () => {
        if (!firmwareVersion.trim()) {
            alert("Please enter firmware version");
            return;
        }
        console.log("Firmware version confirmed:", firmwareVersion);
        // You can add API call here to save firmware version if needed
        setFirmwareDialogOpen(false);
        setFirmwareVersion("");
        handleAlert(`Firmware version ${firmwareVersion} confirmed successfully`);
    };

    const handleFirmwareCancel = () => {
        setFirmwareDialogOpen(false);
        setFirmwareVersion("");
    };

    return (
        <>
            <DialogComponent
                open={open}
                handleClose={handleClose}
                message={alert.message}
                errorList={alert.errorList}
            />

            {/* Firmware Version Confirmation Dialog */}
            <Dialog open={firmwareDialogOpen} onClose={handleFirmwareCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Firmware Version Confirmation</DialogTitle>
                <DialogContent>
                    <p style={{ marginBottom: "20px", fontSize: "15px" }}>
                        Command has been queued successfully.
                    </p>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#666", flexGrow: 1 }}>
                            {firmwareVersion ? "Firmware version retrieved successfully:" : isFetchingFirmware ? "Fetching firmware version automatically..." : "Firmware version status:"}
                        </Typography>
                        {isFetchingFirmware && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </Box>

                    <Box sx={{
                        mt: 2,
                        p: 3,
                        bgcolor: '#f8f9fa',
                        borderRadius: 2,
                        textAlign: 'center',
                        border: '1px solid #e0e0e0'
                    }}>
                        {isFetchingFirmware ? (
                            <Typography variant="h5" color="textSecondary">Searching...</Typography>
                        ) : (
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                {firmwareVersion || "Value Not Found"}
                            </Typography>
                        )}
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Current Firmware Version
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => {
                            setFirmwareVersion("");
                            // Re-trigger the logic if user clicks refresh
                            const fetchOnce = async () => {
                                setIsFetchingFirmware(true);
                                const imeiToSearch = currentImei ? currentImei.toString().trim() : "";
                                if (!imeiToSearch) {
                                    setIsFetchingFirmware(false);
                                    return;
                                }
                                try {
                                    // 1. GPS Data Log API
                                    try {
                                        const gpsLogResp = await HomePageService.getGpsDataLog({ search: imeiToSearch });
                                        if (gpsLogResp.data) {
                                            const logData = gpsLogResp.data.data || gpsLogResp.data;
                                            const logs = typeof logData === 'string' ? JSON.parse(logData) : logData;

                                            if (Array.isArray(logs) && logs.length > 0) {
                                                const rawData = logs[0].fields?.raw_data || logs[0].raw_data;
                                                if (rawData) {
                                                    const match = rawData.match(/@[\w]+[-|,]?([\d.]+)/);
                                                    let foundVersion = match ? match[1] : "";

                                                    if (!foundVersion) {
                                                        const parts = rawData.split(',');
                                                        for (let part of parts.slice(0, 7)) {
                                                            const cleaned = part.replace('@', '').replace('*', '').trim();
                                                            if (/^\d[\d.]*\d$/.test(cleaned) && cleaned.includes('.')) {
                                                                foundVersion = cleaned;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (foundVersion) {
                                                        setFirmwareVersion(foundVersion);
                                                        setIsFetchingFirmware(false);
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    } catch (e) { }

                                    // 2. Fallback
                                    try {
                                        let stockResp;
                                        try {
                                            stockResp = await StockServices.stockFilter({ search: imeiToSearch });
                                        } catch (e) {
                                            stockResp = await StockServices.stockFilter({ is_tagged: "True" });
                                        }
                                        const devices = stockResp.data?.data || stockResp.data || [];
                                        const deviceData = Array.isArray(devices) ? devices.find(d =>
                                            d.imei === imeiToSearch || d.device_id === imeiToSearch || d.id === imeiToSearch
                                        ) : null;
                                        if (deviceData) setFirmwareVersion(deviceData.firmware_version || deviceData.version || "");
                                    } catch (e) { }
                                } catch (e) { }
                                setIsFetchingFirmware(false);
                            };
                            fetchOnce();
                        }}
                        sx={{ mr: 'auto' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleFirmwareCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFirmwareConfirm}
                    >
                        Confirm Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container spacing={gridSpacing}>
                {loading && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 9999,
                            background: "rgba(255, 255, 255, 0.8)",
                        }}
                    >
                        <CircularProgress
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                            size={50}
                        />
                    </div>
                )}
                <Grid
                    item
                    xs={12}
                    md={6}
                    style={{
                        opacity: loading ? 0.5 : 1,
                        transition: "opacity 0.3s ease-in-out",
                    }}
                >
                    <MainCard title="Send Command">
                        <Formik
                            initialValues={sendCommandInitials}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {(formik) => {
                                // Check if selected command starts with "GET"
                                const isGetCommand = formik.values.selected_command.toUpperCase().startsWith("GET");

                                return (
                                    <form onSubmit={formik.handleSubmit}>
                                        <Grid container spacing={2} className="form-controller">
                                            {Object.keys(sendCommandFields).map((field) => {
                                                // Hide input_value field if command starts with "GET"
                                                if (field === "input_value" && isGetCommand) {
                                                    return null;
                                                }
                                                return (
                                                    <Grid key={field} item xs={12}>
                                                        <FormField
                                                            fieldConfig={sendCommandFields[field]}
                                                            formik={formik}
                                                        />
                                                    </Grid>
                                                );
                                            })}
                                            <Grid item xs={12} style={{ marginTop: "20px" }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={loading}
                                                >
                                                    Submit
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                );
                            }}
                        </Formik>
                    </MainCard>
                </Grid>
            </Grid>
        </>
    );
}

export default SendCommand;
