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
import { convertErrorObjectToArray, retriveStateList } from "../../helper";
import { eSIMInitialValues, eSIMFormField } from "../../formjson/eSIMUser";

const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

const EsimUser = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(eSIMFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        stateId: {
          ...prevConfig.stateId,
          options: stateList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);

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
        errors[fieldName] = "validation.fileTooLarge";
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = "validation.unsupportedFormat";
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
      const response = await UserServices.createEsimUser(userData);
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
    const data = userData && userData.split("-");
    const userId = userData && data.length > 2 && data[3];
    setSubmitting(true);
    setLoading(true);
    let valuesWithRole = {};
    valuesWithRole = {
      ...values,
      role: "esimprovider",
      createdby: userId,
    };
    const response = await handleCreateUser(valuesWithRole);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("common.formSubmittedSuccessfully");
      setSubmitting(false);
      setLoading(false);
      setShowResend(true);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: response,
      }));
      handleAlert("common.formNotSubmitted");
      setLoading(false);
      setShowResend(false);
    }
  };

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(eSIMInitialValues);
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
          <MainCard title={t("esimUser.title")}>
            {isFormLoaded && (
              <Formik
                initialValues={eSIMInitialValues}
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
                          {t("common.submit")}
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
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default EsimUser;
