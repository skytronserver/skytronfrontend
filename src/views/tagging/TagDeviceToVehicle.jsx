import { Button, CircularProgress, Grid ,Typography} from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import TaggingService from "../../services/TaggingService";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "ui-component/cards/MainCard";
import DialogComponent from "ui-component/DialogComponent";
import { convertErrorObjectToArray } from "helper";
import { taggingFields,taggingInitials } from "../../formjson/tagDeviceToVehicle";
import { MuiOtpInput } from "mui-one-time-password-input";
function TagDeviceToVehicle() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [otp, setOtp] = useState("");
  const [error,setError]=useState(false)
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  
  const handleClose = () => {
    if(error){
      setOpen(false);
      setShowOTP(false);
      setError(false);
    }else{
      setOpen(false);
      setShowOTP(true);
    }
   
  };
  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_id: deviceId,
    };
    const response = await handleOTPValidation(OTPData);

    if (response.code === "200") {
      console.log(response);
      setShowOTP(false);
    } else {
      console.log(response.error);
    }
  };
  const handleOTPValidation = async (modelOtpData) => {
    try {
      const response = await TaggingService.tagVerifyDealerOtp(modelOtpData);
      console.log("Device Model is OTP Verified", response.data);
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error while submitting data", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };
 
  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };
  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const validationTagging = Yup.object(
    Object.keys(taggingFields).reduce((acc, field) => {
      acc[field] = taggingFields[field].validation;
      return acc;
    }, {})
  );
  const tagDevice = async (formData) => {
    try {
      const response = await TaggingService.tagDeviceToVehicle(formData);
      console.log("Tagged successfully", response.data);
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error in API Service:", error.message);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };
  const handleTagging = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setSubmitting(true);
    setLoading(true);
    const resp = await tagDevice(values);
    if (resp.code === "200") {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: false,
        errorList: [],
      }));
      handleAlert("Tagged Successfully");
      setSubmitting(false);
      setLoading(false);
      resetForm(taggingInitials);
      setDeviceId(resp.message.data.device);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(resp.errors),
      }));
      handleAlert("Form Not Submitted");
      setLoading(false);
      setError(true)
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
          }}
        >
          <MainCard title="Tag Device to Vehicle">
          {!showOTP ? (
            <Formik
              initialValues={taggingInitials}
              validationSchema={validationTagging}
              onSubmit={handleTagging}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(taggingFields).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={taggingFields[field]}
                          formik={formik}
                          handleFileChange={handleFileChange}
                        />
                      </Grid>
                    ))}
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
              )}
            </Formik>
             ) : (
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={12} md={5}>
                  <MuiOtpInput value={otp} onChange={handleChange} length={6} />
                  <br />
                  <Typography align="center">
                    <Button
                      color="primary"
                      size="large"
                      type="submit"
                      variant="contained"
                      onClick={handleOTPSubmit}
                    >
                      Verify OTP
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
export default TagDeviceToVehicle;
