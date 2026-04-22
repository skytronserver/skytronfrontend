import { Grid, Button, CircularProgress,Box,Paper,Typography } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { useTranslation } from "react-i18next";
import { gridSpacing, FILE_SIZE, SUPPORTED_FORMATS } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertErrorObjectToArray } from "../../helper";
import { ownerInitialValues, vehicleOwnerField } from "../../formjson/vehicleOwner";
import NotAuthorized from "../../views/pages/NotAuthorized";
import { useParams } from "react-router-dom";

const VehicleOwner = () => {
  const { t } = useTranslation();
  const params = useParams();
  const parameter = params['*'] && !isNaN(params['*'])
  const [editPage, setEditPage] = useState(false);
  const [open, setOpen] = useState(false);
  const [vehicleOwnerInitialValues, setVehicleOwnerInitialValues] = useState(ownerInitialValues);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    error: false,
    message: '',
    errorList: []
  })
  useEffect(() => {
    if (params['*'] && !isNaN(params['*'])) {
      const id = params['*'];
      (async () => {
        try {
          const responseData = await UserServices.fetchVehicleOwner({ VehicleOwner_id: id });
          if (responseData?.data?.[0]) {
            const response = responseData?.data?.[0];
            const formattedDate = new Date(response.expirydate)
              .toISOString()
              .split("T")[0];
            setVehicleOwnerInitialValues({
              name: response.users[0]?.name || "",
              mobile: response.users[0]?.mobile || "",
              email: response.users[0]?.email || "",
              dob: response.users[0]?.dob || "",
              address: response.users[0]?.address || "",
              expirydate: formattedDate,
              idProofno: response.idProofno || "",
              file_idProof: response.file_idProof || null,
              vehicleowner_id: response.id
            });
            setEditPage(true);
          }
        } catch (error) {
          console.log(error)
        }
      })()
    } else {
      setVehicleOwnerInitialValues(ownerInitialValues);
      setEditPage(false);
    }
  }, [parameter]);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const handleClose = () => {
    !alert.error && navigate("/new/vehicleOwner");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }))
    setOpen(true);
  };
  const handleFileChange = (event, formik) => {
    const selectedFile = event.currentTarget.files[0];
    const fieldName = event.target.name;
    const errors = {};
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE) {
        errors[fieldName] = t("vehicleOwnerForm.validation.fileSize");
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = t("vehicleOwnerForm.validation.fileFormat");
      } else {
        formik.setFieldValue(fieldName, selectedFile);
        return;
      }
    }
    formik.setFieldError(fieldName, errors[fieldName]);
  };

  const validationSchema = Yup.object(
    Object.keys(vehicleOwnerField).reduce((acc, field) => {
      acc[field] = vehicleOwnerField[field].validation;
      return acc;
    }, {})
  );
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userData = sessionStorage.getItem('cookiesData');
    const userId = userData?.split("-")[3];

    const valuesWithRole = {
      ...values,
      role: "owner",
      createdby: userId || null,
    };

    setSubmitting(true);
    setLoading(true);

    try {
      if (editPage) {
        const { data } = await UserServices.updateVehicleOwner(valuesWithRole);
      } else {
        const { data } = await UserServices.createVehicleOwner(valuesWithRole);
      }
      setAlert(prevAlert => ({
        ...prevAlert,
        error: false,
        errorList: [],
      }));

      handleAlert(t("common.formSubmittedSuccessfully"));
      setShowResend(true);
    } catch (error) {
      console.error("Error creating user:", error.message);

      setAlert(prevAlert => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(error.response?.data || []),
      }));

      handleAlert(t("common.formNotSubmitted"));
      setShowResend(false);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleResend = (resetForm) => {
    setShowResend(false);
    resetForm(ownerInitialValues);
  };


  // return (
  //   <>
  //     <DialogComponent open={open} handleClose={handleClose} message={alert.message} errorList={alert.errorList} />

  //     <Grid container spacing={gridSpacing} >
  //       {loading && (
  //         <div style={{ top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "rgba(255, 255, 255, 0.8)" }}>
  //           <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} size={50} />
  //         </div>
  //       )}
  //       <Grid item xs={12} style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s ease-in-out" }}>
  //         <MainCard title={t("vehicleOwnerForm.title")}>
  //           <Formik
  //             initialValues={vehicleOwnerInitialValues}
  //             validationSchema={validationSchema}
  //             onSubmit={handleSubmit}
  //             enableReinitialize
  //           >
  //             {(formik) => (
  //               <form onSubmit={formik.handleSubmit} >
  //                 <Grid container spacing={2} className="form-controller">
  //                   {Object.keys(vehicleOwnerField).map((field) => (
  //                     <Grid key={field} item md={6} sm={12} xs={12}>
  //                       <FormField
  //                         fieldConfig={vehicleOwnerField[field]}
  //                         formik={formik}
  //                         handleFileChange={handleFileChange}
  //                       />
  //                     </Grid>
  //                   ))}
  //                   <Grid item xs={12} style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
  //                     <Button type="submit" variant="contained" color="primary" disabled={loading}>
  //                       {t("common.submit")}
  //                     </Button>
  //                     {showResend && (
  //                       <Button
  //                         type="button"
  //                         variant="outlined"
  //                         color="secondary"
  //                         onClick={() => handleResend(formik.resetForm)}
  //                         disabled={loading}
  //                       >
  //                         {t("auth.resend")}
  //                       </Button>
  //                     )}
  //                   </Grid>
  //                 </Grid>
  //               </form>
  //             )}
  //           </Formik>
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
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "rgba(255,255,255,.75)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center"
          }}
        >
          <CircularProgress
            size={50}
          />
        </div>
      )}

      <Grid
        item
        xs={12}
        sx={{
          opacity: loading
            ? 0.5
            : 1,
          transition:
            "opacity .3s ease"
        }}
      >
        <MainCard>
          <Box
            sx={{
              p: 4,
              borderRadius:
                "24px",
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
                color:
                  "#0f172a"
              }}
            >
              {t(
                "vehicleOwnerForm.title"
              )}
            </Typography>

            <Formik
              initialValues={
                vehicleOwnerInitialValues
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
                    columnSpacing={
                      3
                    }
                    rowSpacing={
                      0
                    }
                  >
                    {Object.keys(
                      vehicleOwnerField
                    ).map(
                      (
                        field
                      ) => {
                        const fieldData =
                          vehicleOwnerField[
                            field
                          ];

                        /* FIX LAT/LON */
                        const isLatField =
                          field ===
                          "lat";

                        const isLonField =
                          field ===
                          "lon";

                        if (
                          isLonField
                        ) {
                          return null;
                        }

                        return (
                          <Grid
                            key={
                              field
                            }
                            item
                            xs={
                              12
                            }
                            sm={
                              6
                            }
                            md={
                              4
                            }
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
                      }
                    )}

                    {/* SUBMIT + RESEND */}
                    <Grid
                      item
                      xs={12}
                    >
                      <Box
                        sx={{
                          mt: 3,
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

                        {showResend && (
                          <Button
                            type="button"
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              handleResend(
                                formik.resetForm
                              )
                            }
                            disabled={
                              loading
                            }
                            sx={{
                              height:
                                "56px",
                              px: 4,
                              borderRadius:
                                "16px",
                              fontWeight: 700,
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
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  </>
);
};

export default VehicleOwner;
