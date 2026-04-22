import {
  Grid, Button, CircularProgress, Box,
  Typography,
  Paper
} from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { convertErrorObjectToArray, fetchEsimProvider, retriveStateList, retriveCreatedSimProvider } from "../../helper";
import { manufacturerInitialValues, manufacturerFormField } from "../../formjson/manufacturer";

const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

const Manufacturer = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(manufacturerFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // Debug translations
  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Translation test:', t('manufacturer.title'));
    console.log('Available languages:', i18n.languages);
    console.log('Translation resources:', i18n.options.resources);
  }, [i18n, t]);

  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
          options: stateList
        }
      }));
      setIsFormLoaded(true);
    })();
  }, []);

  const handleStateChange = (event, formik) => {
    const fieldName = event.target.name;
    if (fieldName === "state") {
      (async () => {
        const getDetailsOf = {
          state: event.target.value,
        };
        try {
          const eSimProvider = await retriveCreatedSimProvider(getDetailsOf);
          setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            esimProvider: {
              ...prevConfig.esimProvider,
              options: eSimProvider,
            },
          }));
        } catch (error) {
          console.log(error)
        }
      })();
    }
  };

  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: t(message) }));
    setOpen(true);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.currentTarget.files[0];
    const fieldName = event.target.name;
    const errors = {};
    if (selectedFile) {
      console.log("Field Name:", fieldName);
      console.log("File Name:", selectedFile.name);
      console.log("File Type:", selectedFile.type);
      console.log("File Size:", selectedFile.size);
      if (selectedFile.size > FILE_SIZE) {
        errors[fieldName] = "File too large. Max size is 512KB";
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = "Unsupported Format";
      } else {
        formik.setFieldValue(fieldName, selectedFile);
        return;
      }
    }
    formik.setFieldError(fieldName, errors[fieldName]);
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleCreateUser = async (userData) => {
    try {
      const response = await UserServices.createManufacturer(userData);
      console.log("User created successfully:");
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error creating user:", error.message);
      console.log("Status:", error?.response?.status);
      console.log("Backend Error:", error?.response?.data);
      console.log("Full Error:", error);
      return {
        code: "400",
        message: error.message,
        errors: error.response.data,
      };
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userData = sessionStorage.getItem('cookiesData');
    const data = userData && userData.split("-")
    const userId = userData && data.length > 2 && data[3];
    setSubmitting(true);
    setLoading(true);
    const fd = new FormData();
    fd.append("role", "devicemanufacture");
    fd.append("createdby", userId || "");
    fd.append("name", values?.name || "");
    fd.append("mobile", values?.mobile || "");
    fd.append("email", values?.email || "");
    fd.append("dob", values?.dob || "");
    fd.append("expirydate", values?.expirydate || "");
    fd.append("company_name", values?.company_name || "");
    fd.append("gstnnumber", values?.gstnnumber || "");
    fd.append("idProofno", values?.idProofno || "");
    fd.append("state", values?.state || "");
    fd.append("tac", values?.tac || "");
    fd.append("device_model_details", values?.device_model_details || "");
    fd.append("lat", values?.lat || "");
    fd.append("lon", values?.lon || "");

    (values?.esimProvider || []).forEach((id) => {
      if (id !== undefined && id !== null && String(id).trim() !== "") {
        fd.append("esimProvider[]", id);
      }
    });

    if (values?.file_authLetter) fd.append("file_authLetter", values.file_authLetter);
    if (values?.file_companRegCertificate)
      fd.append("file_companRegCertificate", values.file_companRegCertificate);
    if (values?.file_GSTCertificate) fd.append("file_GSTCertificate", values.file_GSTCertificate);
    if (values?.file_idProof) fd.append("file_idProof", values.file_idProof);
    if (values?.file_affidavitNda) fd.append("file_affidavitNda", values.file_affidavitNda);

    const response = await handleCreateUser(fd);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("manufacturer.form.success");
      setSubmitting(false);
      setLoading(false);
      setShowResend(true);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: response,
      }));
      handleAlert("manufacturer.form.error");
      setLoading(false);
      setShowResend(false);
    }
  };

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(manufacturerInitialValues);
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
        <Grid item xs={12}>
          <MainCard>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "24px",
                background: "linear-gradient(180deg,#ffffff,#f8fafc)",
                border: "1px solid #e2e8f0"
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  color: "#0f172a"
                }}
              >
                {t("manufacturer.title")}
              </Typography>

              {isFormLoaded && (
                <Formik
                  initialValues={manufacturerInitialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {(formik) => (
                    <form onSubmit={formik.handleSubmit}>
                      <Grid container columnSpacing={3}
                        rowSpacing={0}>
                        {Object.keys(updatedFormFields).map((field) => {
                          const fieldData =
                            updatedFormFields[field];

                          /* previous functionality */
                          if (fieldData.gridHidden)
                            return null; // hide lon etc

                          const isLatField =
                            field === "lat";

                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              key={field}
                            >

                              {!isLatField && (
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#334155",
                                    lineHeight: 1.4,
                                    minHeight: "42px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    wordBreak: "break-word"
                                  }}
                                >
                                  {t(
                                    fieldData.label
                                  )}
                                </Typography>
                              )}

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

                                    /* previous logic:
                                       lat field uses FormField internal UI
                                       other fields no inside label
                                    */
                                    label:
                                      isLatField
                                        ? ""
                                        : "",

                                    helperText:
                                      fieldData.helperText
                                        ? t(
                                          fieldData.helperText
                                        )
                                        : undefined
                                  }}
                                  formik={
                                    formik
                                  }
                                  handleFileChange={
                                    handleFileChange
                                  }
                                  handleOptionChange={
                                    handleStateChange
                                  }
                                />
                              </Box>
                            </Grid>
                          );
                        })}

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              gap: 2,
                              flexWrap:
                                "wrap"
                            }}
                          >
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={loading}
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
                              {loading ? (
                                <CircularProgress
                                  size={22}
                                  color="inherit"
                                />
                              ) : (
                                t(
                                  "manufacturer.form.submit"
                                )
                              )}
                            </Button>

                            {showResend && (
                              <Button
                                variant="outlined"
                                disabled={
                                  loading
                                }
                                onClick={() =>
                                  handleResend(
                                    formik.resetForm
                                  )
                                }
                                sx={{
                                  height:
                                    "56px",
                                  px: 4,
                                  borderRadius:
                                    "16px",
                                  color:
                                    "#334155",
                                  textTransform:
                                    "none"
                                }}
                              >
                                {t(
                                  "auth.resend"
                                )}
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                </Formik>
              )}
            </Paper>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default Manufacturer;
