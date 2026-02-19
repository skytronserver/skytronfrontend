import { Button, CircularProgress, Grid } from "@mui/material";
import { Formik } from "formik";
import React, { useState } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
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
