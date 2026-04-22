import { Grid, Button, CircularProgress, Typography,Box,Paper } from "@mui/material";
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

const DeviceModelForm = () => {
  const { t } = useTranslation();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpStep, setOtpStep] = useState(0); // 0=form, 1=model OTP, 2=cop OTP
  const [modelId, setModelId] = useState("");
  const [copId, setCopId] = useState("");
  const [deviceId, setDeviceId] = useState(""); // kept for non-cop flow
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
  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleClose = () => {
    setOpen(false);
    if (!error) {
      if (isCopFlow) {
        setOtpStep(1); // Show model OTP first
      } else {
        setShowOTP(true);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const providerList = await retriveCreatedSimProvider();
      console.log(providerList, 'providerList')
      setUpdatedFormField(prevConfig => ({
        ...prevConfig,
        eSimProviders: {
          ...prevConfig.eSimProviders,
          options: providerList,
        }
      }))
      setIsFormLoaded(true)
    }
    )()
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
      if (isCopFlow && otpStep === 1) {
        // Step 1: Verify model OTP
        await OtpServices.deviceAddOtp({ otp, device_model_id: modelId });
        setOtp("");
        setOtpStep(2); // Move to COP OTP step
      } else if (isCopFlow && otpStep === 2) {
        // Step 2: Verify COP OTP
        await OtpServices.sendCopOTP({ otp, device_model_id: copId });
        setOtpStep(0);
        setShowOTP(false);
        setOpenAlert(true);
        setAlertType("success");
        setMessage(t('deviceModelForm.modelSentForApproval'));
      } else {
        // Normal (non-COP) flow
        await OtpServices.deviceAddOtp({ otp, device_model_id: deviceId });
        setShowOTP(false);
        setOpenAlert(true);
        setAlertType("success");
        setMessage(t('deviceModelForm.modelSentForApproval'));
      }
    } catch (error) {
      console.error("Error while submitting OTP", error.message);
      setOpenAlert(true);
      setAlertType("error");
      setMessage(t('deviceModelForm.internalServerError'));
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

          const copResponse = await DeviceModelServices.copUpload(copPayload);
          setModelId(newModelId);
          setCopId(copResponse?.data?.id || "");
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
    <AutoHideAlert
      open={openAlert}
      onClose={handleCloseAlert}
      message={message}
      type={alertType}
    />

    <DialogComponent
      open={open}
      handleClose={handleClose}
      message={alert.message}
      errorList={alert.errorList}
    />

    {apiError && (
      <Alert severity="error">
        <AlertTitle>
          {t(
            "deviceModelForm.internalServerError"
          )}
        </AlertTitle>
        {t(
          "deviceModelForm.unableToFetchData"
        )}
      </Alert>
    )}

    <Grid container spacing={gridSpacing}>
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "rgba(255,255,255,.72)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center"
          }}
        >
          <CircularProgress
            size={50}
          />
        </div>
      )}

      <Grid item xs={12}>
        <MainCard>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius:
                "24px",
              background:
                "linear-gradient(180deg,#ffffff,#f8fafc)",
              border:
                "1px solid #e2e8f0"
            }}
          >
            <Typography
              variant="h3"
              sx={{
                mb: 4,
                fontWeight: 800,
                color:
                  "#0f172a"
              }}
            >
              {t(
                "deviceModelForm.title"
              )}
            </Typography>

            {!showOTP &&
            otpStep === 0 ? (
              isFormLoaded && (
                <Formik
                  initialValues={
                    deviceModelInitials
                  }
                  validationSchema={
                    validationSchema
                  }
                  onSubmit={
                    handleSubmit
                  }
                  enableReinitialize
                >
                  {(formik) => (
                    <form
                      onSubmit={
                        formik.handleSubmit
                      }
                    >
                      <Grid
                        container
                        columnSpacing={
                          3
                        }
                        rowSpacing={
                          0
                        }
                      >
                        {Object.keys(
                          updatedFormFields
                        ).map(
                          (
                            field
                          ) => {
                            const tacVal =
                              formik
                                .values
                                .tac_validity;

                            const isExpired =
                              tacVal &&
                              tacVal <
                                new Date()
                                  .toISOString()
                                  .split(
                                    "T"
                                  )[0];

                            if (
                              [
                                "cop_no",
                                "cop_validity",
                                "cop_file"
                              ].includes(
                                field
                              ) &&
                              !isExpired
                            ) {
                              return null;
                            }

                            const fieldData =
                              updatedFormFields[
                                field
                              ];

                            return (
                              <Grid
                                key={
                                  field
                                }
                                item
                                xs={
                                  12
                                }
                                sm={
                                  6
                                }
                                md={
                                  4
                                }
                              >
                                <Typography
                                  sx={{
                                    fontSize:
                                      "14px",
                                    fontWeight: 700,
                                    color:
                                      "#334155",
                                    lineHeight: 1.4,
                                    minHeight:
                                      "42px",
                                    display:
                                      "flex",
                                    alignItems:
                                      "flex-end",
                                    wordBreak:
                                      "break-word"
                                  }}
                                >
                                  {t(
                                    fieldData.label
                                  )}
                                </Typography>

                                <Box
                                  sx={{
                                    "& .MuiInputLabel-root":
                                      {
                                        display:
                                          "none"
                                      },

                                    "& .MuiOutlinedInput-root":
                                      {
                                        borderRadius:
                                          "14px",
                                        background:
                                          "#fff",
                                        minHeight:
                                          "54px"
                                      },

                                    "& input":
                                      {
                                        padding:
                                          "14px"
                                      },

                                    "& textarea":
                                      {
                                        padding:
                                          "14px"
                                      },

                                    "& .MuiButton-root":
                                      {
                                        borderRadius:
                                          "14px"
                                      },

                                    "& a, & span":
                                      {
                                        color:
                                          "#334155 !important"
                                      }
                                  }}
                                >
                                  <FormField
                                    fieldConfig={{
                                      ...fieldData,
                                      label:
                                        ""
                                    }}
                                    formik={
                                      formik
                                    }
                                    handleFileChange={
                                      handleFileChange
                                    }
                                  />
                                </Box>
                              </Grid>
                            );
                          }
                        )}

                        <Grid
                          item
                          xs={12}
                        >
                          <Box
                            sx={{
                              mt: 1,
                              display:
                                "flex",
                              gap: 2,
                              flexWrap:
                                "wrap"
                            }}
                          >
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={
                                loading
                              }
                              sx={{
                                px: 5,
                                py: 1.5,
                                height:
                                  "56px",
                                borderRadius:
                                  "16px",
                                fontSize:
                                  "16px",
                                fontWeight: 800,
                                textTransform:
                                  "none",
                                background:
                                  "linear-gradient(90deg,#14b8a6,#0ea5e9)",
                                boxShadow:
                                  "0 14px 30px rgba(14,165,233,.25)"
                              }}
                            >
                              {t(
                                "deviceModelForm.submitForApproval"
                              )}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                </Formik>
              )
            ) : (
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <Typography
                    align="center"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color:
                        "#0f172a"
                    }}
                  >
                    {otpStep ===
                    1 ? (
                      <>
                        Step
                        1 of
                        2:
                        Verify
                        Device
                        Model
                      </>
                    ) : otpStep ===
                      2 ? (
                      <>
                        Step
                        2 of
                        2:
                        Verify
                        COP
                      </>
                    ) : (
                      t(
                        "deviceModelForm.otpValidation"
                      )
                    )}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={5}
                >
                  <MuiOtpInput
                    value={
                      otp
                    }
                    onChange={
                      handleChange
                    }
                    length={
                      6
                    }
                  />

                  <Box
                    sx={{
                      mt: 3,
                      textAlign:
                        "center"
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={
                        handleOTPSubmit
                      }
                      sx={{
                        px: 5,
                        py: 1.5,
                        height:
                          "56px",
                        borderRadius:
                          "16px",
                        fontWeight: 800,
                        textTransform:
                          "none",
                        background:
                          "linear-gradient(90deg,#14b8a6,#0ea5e9)"
                      }}
                    >
                      {otpStep ===
                        1 &&
                      isCopFlow
                        ? "Verify & Continue"
                        : t(
                            "deviceModelForm.verifyOTP"
                          )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
        </MainCard>
      </Grid>
    </Grid>
  </>
);
};

export default DeviceModelForm;
