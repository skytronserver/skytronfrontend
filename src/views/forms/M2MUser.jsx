/* eslint-disable no-unused-vars */
import { Grid, Button, CircularProgress,Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Box, 
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Typography, } from "@mui/material";
  import VisibilityIcon from "@mui/icons-material/Visibility";
  import DownloadIcon from "@mui/icons-material/Download";
  import CloseIcon from "@mui/icons-material/Close";
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
import { retriveStateList } from "../../helper";
import { m2mUserInitialValues, m2mUserFormField } from "../../formjson/M2MUser";

const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

const M2MUser = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // PDF View Dialog
    const [pdfOpen, setPdfOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(m2mUserFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showResend, setShowResend] = useState(false);

   // Open PDF
    const handlePdfOpen = () => {
      setPdfOpen(true);
    };
  
    // Close PDF
    const handlePdfClose = () => {
      setPdfOpen(false);
    };

  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
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
      const response = await UserServices.createM2MUser(userData);
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
    const fd = new FormData();
    fd.append("role", "esimprovider");
    fd.append("createdby", userId || "");
    fd.append("name", values?.name || "");
    fd.append("mobile", values?.mobile || "");
    fd.append("email", values?.email || "");
    fd.append("dob", values?.dob || "");
    fd.append("expirydate", values?.expirydate || "");
    fd.append("company_name", values?.company_name || "");
    fd.append("company_address", values?.company_address || "");
    fd.append("company_pin", values?.company_pin || "");
    fd.append("company_email", values?.company_email || "");
    fd.append("company_phoneno", values?.company_phoneno || "");
    fd.append("gstnnumber", values?.gstnnumber || "");
    fd.append("panno", values?.panno || "");
    fd.append("company_registration_no", values?.company_registration_no || "");
    fd.append("idProofno", values?.idProofno || "");
    fd.append("stateId", values?.state || "");
    fd.append("address", values?.address || "");
    fd.append("pin", values?.pin || "");
    fd.append("lat", values?.lat || "");
    fd.append("lon", values?.lon || "");
    fd.append("m2m_reg_certificate_no", values?.m2m_reg_certificate_no || "");

    (values?.telecomProviders || []).forEach((p) => {
      if (p !== undefined && p !== null && String(p).trim() !== "") {
        fd.append("telecomProviders[]", p);
      }
    });

    if (values?.file_authLetter) fd.append("file_authLetter", values.file_authLetter);
    if (values?.file_officialTechnicalOnboardingRequestLetter)
      fd.append(
        "file_officialTechnicalOnboardingRequestLetter",
        values.file_officialTechnicalOnboardingRequestLetter
      );
    if (values?.file_selfCertifiedDotM2mRegistrationCertificate)
      fd.append(
        "file_selfCertifiedDotM2mRegistrationCertificate",
        values.file_selfCertifiedDotM2mRegistrationCertificate
      );
    if (values?.file_affidavitCumUndertakingBackendAccess)
      fd.append("file_affidavitNda", values.file_affidavitCumUndertakingBackendAccess);
    if (values?.file_selfCertifiedGstRegistrationCertificate)
      fd.append("file_GSTCertificate", values.file_selfCertifiedGstRegistrationCertificate);
    if (values?.file_selfCertifiedIdProofAuthorisedSignatory)
      fd.append("file_idProof", values.file_selfCertifiedIdProofAuthorisedSignatory);
    if (values?.file_selfCertifiedPanCard)
      fd.append("file_pan", values.file_selfCertifiedPanCard);
    if (values?.file_selfCertifiedCompanyRegistrationCertificateOptional)
      fd.append(
        "file_companRegCertificate",
        values.file_selfCertifiedCompanyRegistrationCertificateOptional
      );

    const response = await handleCreateUser(fd);
    if (response.code === "200") {
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("common.formSubmittedSuccessfully");
      resetForm();
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
    resetForm(m2mUserInitialValues);
  };

  return (
    <>
      <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />
{/* ==========================================
          PDF VIEWER DIALOG
      ========================================== */}


<Dialog
  open={pdfOpen}
  onClose={handlePdfClose}
  fullWidth
  maxWidth="lg"
  PaperProps={{
    sx: {
      height: "92vh",
      maxHeight: "92vh",
      borderRadius: "8px",
    },
  }}
>
  {/* ================================
      HEADER
  ================================= */}

  <DialogTitle
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e0e0e0",
      py: 1.5,
    }}
  >
    <Typography
      sx={{
        fontSize: "20px",
        fontWeight: 600,
      }}
    >
      M2M API Documentation
    </Typography>

    <IconButton
      onClick={handlePdfClose}
      aria-label="close"
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  {/* ================================
      DOCUMENT CONTENT
  ================================= */}

  <DialogContent
    dividers
    sx={{
      backgroundColor: "#ffffff",
      p: {
        xs: 2,
        sm: 3,
        md: 4,
      },
      overflowY: "auto",
    }}
  >
    <Box
      sx={{
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >

      {/* ==========================================
          TITLE
      ========================================== */}

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#333",
          mb: 0.5,
        }}
      >
        eSIM Query API
      </Typography>

      <Typography
        variant="h6"
        sx={{
          color: "#555",
          mb: 1,
        }}
      >
        Technical API Document
      </Typography>

      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.7,
          mb: 3,
        }}
      >
        This document provides the technical request and response
        specification for the eSIM Query API. It describes the
        request parameters and the fields returned in a successful
        API response.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* ==========================================
          1. API PURPOSE
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        1. API Purpose
      </Typography>

      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.7,
          mb: 3,
        }}
      >
        The eSIM Query API is used to retrieve eSIM/SIM information
        using the API key and ICCID. The response provides card
        status, activation and expiry information, primary and
        fallback TSP details, MSISDN information, and data usage.
      </Typography>

      {/* ==========================================
          2. REQUEST
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        2. Request
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
        }}
      >
        Request Parameters
      </Typography>

      <Table
        sx={{
          mb: 3,
          border: "1px solid #ddd",
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#f5f5f5",
            }}
          >
            <TableCell sx={{ fontWeight: 700 }}>
              Parameter
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Data Type
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Required
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Description
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell>k1</TableCell>
            <TableCell>String</TableCell>
            <TableCell>Yes</TableCell>
            <TableCell>
              API key used for the request.
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>k2</TableCell>
            <TableCell>String</TableCell>
            <TableCell>Yes</TableCell>
            <TableCell>
              ICCID of the SIM/eSIM to be queried.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* ==========================================
          3. SAMPLE REQUEST
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        3. Sample Request
      </Typography>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#f6f8fa",
          border: "1px solid #ddd",
          borderRadius: "6px",
          p: 2,
          mb: 3,
          overflowX: "auto",
        }}
      >
        <Box
          component="pre"
          sx={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
{`{
  "k1": "<API_KEY>",
  "k2": "89911025034089231833"
}`}
        </Box>
      </Paper>

      {/* ==========================================
          4. SUCCESSFUL RESPONSE
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        4. Successful Response
      </Typography>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#f6f8fa",
          border: "1px solid #ddd",
          borderRadius: "6px",
          p: 2,
          mb: 3,
          overflowX: "auto",
        }}
      >
        <Box
          component="pre"
          sx={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
{`{
  "apiResponseCode": "LCM_001",
  "apiResponseMsg": "Your request has been processed successfully",
  "sim_Entity_Count": "1",
  "resultObj": [
    {
      "iccid": "89911025034089231833",
      "cardState": "COMMERCIAL",
      "cardStatus": "Active",
      "activateOn": "12-08-2026",
      "expiredOn": "22-08-2027",
      "primaryTSP": "Airtel",
      "primaryMSISDN": "5754205918037",
      "primaryStatus": "Active",
      "fallbackTSP": "BSNL_S",
      "fallbackMSISDN": "915752181802747",
      "fallbackStatus": "",
      "dataUsage": "0.00",
      "dataUsageDate": "12-08-2026"
    }
  ]
}`}
        </Box>
      </Paper>

      {/* ==========================================
          5. RESPONSE FIELD SPECIFICATION
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        5. Response Field Specification
      </Typography>

      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          mb: 3,
        }}
      >
        <Table
          sx={{
            minWidth: "850px",
            border: "1px solid #ddd",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f5f5f5",
              }}
            >
              <TableCell sx={{ fontWeight: 700 }}>
                Field
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Data Type
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Example
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Description
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>

            <TableRow>
              <TableCell>apiResponseCode</TableCell>
              <TableCell>String</TableCell>
              <TableCell>LCM_001</TableCell>
              <TableCell>
                API response code. The supplied example
                indicates successful processing.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>apiResponseMsg</TableCell>
              <TableCell>String</TableCell>
              <TableCell>
                Your request has been processed successfully
              </TableCell>
              <TableCell>
                Human-readable API response message.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>sim_Entity_Count</TableCell>
              <TableCell>String</TableCell>
              <TableCell>1</TableCell>
              <TableCell>
                Number of SIM/eSIM records returned.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>resultObj</TableCell>
              <TableCell>Array</TableCell>
              <TableCell>{`[{...}]`}</TableCell>
              <TableCell>
                Array containing the SIM/eSIM query result.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>iccid</TableCell>
              <TableCell>String</TableCell>
              <TableCell>89911025034089231833</TableCell>
              <TableCell>
                Unique identifier of the SIM/eSIM.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>cardState</TableCell>
              <TableCell>String</TableCell>
              <TableCell>COMMERCIAL</TableCell>
              <TableCell>
                Current lifecycle/state classification of the card.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>cardStatus</TableCell>
              <TableCell>String</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>
                Current status of the card.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>activateOn</TableCell>
              <TableCell>String</TableCell>
              <TableCell>12-08-2026</TableCell>
              <TableCell>
                Date on which the card was activated.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>expiredOn</TableCell>
              <TableCell>String</TableCell>
              <TableCell>22-08-2027</TableCell>
              <TableCell>
                Expiry date of the card.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>primaryTSP</TableCell>
              <TableCell>String</TableCell>
              <TableCell>Airtel</TableCell>
              <TableCell>
                Primary Telecom Service Provider.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>primaryMSISDN</TableCell>
              <TableCell>String</TableCell>
              <TableCell>5754205918037</TableCell>
              <TableCell>
                MSISDN associated with the primary TSP.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>primaryStatus</TableCell>
              <TableCell>String</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>
                Status of the primary subscription/MSISDN.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>fallbackTSP</TableCell>
              <TableCell>String</TableCell>
              <TableCell>BSNL_S</TableCell>
              <TableCell>
                Fallback Telecom Service Provider.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>fallbackMSISDN</TableCell>
              <TableCell>String</TableCell>
              <TableCell>915752181802747</TableCell>
              <TableCell>
                MSISDN associated with the fallback TSP.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>fallbackStatus</TableCell>
              <TableCell>String</TableCell>
              <TableCell></TableCell>
              <TableCell>
                Status of the fallback subscription/MSISDN.
                Empty in the supplied response.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>dataUsage</TableCell>
              <TableCell>String/Decimal</TableCell>
              <TableCell>0.00</TableCell>
              <TableCell>
                Data usage reported for the SIM/eSIM.
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>dataUsageDate</TableCell>
              <TableCell>String</TableCell>
              <TableCell>12-08-2026</TableCell>
              <TableCell>
                Date associated with the reported data usage.
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </Box>

      {/* ==========================================
          6. RESPONSE INTERPRETATION
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        6. Response Interpretation – Sample
      </Typography>

      <Box
        component="ul"
        sx={{
          pl: 3,
          mb: 3,
          lineHeight: 1.8,
        }}
      >
        <li>
          apiResponseCode = LCM_001 indicates that the
          request was processed successfully in the supplied
          example.
        </li>

        <li>
          sim_Entity_Count = 1 indicates that one SIM/eSIM
          record was returned.
        </li>

        <li>
          The returned card has cardState = COMMERCIAL and
          cardStatus = Active.
        </li>

        <li>
          The primary TSP is Airtel and primaryStatus is Active.
        </li>

        <li>
          A fallback TSP and fallback MSISDN are returned;
          fallbackStatus is empty in the sample response.
        </li>

        <li>
          The reported data usage is 0.00 for the date
          12-08-2026.
        </li>
      </Box>

      {/* ==========================================
          7. DATA FORMAT NOTES
      ========================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          mb: 1,
        }}
      >
        7. Data Format Notes
      </Typography>

      <Box
        component="ul"
        sx={{
          pl: 3,
          mb: 2,
          lineHeight: 1.8,
        }}
      >
        <li>
          Dates in the supplied response use DD-MM-YYYY format.
        </li>

        <li>
          The resultObj field is an array and may contain one
          or more records depending on the query result.
        </li>

        <li>
          Empty string values, such as fallbackStatus in the
          sample response, should be handled as an
          empty/unavailable value.
        </li>

        <li>
          API keys such as k1 should be treated as confidential
          and should not be exposed in public documentation or
          client-side logs.
        </li>
      </Box>

    </Box>
  </DialogContent>

  {/* ================================
      FOOTER BUTTONS
  ================================= */}

  <DialogActions
    sx={{
      px: 2,
      py: 1.5,
      borderTop: "1px solid #e0e0e0",
    }}
  >

    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      component="a"
      href="/docs/eSIM_Query_API_Documentation.pdf"
      download="eSIM_Query_API_Documentation.pdf"
    >
      Download PDF
    </Button>

    <Button
      variant="outlined"
      onClick={handlePdfClose}
    >
      Close
    </Button>

  </DialogActions>
</Dialog>

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
          <MainCard title={t("m2mUser.title")}>
            {isFormLoaded && (
              <Formik
                initialValues={m2mUserInitialValues}
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
                        <Tooltip title="View M2M API Documentation">
                                <Button
                                  type="button"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<VisibilityIcon />}
                                  onClick={handlePdfOpen}
                                  disabled={loading}
                                  size="small"
                                >
                                  View Api Instruction
                                </Button>
                              </Tooltip>
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

export default M2MUser;
