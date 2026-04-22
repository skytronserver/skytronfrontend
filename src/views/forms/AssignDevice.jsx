import { Grid, Button,Box,Paper,Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import DealerServices from "../../services/DealerServices";
import CustomLoader from "../../ui-component/CustomLoader";
import { useTranslation } from 'react-i18next';
import {
  assignDeviceFormFields,
  assignDeviceInitials,
} from "../../formjson/assignDevice";
import {
  retriveDeviceModelList,
  retriveDealerList,
  convertErrorObjectToArray,
} from "../../helper";
import MainCard from "../../ui-component/cards/MainCard";
import "./form.css";

const AssignDevice = () => {
  const { t } = useTranslation();
  const [updatedFormFields, setUpdatedFormField] = useState(
    assignDeviceFormFields
  );
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });

  const [loading, setLoading] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    (async () => {
      const filter={
        stock_status:"NotAssigned"
      }
      const deviceList = await retriveDeviceModelList(filter);
      const dealerList = await retriveDealerList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        dealer: {
          ...prevConfig.dealer,
          options: dealerList,
        },
        device: {
          ...prevConfig.device,
          options: deviceList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      const response = await DealerServices.assignDeviceToDealer(values);
      setDeviceId(response.data.id);
      resetForm(assignDeviceInitials);
    } catch (error) {
      if (error.message === "Network Error") {
        setApiError(true);
      } else {
        setAlert((prevAlert) => ({
          ...prevAlert,
          error: true,
          errorList: convertErrorObjectToArray(error.message),
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // return (
  //   <>
  //     <DialogComponent
  //       open={open}
  //       handleClose={handleClose}
  //       message={alert.message}
  //       errorList={alert.errorList}
  //     />

  //     <Grid container spacing={gridSpacing}>
  //       {loading && <CustomLoader />}
  //       {apiError && (
  //         <Alert severity="error" style={{ marginBottom: "16px" }}>
  //           <AlertTitle>{t('common.internalServerError')}</AlertTitle>
  //           {t('common.serverErrorContactAdmin')}
  //         </Alert>
  //       )}
  //       <Grid item xs={12} className={loading ? "loading" : "not-loading"}>
  //         <MainCard title={t('assignDeviceForm.title')}>
  //           {isFormLoaded && (
  //             <Formik
  //               initialValues={assignDeviceInitials}
  //               validationSchema={validationSchema}
  //               onSubmit={handleSubmit}
  //               enableReinitialize
  //             >
  //               {(formik) => (
  //                 <form onSubmit={formik.handleSubmit}>
  //                   <Grid container spacing={2} className="form-controller">
  //                     {Object.keys(updatedFormFields).map((field) => (
  //                       <Grid key={field} item md={6} sm={12} xs={12}>
  //                         <FormField
  //                           fieldConfig={updatedFormFields[field]}
  //                           formik={formik}
  //                           handleFileChange={handleFileChange}
  //                         />
  //                       </Grid>
  //                     ))}
  //                     <Grid item xs={12} style={{ marginTop: "20px" }}>
  //                       <Button
  //                         type="submit"
  //                         variant="contained"
  //                         color="primary"
  //                         disabled={loading}
  //                       >
  //                         {t('common.submit')}
  //                       </Button>
  //                     </Grid>
  //                   </Grid>
  //                 </form>
  //               )}
  //             </Formik>
  //           )}
  //         </MainCard>
  //       </Grid>
  //     </Grid>
  //   </>
  // );

return (
  <>
    <DialogComponent
      open={open}
      handleClose={handleClose}
      message={alert.message}
      errorList={alert.errorList}
    />

    <Grid container spacing={gridSpacing}>
      {loading && <CustomLoader />}

      {apiError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: "14px",
            width: "100%"
          }}
        >
          <AlertTitle>
            {t("common.internalServerError")}
          </AlertTitle>

          {t(
            "common.serverErrorContactAdmin"
          )}
        </Alert>
      )}

      <Grid item xs={12}>
        <MainCard>
          <Box
            sx={{
              p: 4,
              borderRadius: "24px",
              background:
                "linear-gradient(180deg,#ffffff,#f8fafc)",
              border:
                "1px solid #e2e8f0"
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
              {t(
                "assignDeviceForm.title"
              )}
            </Typography>

            {isFormLoaded && (
              <Formik
                initialValues={
                  assignDeviceInitials
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
                            <Typography
                              sx={{
                                fontSize:
                                  "14px",
                                fontWeight: 700,
                                color:
                                  "#334155",
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
                                handleFileChange={
                                  handleFileChange
                                }
                              />
                            </Box>
                          </Grid>
                        );
                      })}

                      {/* KEEP SUBMIT BUTTON SAME AS PREVIOUS */}
                      <Grid
                        item
                        xs={12}
                      >
                        <Box
                          sx={{
                            mt: 2
                          }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={
                              loading
                            }
                            sx={{
                              height:
                                "56px",
                              px: 5,
                              borderRadius:
                                "16px",
                              fontWeight: 800,
                              fontSize:
                                "16px",
                              textTransform:
                                "none",
                              background:
                                "linear-gradient(90deg,#14b8a6,#0ea5e9)",
                              boxShadow:
                                "0 14px 30px rgba(14,165,233,.25)"
                            }}
                          >
                            {t(
                              "common.submit"
                            )}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            )}
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  </>
);
};

export default AssignDevice;
