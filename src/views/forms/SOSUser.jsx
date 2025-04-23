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
import { retriveDistrictList, retriveStateList } from "../../helper";
import { sosOtherUserFormField, sosOtherUserInitialValues } from "../../formjson/sosUser";
import { useTranslation } from "react-i18next";

const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

const SOSUser = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(sosOtherUserFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

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
        district: {
          ...prevConfig.district,
          options: districtList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);

  const navigate = useNavigate();

  const handleClose = () => {
    !alert.error && navigate("/new/sos-user");
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
        errors[fieldName] = t("sosUserForm.validation.fileSize");
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = t("sosUserForm.validation.fileFormat");
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
      const userData = sessionStorage.getItem('cookiesData');
      const data = userData && userData.split("-");
      const userId = userData && data.length > 2 && data[3];

      const valuesWithRole = {
        ...values,
        role: 'sosexecutive',
        createdby: userId,
      };

      setSubmitting(true);
      setLoading(true);

      const response = await UserServices.createSOSUser(valuesWithRole);
      console.log("User created successfully:");
      
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert(t("common.formSubmittedSuccessfully"));
      resetForm(sosOtherUserInitialValues);
    } catch (error) {
      console.error("Error creating user:", error?.message);
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: {
          code: "400",
          message: error?.message,
          errors: error?.response?.data,
        },
      }));
      handleAlert(t("common.formNotSubmitted"));
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
          <MainCard title={t("sosUserForm.title")}>
            {isFormLoaded && (
              <Formik
                initialValues={sosOtherUserInitialValues}
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
                          {t("common.submit")}
                        </Button>
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

export default SOSUser;
