import { Grid, Button, CircularProgress, Typography } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DeviceModelServices from "../../services/DeviceModelServices";
import OtpServices from "../../services/OtpServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { convertErrorObjectToArray, retriveCreatedSimProvider } from "../../helper";
import { MuiOtpInput } from "mui-one-time-password-input";
import { deviceModelInitials, deviceModelFormField } from "../../formjson/deviceModel";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import AutoHideAlert from "../../ui-component/AutoHideAlert"
import { useTranslation } from 'react-i18next';
import TestAgencyServices from "../../services/TestAgencyServices";

const DeviceModelForm = () => {
  const { t } = useTranslation();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [modelId, setModelId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(deviceModelFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isCopFlow, setIsCopFlow] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleClose = () => {
    setOpen(false);
    if (!error) {
      setShowOTP(true);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [providerList, agencyRes] = await Promise.all([
          retriveCreatedSimProvider(),
          TestAgencyServices.getNameList().catch(() => ({ data: [] }))
        ]);

        const agencyData = Array.isArray(agencyRes?.data) ? agencyRes.data : [];
        setAgencies(agencyData);

        const agencyOptions = agencyData.map(item => ({ 
              value: item.agency_name || item.name || item.id, 
              label: item.agency_name || item.name 
            }));

        setUpdatedFormField(prevConfig => ({
          ...prevConfig,
          eSimProviders: {
            ...prevConfig.eSimProviders,
            options: providerList,
          },
          test_agency: {
            ...prevConfig.test_agency,
            options: agencyOptions,
          }
        }));
        setIsFormLoaded(true);
      } catch (err) {
        console.error("Error loading form dependencies", err);
        setIsFormLoaded(true);
      }
    })();
  }, []);

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
  const handleAgencyChange = (event, formik) => {
    const val = event.target.value;
    const agency = agencies.find(item => (item.id === val || item.agency_name === val || item.name === val));
    if (agency) {
      formik.setFieldValue("agency_address", agency.address || "");
      formik.setFieldValue("agency_pincode", agency.pincode || "");
    } else {
      formik.setFieldValue("agency_address", "");
      formik.setFieldValue("agency_pincode", "");
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
    try {
      const idToVerify = isCopFlow ? modelId : deviceId;
      await OtpServices.deviceAddOtp({ otp, device_model_id: idToVerify });
      
      setShowOTP(false);
      setOpenAlert(true);
      setAlertType("success");
      setMessage(t('deviceModelForm.modelSentForApproval'));
    } catch (error) {
      console.error("Error while submitting OTP", error.message);
      setOpenAlert(true);
      setAlertType("error");
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 403) {
        setMessage(t('deviceModelForm.wrongOtp') || "WRONG OTP");
      } else {
        setMessage(t('deviceModelForm.internalServerError'));
      }
    }
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userData = sessionStorage.getItem('cookiesData');
      const userId = userData?.split("-")[3];

      setSubmitting(true);
      setLoading(true);

      const isExpired = values.tac_validity && values.tac_validity < new Date().toISOString().split('T')[0];
      setIsCopFlow(isExpired);

      // Always send device model fields only to createModel
      const modelPayload = new FormData();
      modelPayload.append("eSimProviders", values.eSimProviders);
      modelPayload.append("model_name", values.model_name);
      modelPayload.append("test_agency", values.test_agency);
      modelPayload.append("tac_no", values.tac_no);
      modelPayload.append("tac_validity", values.tac_validity);
      modelPayload.append("vendor_id", values.vendor_id);
      modelPayload.append("hardware_version", values.hardware_version);
      modelPayload.append("tac_doc_path", values.tac_doc_path);
      modelPayload.append("approval", "0");
      modelPayload.append("approved_by", "");
      modelPayload.append("created_by", userId || "");

      // Step 1: Always create the device model first
      const modelResponse = await DeviceModelServices.createModel(modelPayload);

      if (modelResponse?.data) {
        const newModelId = modelResponse.data.id;

        if (isExpired) {
          // Step 2: Upload COP using the new model ID
          const copPayload = new FormData();
          copPayload.append("device_model", newModelId);
          copPayload.append("cop_no", values.cop_no);
          copPayload.append("cop_validity", values.cop_validity);
          copPayload.append("cop_file", values.cop_file);
          copPayload.append("approval", "0");
          copPayload.append("approved_by", "");
          copPayload.append("created_by", userId || "");
          copPayload.append("new_model_create", "1");

          const copResponse = await DeviceModelServices.copUpload(copPayload);
          setModelId(newModelId);
        } else {
          setDeviceId(newModelId);
        }

        setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
        handleAlert("An OTP has been sent to your registered mobile number. Please click below to continue to enter the OTP");
        resetForm(deviceModelInitials);
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
      <AutoHideAlert open={openAlert} onClose={handleCloseAlert} message={message} type={alertType} />
      <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />
      {apiError && (
        <Alert severity="error">
          <AlertTitle>{t('deviceModelForm.internalServerError')}</AlertTitle>
          {t('deviceModelForm.unableToFetchData')}
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
          <MainCard title={t('deviceModelForm.title')}>
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
                      {Object.keys(updatedFormFields).map((field) => {
                        const tacVal = formik.values.tac_validity;
                        const isExpired = tacVal && tacVal < new Date().toISOString().split('T')[0];
                        if (['cop_no', 'cop_validity', 'cop_file'].includes(field) && !isExpired) {
                          return null;
                        }
                        return (
                          <Grid key={field} item md={6} sm={12} xs={12}>
                            <FormField
                              fieldConfig={updatedFormFields[field]}
                              formik={formik}
                              handleFileChange={handleFileChange}
                              handleOptionChange={field === 'test_agency' ? (e) => handleAgencyChange(e, formik) : undefined}
                            />
                          </Grid>
                        )
                      })}
                      <Grid item xs={12} style={{ marginTop: "20px" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          {t('deviceModelForm.submitForApproval')}
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
                  <p>{t('deviceModelForm.otpValidation')}</p>
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
                      {t('deviceModelForm.verifyOTP')}
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
