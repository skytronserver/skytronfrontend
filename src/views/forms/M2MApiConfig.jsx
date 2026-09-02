import React, { useState } from "react";
import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import {
  m2mApiConfigInitials,
  m2mApiConfigField,
} from "../../formjson/M2MApiConfig";

import M2MServices from "../../services/M2mConfigServices";

const M2MApiConfig = () => {
  const [open, setOpen] = useState(false);

  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });

  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message, isError = false, errorList = []) => {
    setAlert({
      error: isError,
      message,
      errorList,
    });

    setOpen(true);
  };

 const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  setSubmitting(true);
  setLoading(true);

  try {
    // Payload for save API
    const payload = {
      api_url: values.apiUrl,
      token: values.token,
      sample_iccid: values.sampleIccid,
    };

    console.log("M2M save payload:", payload);

    // ==========================================
    // STEP 1: SAVE M2M API CONFIGURATION
    // ==========================================
    const saveResponse = await M2MServices.saveM2MApiConfig(payload);

    console.log("M2M save response:", saveResponse.data);

    // Check save API response
    if (saveResponse?.data?.status !== "success") {
      handleAlert(
        saveResponse?.data?.message ||
          "Failed to save M2M API configuration.",
        true
      );

      return;
    }

    // ==========================================
    // STEP 2: TEST M2M API CONFIGURATION
    // ==========================================
    const testResponse = await M2MServices.testM2MApiConfig({
      api_url: values.apiUrl,
      token: values.token,
    });

    console.log("M2M test response:", testResponse.data);

    // ==========================================
    // STEP 3: SHOW TEST RESULT
    // ==========================================
    if (testResponse?.data?.status === "success") {
      handleAlert(
        testResponse?.data?.message ||
          "M2M API configuration saved and tested successfully."
      );

      resetForm();
    } else {
      handleAlert(
        testResponse?.data?.message ||
          "M2M configuration was saved, but API test failed.",
        true
      );
    }
  } catch (error) {
    console.error("M2M API configuration error:", error);

    const errorData = error?.response?.data;

    const errorMsg = errorData?.error || errorData?.message || errorData?.detail || error?.message || "Failed to process M2M API configuration.";

    if (errorMsg === "Please upload at least one IP range with its ISP certificate before completing technical onboarding.") {
      handleAlert(
        `${errorMsg} <br/><br/><a href="/device/ip-range" style="color: #2196f3; font-weight: bold; text-decoration: underline;">Go to IP Ranges</a>`,
        true
      );
    } else {
      handleAlert(errorMsg, true);
    }
  } finally {
    setSubmitting(false);
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
              position: "absolute",
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
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
            position: "relative",
          }}
        >
          <MainCard title="M2M API Configuration">
            <Formik
              initialValues={m2mApiConfigInitials}
              validationSchema={Yup.object(
                Object.keys(m2mApiConfigField).reduce((acc, field) => {
                  acc[field] = m2mApiConfigField[field].validation;
                  return acc;
                }, {})
              )}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid
                    container
                    spacing={2}
                    className="form-controller"
                  >
                    {Object.keys(m2mApiConfigField).map((field) => (
                      <Grid
                        key={field}
                        item
                        md={6}
                        sm={12}
                        xs={12}
                      >
                        <FormField
                          fieldConfig={m2mApiConfigField[field]}
                          formik={formik}
                        />
                      </Grid>
                    ))}

                    <Grid
                      item
                      xs={12}
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default M2MApiConfig;