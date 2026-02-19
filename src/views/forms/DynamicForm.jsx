import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertErrorObjectToArray } from "../../helper";
const DynamicForm = ({ fieldConfig, initialData, formTitle, userRole }) => {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

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
    Object.keys(fieldConfig).reduce((acc, field) => {
      acc[field] = fieldConfig[field].validation;
      return acc;
    }, {})
  );
  const handleCreateUser = async (userData) => {
    try {
      const response = await UserServices.registerUser(userData);
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
    setSubmitting(true);
    setLoading(true);
    let valuesWithRole = {};
    if (values.hasOwnProperty("role")) {
      valuesWithRole = {
        ...values,
        status: "deactive",
        createdby: "admin",
      };
    } else {
      valuesWithRole = {
        ...values,
        role: userRole,
        status: "deactive",
        createdby: "admin",
      };
    }

    delete valuesWithRole.kycfile;
    delete valuesWithRole.panfile;
    const response = await handleCreateUser(valuesWithRole);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      setLoading(false);
      resetForm(initialData);
    } else {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(response.errors),
      }));
      handleAlert("Form Not Submitted");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!lastSubmittedValues) return;
    setResendLoading(true);
    try {
      const { payload, isFormData } = buildPayload(lastSubmittedValues);
      // Add user_id to payload
      if (!isFormData) {
        payload.user_id = userId;
      } else {
        payload.append("user_id", userId);
      }
      console.log("Resend OTP Payload:", payload);
      await UserServices.resendUserCreationOtp(payload, isFormData);
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("OTP resent successfully");
    } catch (error) {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: error?.response?.data ? convertErrorObjectToArray(error.response.data) : [],
      }));
      handleAlert("Resend OTP Error: " + (error?.response?.data?.error || error.message));
    } finally {
      setResendLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);
  const [lastSubmittedValues, setLastSubmittedValues] = useState(null);
  const userData = sessionStorage.getItem('cookiesData');
  const data = userData && userData.split("-");
  const userId = userData && data.length > 2 && data[3];

  const buildPayload = (values) => {
    const hasFile = Object.values(values).some(
      (value) => value instanceof File || value instanceof Blob
    );
    if (!hasFile) {
      return { payload: values, isFormData: false };
    }
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return { payload: formData, isFormData: true };
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
          <PageHeader title={formTitle} />
        </Grid>
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
          <MainCard title="Registration Form">
            <Formik
              initialValues={initialData}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                await handleSubmit(values, { setSubmitting, resetForm });
                setLastSubmittedValues(values);
              }}
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
                      {lastSubmittedValues && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleResendOtp}
                          disabled={resendLoading}
                          style={{ marginLeft: "12px" }}
                        >
                          {resendLoading ? "Resending OTP..." : "Resend OTP"}
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default DynamicForm;
