import { Grid, Button, CircularProgress } from "@mui/material";
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
    fd.append("assam_office_address", values?.assam_office_address || "");
    fd.append("assam_office_pin", values?.assam_office_pin || "");
    fd.append("assam_office_phone", values?.assam_office_phone || "");
    fd.append("assam_office_lat", values?.assam_office_lat || "");
    fd.append("assam_office_lon", values?.assam_office_lon || "");

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
      resetForm();
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
          <MainCard title={t('manufacturer.title')}>
            {isFormLoaded && <Formik
              initialValues={manufacturerInitialValues}
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
                          fieldConfig={{
                            ...updatedFormFields[field],
                            label: t(updatedFormFields[field].label),
                            helperText: updatedFormFields[field].helperText ? t(updatedFormFields[field].helperText) : undefined
                          }}
                          formik={formik}
                          handleFileChange={handleFileChange}
                          handleOptionChange={handleStateChange}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {t('manufacturer.form.submit')}
                      </Button>
                      {showResend && (
                        <Button
                          type="button"
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleResend(formik.resetForm)}
                          disabled={loading}
                        >
                          {t("auth.resend")}
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
            }
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default Manufacturer;
