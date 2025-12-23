import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../../ui-component/CustomTextField";

const systemAdminFormFields = {
  name: {
    name: "name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Email",
    validation: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "Mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "Mobile Number must be a 10-digit number")
      .required("Mobile Number is required"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.string().required("Date of Birth is required"),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    validation: Yup.number()
      .typeError("Latitude must be a number")
      .nullable(),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    validation: Yup.number()
      .typeError("Longitude must be a number")
      .nullable(),
  },
};

const initialValues = {
  name: "",
  email: "",
  mobile: "",
  dob: "",
  lat: "",
  lon: "",
};

const SystemAdmin = () => {
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
    setAlert((prevAlert) => ({ ...prevAlert, message }));
    setOpen(true);
  };

  const validationSchema = Yup.object(
    Object.keys(systemAdminFormFields).reduce((acc, field) => {
      acc[field] = systemAdminFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      const payload = {
        ...values,
        dob: values.dob ? values.dob.replace(/-/g, "/") : values.dob,
      };

      await UserServices.createSystemAdmin(payload);
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("System Admin created successfully");
      resetForm(initialValues);
    } catch (error) {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: {
          code: "400",
          message: error.message,
          errors: error.response?.data,
        },
      }));
      handleAlert("Failed to create System Admin");
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
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}
        <Grid item xs={12} className={loading ? "loading" : "not-loading"}>
          <MainCard title="Create System Admin">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(systemAdminFormFields).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={systemAdminFormFields[field]}
                          formik={formik}
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

export default SystemAdmin;
