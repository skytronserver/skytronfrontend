import { Grid, Button, CircularProgress, Typography } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { convertErrorObjectToArray,retriveCreatedSimProvider } from "../../helper";
import { MuiOtpInput } from "mui-one-time-password-input";
import {deviceModelInitials,deviceModelFormField} from "../../formjson/deviceModel";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import AutoHideAlert from "../../ui-component/AutoHideAlert"
const DeviceModelForm = () => {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType,setAlertType]=useState("success");
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields,setUpdatedFormField]=useState(deviceModelFormField);
  const [isFormLoaded,setIsFormLoaded]=useState(false);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error,setError]=useState(false);
  const [apiError,setApiError]=useState(false);
  const handleChange = (newValue) => {
    setOtp(newValue);
  };
 
  const handleClose = () => {
    setOpen(false);
    !error && setShowOTP(true);
  };

  useEffect(()=>{
    (async()=>{
    const providerList=await retriveCreatedSimProvider();
    setUpdatedFormField(prevConfig =>({
      ...prevConfig,
      eSimProviders: {
        ...prevConfig.eSimProviders,
        options: providerList,
      }
    }))
    setIsFormLoaded(true)
    }
  )()
  },[]);

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };
  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  const handleOTPSubmit = async () => {
    const OTPData = {
      otp: otp,
      device_model_id: deviceId,
    };
    try {
      await OtpServices.deviceAddOtp(OTPData);
      setShowOTP(false);
      setOpenAlert(true);
      setAlertType("success")
      setMessage('Model has been sent successfully for approval to state admin');
    } catch (error) {
      console.error("Error while submitting data", error.message);
      setOpenAlert(true);
      setAlertType("error")
      setMessage('Internal Server Error ! Please try again');
    }
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userData = sessionStorage.getItem('cookiesData');
      const userId = userData?.split("-")[3];
  
      setSubmitting(true);
      setLoading(true);
  
      const updatedValues = {
        ...values,
        approval: "0",
        approved_by: "",
        created_by: userId,
      };
  
      const response = await DeviceModelServices.createModel(updatedValues);
  
      if (response?.data) {
        setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
        handleAlert("An OTP has been sent to your registered mobile number. Please click below to continue to enter the OTP");
        resetForm(deviceModelInitials);
        setDeviceId(response.data.id);
      }
    } catch (error) {
      console.error("Error while submitting data", error.message);
  
      if (!error.response) {
        setApiError(true);
      } else {
        setAlert((prevAlert) => ({
          ...prevAlert,
          error: true,
          errorList: convertErrorObjectToArray(error.response.data),
        }));
      }
      
      handleAlert("Form Not Submitted");
      setError(true);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };
  

  return (
    <>
      <AutoHideAlert open={openAlert} onClose={handleCloseAlert} message={message} type={alertType}/>
      <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />
      {apiError && (
          <Alert severity="error">
            <AlertTitle>Internal Server Error</AlertTitle>
            Unable to fetch data. An error occurred while retrieving data from the server. Please contact the server administrator.
          </Alert>
        )}
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
          <MainCard title="Device Model Entry">
            {!showOTP ? (
              isFormLoaded && (<Formik
                initialValues={deviceModelInitials}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(updatedFormFields).map((field) => (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={updatedFormFields[field]}
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
                          Submit For Approval
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>)
            ) : (
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
              > 
                <Grid item xs={12}>
                  <p>Please validate your submission by entering the OTP sent to your registered mobile no.</p>
                </Grid>
                <Grid item xs={12} md="5">
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
};

export default DeviceModelForm;
