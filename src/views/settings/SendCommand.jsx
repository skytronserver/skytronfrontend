import { Autocomplete, Button, CircularProgress, FormControl, Grid, TextField } from "@mui/material";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import HomePageService from "../../services/HomePage";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { convertErrorObjectToArray } from "../../helper";
import { sendCommandFields, sendCommandInitials } from "../../formjson/sendCommand";
import TaggingService from "../../services/TaggingService";

function SendCommand() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadVehicles, setLoadVehicles] = useState(true);
    const [vehicleList, setVehicleList] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const searchTimeoutRef = useRef(null);
    const [alert, setAlert] = useState({
        error: false,
        message: "",
        errorList: [],
    });

    const fetchVehicleList = async (searchQuery = "") => {
        try {
            setLoadVehicles(false);
            const response = await TaggingService.getOwnerList({ search: searchQuery });

            const vehicles = Array.isArray(response) ? response : response?.data || [];

            const transformedVehicles = vehicles.map((vehicle) => {
                return {
                    id: vehicle.id,
                    device_id: vehicle.device?.id,
                    device_tag_id: vehicle.id,
                    vehicle_reg_no: vehicle.vehicle_reg_no,
                    vehicle_owner: vehicle.vehicle_owner,
                    device: vehicle.device,
                    label: `${vehicle.vehicle_reg_no} (${vehicle.device?.device_esn || "N/A"})`,
                };
            });

            const filteredVehicles = searchQuery
                ? transformedVehicles.filter(
                      (v) =>
                          v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.vehicle_reg_no &&
                              v.vehicle_reg_no.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                : transformedVehicles;

            setVehicleList(filteredVehicles);
            setLoadVehicles(true);
        } catch (error) {
            console.error("Error fetching vehicle list:", error);
            setLoadVehicles(true);
        }
    };

    const handleVehicleInputChange = (event, newInputValue, reason) => {
        if (reason === "input") {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            if (newInputValue && newInputValue.length >= 2) {
                setLoadVehicles(false);
                searchTimeoutRef.current = setTimeout(() => {
                    fetchVehicleList(newInputValue);
                }, 500);
            } else {
                setVehicleList([]);
                setLoadVehicles(true);
            }
        }
    };

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

        const imeiToSend = selectedVehicle?.device?.device_esn;

        // Check if command starts with "GET" and use "0*" as value
        const isGetCommand = values.selected_command.toUpperCase().startsWith("GET");
        const payload = {
            imei: imeiToSend,
            command_base: `@${values.selected_command}`,
            value: isGetCommand ? "0*" : `${values.input_value}*`,
        };

        const fallbackFinalCommand = `@@${values.selected_command}${isGetCommand ? "*" : `${values.input_value}*`}`;

        const resp = await sendCommandService(payload);
        if (resp.code === "200") {
            const imeiFromResponse = imeiToSend;
            const finalCommandFromResponse = resp?.message?.final_command ?? fallbackFinalCommand;
            const normalizedFinalCommand = String(finalCommandFromResponse)
                .replace(/^@{3,}/, "@@")
                .replace(/\*$/, "");

            let firmwareVersion = "N/A";
            let imeiForPopup = "";
            try {
                const extractFw = (gpsResp) => {
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
                            return parts[skinIdx + 1];
                        }

                        // Fallback: find a semver-like token anywhere in raw string.
                        const m = raw.match(/\b\d+\.\d+\.\d+\b/);
                        if (m?.[0]) return m[0];
                    }

                    return "N/A";
                };

                const extractImei = (gpsResp) => {
                    const dataString = gpsResp?.data?.data;
                    const parsed = dataString ? JSON.parse(dataString) : [];
                    const list = Array.isArray(parsed) ? parsed : [];

                    for (const item of list) {
                        const fields = item?.fields;
                        const directImei =
                            fields?.imei ||
                            fields?.device_imei ||
                            fields?.imei_no ||
                            fields?.device_esn ||
                            fields?.esn;

                        if (directImei) return String(directImei);

                        const raw = fields?.raw_data;
                        if (!raw || typeof raw !== "string") continue;

                        // Try to find a 15-digit IMEI in raw string.
                        const m15 = raw.match(/\b\d{15}\b/);
                        if (m15?.[0]) return m15[0];

                        // Fallback: some devices send 14-17 digit identifiers.
                        const m = raw.match(/\b\d{14,17}\b/);
                        if (m?.[0]) return m[0];
                    }

                    return "";
                };

                // Prefer looking up by Vehicle Reg No, fallback to IMEI.
                try {
                    const gpsByReg = await HomePageService.getGpsDataLog({ regno: values.vehicle_reg_no });
                    firmwareVersion = extractFw(gpsByReg);
                    imeiForPopup = extractImei(gpsByReg);
                } catch (e) {
                    firmwareVersion = "N/A";
                }

                if (firmwareVersion === "N/A") {
                    const gpsByImei = await HomePageService.getGpsDataLog({ search: imeiFromResponse });
                    firmwareVersion = extractFw(gpsByImei);
                    if (!imeiForPopup) imeiForPopup = extractImei(gpsByImei);
                }
            } catch (e) {
                firmwareVersion = "N/A";
            }

            const imeiToShow = imeiForPopup || imeiToSend || "N/A";

            setAlert((prevAlert) => ({
                ...prevAlert,
                error: false,
                errorList: [],
            }));
            handleAlert(
                `${normalizedFinalCommand} send to device with ${values.vehicle_reg_no} (${imeiToShow})<br/>Firmware Version: ${firmwareVersion}`
            );
            setSubmitting(false);
            setLoading(false);
            resetForm(sendCommandInitials);
            setSelectedVehicle(null);
            setVehicleList([]);
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

    return (
        <>
            <DialogComponent
                open={open}
                handleClose={handleClose}
                message={alert.message}
                errorList={alert.errorList}
            />
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

                                                if (field === "vehicle_reg_no") {
                                                    const showError = Boolean(
                                                        formik.touched.vehicle_reg_no && formik.errors.vehicle_reg_no
                                                    );

                                                    return (
                                                        <Grid key={field} item xs={12}>
                                                            <FormControl fullWidth>
                                                                <Autocomplete
                                                                    value={selectedVehicle}
                                                                    onChange={(event, newValue) => {
                                                                        setSelectedVehicle(newValue);
                                                                        const reg = newValue?.vehicle_reg_no || "";
                                                                        formik.setFieldValue("vehicle_reg_no", reg);
                                                                    }}
                                                                    options={vehicleList}
                                                                    getOptionLabel={(option) =>
                                                                        option?.label || option?.vehicle_reg_no || ""
                                                                    }
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            label={sendCommandFields.vehicle_reg_no.label}
                                                                            variant="outlined"
                                                                            name="vehicle_reg_no"
                                                                            onBlur={formik.handleBlur}
                                                                            error={showError || !loadVehicles}
                                                                            helperText={
                                                                                showError
                                                                                    ? formik.errors.vehicle_reg_no
                                                                                    : !loadVehicles
                                                                                      ? "Loading..."
                                                                                      : ""
                                                                            }
                                                                        />
                                                                    )}
                                                                    onInputChange={handleVehicleInputChange}
                                                                    loading={!loadVehicles}
                                                                    loadingText="Loading..."
                                                                    disableClearable
                                                                    filterOptions={(x) => x}
                                                                    noOptionsText="Type at least 2 characters to search"
                                                                />
                                                            </FormControl>
                                                        </Grid>
                                                    );
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
                                                    disabled={loading || !selectedVehicle?.device?.device_esn}
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
