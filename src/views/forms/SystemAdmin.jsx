import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
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
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
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
      setShowResend(true);
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
      setShowResend(false);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(initialValues);
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            background: "rgba(255,255,255,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CircularProgress size={50} />
        </div>
      )}

      <Grid item xs={12}>
        <MainCard>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "24px",
              background:
                "linear-gradient(180deg,#ffffff,#f8fafc)",
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
              Create System Admin
            </Typography>

            <Formik
              initialValues={initialValues}
              validationSchema={
                validationSchema
              }
              onSubmit={handleSubmit}
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
                    columnSpacing={3}
                    rowSpacing={0}
                  >
                    {Object.keys(
                      systemAdminFormFields
                    ).map((field) => {
                      const fieldData =
                        systemAdminFormFields[
                          field
                        ];

                      const isLatField =
                        field ===
                        "lat";

                      const isLonField =
                        field ===
                        "lon";

                      if (isLonField)
                        return null;

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
                              {
                                fieldData.label
                              }
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
                                label:
                                  ""
                              }}
                              formik={
                                formik
                              }
                            />
                          </Box>
                        </Grid>
                      );
                    })}

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
                          {loading ? (
                            <CircularProgress
                              size={
                                22
                              }
                              color="inherit"
                            />
                          ) : (
                            "Submit"
                          )}
                        </Button>

                        {showResend && (
                          <Button
                            type="button"
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
                            Resend
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </Paper>
        </MainCard>
      </Grid>
    </Grid>
  </>
);
};

export default SystemAdmin;