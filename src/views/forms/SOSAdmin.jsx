import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import {
  gridSpacing,
  FILE_SIZE,
  SUPPORTED_FORMATS,
} from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { retriveDistrictList, retriveStateList } from "../../helper";
import "./form.css";
import { sosUserFormField, sosUserInitialValues } from "../../formjson/sosUser";
import { useTranslation } from "react-i18next";

const SOSAdmin = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(sosUserFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
      const districtList = await retriveDistrictList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
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
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };
  const handleFileChange = (event, formik) => {
    const selectedFile = event.currentTarget.files[0];
    const fieldName = event.target.name;
    const errors = {};
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE) {
        errors[fieldName] = t("validation.fileTooLarge");
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = t("validation.unsupportedFormat");
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
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userData = sessionStorage.getItem("cookiesData");
      const userId = userData?.split("-")[3];
      setSubmitting(true);
      setLoading(true);
      const valuesWithRole = {
        ...values,
        role: "sosadmin",
        createdby: userId,
      };
      const response = await UserServices.createSOSAdmin(valuesWithRole);
      if (response) {
        setAlert((prevAlert) => ({
          ...prevAlert,
          error: false,
          errorList: [],
        }));
        handleAlert(t("sosAdmin.form.success"));
        resetForm();
        setShowResend(true);
      }
    } catch (error) {
      let emailError = "",
        mobileError = "";
      const errorMessage = error?.response?.data?.error || "";
      if (errorMessage) {
        emailError = errorMessage.includes("email")
          ? t("sosAdmin.form.validation.email_exists")
          : "";
        mobileError = errorMessage.includes("mobile")
          ? t("sosAdmin.form.validation.mobile_exists")
          : "";
      }
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: {
          code: "400",
          message: error.message,
          errors: error.response?.data,
        },
      }));
      handleAlert(t("sosAdmin.form.error") + " " + emailError + " " + mobileError);
      setShowResend(false);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(sosUserInitialValues);
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
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}
        <Grid item xs={12} className={loading ? "loading" : "not-loading"}>
          <MainCard title={t("sosAdmin.title")}>
            {isFormLoaded && (
              <Formik
                initialValues={sosUserInitialValues}
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
                      <Grid item xs={12} style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          {t("sosAdmin.form.submit")}
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

export default SOSAdmin;
