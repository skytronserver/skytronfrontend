import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import OTPComponent from "../../ui-component/OTPComponent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";
import CustomLoader from "../../ui-component/CustomLoader";
const ModelExtension = ({ fieldConfig, initialData, formTitle }) => {
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_model_id: deviceId,
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
      const response = await OtpServices.sendCopOTP(modelOtpData);
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };
  const handleModelChange = (event, formik) => {
    const fieldName = event.target.name;
    if (fieldName == "device_model") {
      console.log(event.target.value);
      (async () => {
        const getDetailsOf = {
          device_model_id: event.target.value,
        };
        try {
          const retrieveData = await DeviceModelServices.getModel(getDetailsOf);
          console.log(retrieveData.data);

          formik.setFieldValue("testAgency", retrieveData.data.test_agency);
          formik.setFieldValue("tacNo", retrieveData.data.tac_no);
          formik.setFieldValue("tacValidity", retrieveData.data.tac_validity);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Data not found");
          } else {
            console.log("An error occurred while fetching data");
          }
        }
      })();
    }
  };
  const validationSchema = Yup.object(
    Object.keys(fieldConfig).reduce((acc, field) => {
      acc[field] = fieldConfig[field].validation;
      return acc;
    }, {})
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const updatedValues = {
      ...values,
      approval: "0",
      approved_by: "",
      vendor_id: "32",
      created_by: "31",
    };
    try {
      const response = await DeviceModelServices.copUpload(updatedValues);
      setDeviceId(response.data.id);
      setLoading(false);
      setShowOTP(true);
    } catch (error) {
      console.error("Error :", error.message);
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
        {loading && <CustomLoader />}
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="Device Model Extension">
            {!showOTP ? (
              <Formik
                initialValues={initialData}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(fieldConfig).map((field) => (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={fieldConfig[field]}
                            formik={formik}
                            handleFileChange={handleFileChange}
                            handleOptionChange={handleModelChange}
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
                          Submit For Approval
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            ) : (
              <OTPComponent
                otp={otp}
                handleChange={handleChange}
                handleOTPSubmit={handleOTPSubmit}
              />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ModelExtension;
