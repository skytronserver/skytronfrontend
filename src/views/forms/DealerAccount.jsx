import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Paper, Typography } from "@mui/material";
import {
  gridSpacing,
  FILE_SIZE,
  SUPPORTED_FORMATS,
} from "../../store/constant";
import DealerServices from "../../services/DealerServices";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { useNavigate } from "react-router-dom";
import {
  convertErrorObjectToArray,
  retriveStateList,
  retriveDistrictList,
  retriveManufacturerList,
} from "../../helper";
import "./form.css";
import {
  dealerAccountFormField,
  dealerAccountInitialValues,
} from "../../formjson/dealerAccount";

function DealerAccount() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(
    dealerAccountFormField
  );
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const manufacturerList = await retriveManufacturerList();
        const stateList = await retriveStateList();

        setUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          manufacturer: {
            ...prevConfig.manufacturer,
            options: manufacturerList || [],
          },
          address_State: {
            ...prevConfig.address_State,
            value: stateList?.[0]?.label || '',
            id: stateList?.[0]?.value || '',
          },
          districts: {
            ...prevConfig.districts,
            options: [],
          },
        }));

        if (stateList?.[0]?.value) {
          dealerAccountInitialValues.address_State = stateList[0].label;
          const districtList = await retriveDistrictList({ state: stateList[0].value });
          console.log(districtList, 'districtList')
          setUpdatedFormField((prevConfig) => ({
            ...prevConfig,
            districts: {
              ...prevConfig.districts,
              options: districtList
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

  const handleClose = () => {
    !alert.error && navigate("/user/newDealerAccount");
    setOpen(false);
  };

  // const handleStateChange = (event, formik) => {
  //   const fieldName = event.target.name;
  //   if (fieldName === "address_State") {
  //     (async () => {
  //       const getDetailsOf = {
  //         state: event.target.value,
  //       };
  //       try {
  //         const districtList = await retriveDistrictList(getDetailsOf);
  //         setUpdatedFormField((prevConfig) => ({
  //           ...prevConfig,
  //           district: {
  //             ...prevConfig.district,
  //             options: districtList,
  //           },
  //         }));
  //       } catch (error) {
  //         console.log(error)
  //       }
  //     })();
  //   }
  // };


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
        errors[fieldName] = t("dealerAccountForm.validation.fileSize");
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = t("dealerAccountForm.validation.fileFormat");
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
  (async () => {
    try {
      const res = await DealerServices.dealerList();
    } catch (error) {
      console.log(error);
    }
  })();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userData = sessionStorage.getItem("cookiesData");
    const data = userData && userData.split("-");
    const userId = userData && data.length > 2 && data[3];

    setSubmitting(true);
    setLoading(true);

    // Format districts as an array if it exists
    const formattedDistricts = values.districts ?
      (Array.isArray(values.districts) ? values.districts : [values.districts]) : [];

    const valuesWithRole = {
      ...values,
      districts: formattedDistricts,
      role: "devicemanufacturer",
      createdby: userId,
      address_State: updatedFormFields.address_State?.id
    };

    try {
      await DealerServices.dealerUser(valuesWithRole);
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
    resetForm(dealerAccountInitialValues);
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
                {t("dealerAccountForm.title")}
              </Typography>

              {isFormLoaded && (
                <Formik
                  initialValues={
                    dealerAccountInitialValues
                  }
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
                          updatedFormFields
                        ).map((field) => {
                          const fieldData =
                            updatedFormFields[
                            field
                            ];

                          if (
                            fieldData.gridHidden
                          )
                            return null;

                          const isLatField = field === "lat";
                          const isLonField = field === "lon";
                          if (isLonField) return null;

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
}

export default DealerAccount;
