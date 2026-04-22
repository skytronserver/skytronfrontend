import Grid from "@mui/material/Grid";
import { Box, Paper, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
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
import { useTranslation } from "react-i18next";
import {
  convertErrorObjectToArray,
  retriveStateList,
  retriveDTOList,
} from "../../helper";
import { dtoInitialsValues, dtoFormFields } from "../../formjson/dtoUserform";
import "./form.css";

const DtoRto = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(dtoFormFields);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const stateList = await retriveStateList();

        setUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          state: {
            ...prevConfig.state,
            value: stateList?.[0]?.label || '',
            id: stateList?.[0]?.value || '',
          },
          district_code: {
            ...prevConfig.district_code,
            options: [],
          },
        }));

        if (stateList?.[0]?.value) {
          dtoInitialsValues.state = stateList[0].label;
          const districtList = await retriveDTOList({ state: stateList[0].value });
          console.log(districtList, 'districtList')
          setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            district_code: {
              ...prevConfig.district_code,
              options: districtList,
            },
          }));
        }

      } catch (error) {
        console.error("Failed to retrieve state or district list:", error);
      } finally {
        setIsFormLoaded(true);
      }
    })();
  }, []);

  // const handleStateChange = (event, formik) => {
  //   const fieldName = event.target.name;
  //   if (fieldName === "state") {
  //     (async () => {
  //       const getDetailsOf = {
  //         state: event.target.value,
  //       };
  //       try {
  //         const districtList = await retriveDTOList(getDetailsOf);
  //         setUpdatedFormField((prevConfig) => ({
  //           ...prevConfig,
  //           district_code: {
  //             ...prevConfig.district_code,
  //             options: districtList,
  //           },
  //         }));
  //       } catch (error) {
  //         console.log(error)
  //       }
  //     })();
  //   }
  // };

  const handleClose = () => {
    !alert.error && navigate("/user/newDto");
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
    const userData = sessionStorage.getItem("cookiesData");
    const data = userData && userData.split("-");
    const userId = userData && data.length > 2 && data[3];
    const selectedState = updatedFormFields.state;
    setSubmitting(true);
    setLoading(true);
    let valuesWithRole = {};
    valuesWithRole = {
      ...values,
      role: "dto",
      createdby: userId,
      state: selectedState.id,
    };

    try {
      await UserServices.createDTO(valuesWithRole);
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert(t("common.formSubmittedSuccessfully"));
      setSubmitting(false);
      setShowResend(true);
    } catch (error) {
      if (error.message === "Network Error") {
        handleAlert(t("common.internalServerError"));
        return true;
      }
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(error.response.data),
      }));
      handleAlert(t("common.formNotSubmitted"));
      setShowResend(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(dtoInitialsValues);
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
            inset: 0,
            zIndex: 9999,
            background: "rgba(255,255,255,.72)",
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
              {t("dtoForm.title")}
            </Typography>

            {isFormLoaded && (
              <Formik
                initialValues={
                  dtoInitialsValues
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
                      columnSpacing={3}
                      rowSpacing={0}
                    >
                      {Object.keys(
                        updatedFormFields
                      ).map((field) => {
                        const fieldData =
                          updatedFormFields[
                            field
                          ];

                        /* SAME MANUFACTURER */
                        const isLatField =
                          field ===
                          "lat";

                        const isLonField =
                          field ===
                          "lon";

                        if (
                          isLonField ||
                          fieldData.gridHidden
                        ) {
                          return null;
                        }

                        return (
                          <Grid
                            key={
                              field
                            }
                            item
                            xs={12}
                            sm={6}
                            md={4}
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
                                    "",
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
                              t(
                                "common.submit"
                              )
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

export default DtoRto;
