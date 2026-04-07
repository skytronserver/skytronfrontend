import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid, Box, Alert, Stack, IconButton } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import ManufacturerServices from "../../services/ManufacturerServices";
import DealerServices from "../../services/DealerServices";
import { formatDate, openFile } from "../../helper";
import SettingService from "../../services/SettingService";
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserServices from "../../services/UserServices";
import Button from '@mui/material/Button';
import SystemAdmin from 'views/forms/SystemAdmin';

const styles = {
  card: {
    margin: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    backgroundColor: '#fff'
  },
  header: {
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '4px'
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#666'
  },
  content: {
    padding: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#333',
    marginBottom: '20px'
  },
  label: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px'
  },
  value: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '16px'
  },
  documentButton: {
    textTransform: 'none',
    color: '#0088ff',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: 'rgba(0, 136, 255, 0.04)'
    },
    '& .MuiButton-startIcon': {
      color: '#0088ff'
    }
  }
};

const Details = () => {
  const { userId, userType } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [lastApprovedId, setLastApprovedId] = useState(null);
  const [rawRecord, setRawRecord] = useState(null);
  const [user, setUser] = useState({
    role: "",
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gstNo: "",
    district: "",
    company_name: "",
    expiryDate: "",
    state: "",
    idProofno: "",
    created_by_name: "",
    file_authLetter: "",
    file_companRegCertificate: "",
    file_GSTCertificate: "",
    file_idProof: "",
    file_affidavitNda: ""
  });

  useEffect(() => {
    const retrieveUserDetails = async () => {
      try {
        let retrieveData;
        if (userType === 'manufacturer') {
          retrieveData = await ManufacturerServices.findManufacturer({ manufacturer_id: userId });
        } else if (userType === 'dealer') {
          retrieveData = await DealerServices.dealerList({ dealer_id: userId });
        } else if (userType === 'sosUser') {
          retrieveData = await UserServices.fetchSOSAdmin({ StateAdmin_id: userId });
        } else if (userType === 'sosOtherUser') {
          retrieveData = await UserServices.fetchSOSUser({ SOSUser_id: userId });
        }
        else if (userType === 'dtoUser') {
          retrieveData = await UserServices.fetchDTOList({ dto_rto_id: userId });
        }
        else if (userType === 'stateadmin') {
          retrieveData = await UserServices.fetchStateAdmin({ StateAdmin_id: userId });
        } else if (userType === 'serviceProvider') {
          retrieveData = await UserServices.fetchSimProvider({ eSimProvider_id: userId });
        }
        else {
          throw new Error("Unsupported user type");
        }

        const userData = retrieveData.data[0];
        setRawRecord(userData);

        const statusRaw =
          userData?.status ||
          userData?.users?.[0]?.status ||
          userData?.users?.[0]?.user_status ||
          "";
        setRequestStatus(statusRaw);
        setStatusOverride("");
        setLastApprovedId(null);

        setUser({
          role: userData?.users[0]?.role || "",
          name: userData?.users[0]?.name || "",
          email: userData?.users[0]?.email || "",
          mobile: userData?.users[0]?.mobile || "",
          dob: userData?.users[0]?.dob || "",
          district: userData?.district || "",
          gstNo: userData?.gstnnumber || "",
          company_name: userData?.company_name || "",
          expiryDate: userData?.expirydate || "",
          state: userData?.state?.state || userData?.state_info?.state || "",
          idProofno: userData?.idProofno || "",
          created_by_name: userData?.users[0]?.created_by_name || "",
          file_authLetter: userData?.file_authLetter || userData?.file_authorisation_letter || "",
          file_companRegCertificate: userData?.file_companRegCertificate || userData?.file_companyRegCertificate || "",
          file_GSTCertificate: userData?.file_GSTCertificate || userData?.file_gstCertificate || "",
          file_idProof: userData?.file_idProof || userData?.file_idProof || "",
          file_affidavitNda: userData?.file_affidavitNda || userData?.file_affidavit_nda || ""
        });

        setIsLoaded(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("User not found");
        } else {
          console.log("An error occurred while fetching user data");
        }
      }
    };

    retrieveUserDetails();
  }, [])

  const effectiveStatus = (statusOverride || requestStatus || "").toString();
  const effectiveStatusLower = effectiveStatus.trim().toLowerCase();
  const isApplicantActive = effectiveStatusLower === "active";
  const isRequestPending =
    effectiveStatusLower === "pending" ||
    effectiveStatusLower === "created" ||
    effectiveStatusLower === "";

  const handleBack = () => {
    try {
      if (window?.history?.length > 1) {
        navigate(-1);
        return;
      }
    } catch (e) {
      void e;
    }

    if (userType === 'serviceProvider') {
      navigate('/superadmin-dashboard/m2m-registration-requests');
      return;
    }
    if (userType === 'manufacturer') {
      navigate('/superadmin-dashboard/manufacturer-registration-requests');
      return;
    }
    navigate('/dashboard');
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setLoadingAction(true);
    try {
      const retrieveData =
        userType === 'manufacturer'
          ? await ManufacturerServices.findManufacturer({ manufacturer_id: userId })
          : await UserServices.fetchSimProvider({ eSimProvider_id: userId });

      const row = retrieveData?.data?.[0];
      const userRowId = row?.users?.[0]?.id;
      if (!userRowId) {
        setErrorMessage("User ID not found for this record.");
        return;
      }
      await UserServices.resendUserCreationOtp({ user_id: userRowId });
      setInfoMessage("OTP resent successfully.");
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to resend OTP."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleServiceProviderAccept = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setLoadingAction(true);
    try {
      await UserServices.updateSimProvider({
        esimprovider_id: userId,
        status: "Accept",
      });

      const retrieveData = await UserServices.fetchSimProvider({ eSimProvider_id: userId });
      const row = retrieveData?.data?.[0];
      const userRowId = row?.users?.[0]?.id;
      if (userRowId) {
        await UserServices.resendUserCreationOtp({ user_id: userRowId });
      }

      setStatusOverride("Accept");
      setLastApprovedId(userId);
      setInfoMessage("Request accepted.");
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to accept request."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleServiceProviderReject = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setLoadingAction(true);
    try {
      await UserServices.updateSimProvider({
        esimprovider_id: userId,
        status: "Reject",
      });
      setStatusOverride("Reject");
      setInfoMessage("Request rejected.");
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to reject request."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManufacturerAllowLogin = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setLoadingAction(true);
    try {
      await ManufacturerServices.updateManufacturer({
        manufacturer_id: userId,
        status: "Allow to login",
      });

      const retrieveData = await ManufacturerServices.findManufacturer({ manufacturer_id: userId });
      const row = retrieveData?.data?.[0];
      const userRowId = row?.users?.[0]?.id;
      if (userRowId) {
        await UserServices.resendUserCreationOtp({ user_id: userRowId });
      }

      setStatusOverride("Allow to login");
      setLastApprovedId(userId);
      setInfoMessage("Allow to login successful.");
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to allow login."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManufacturerAllowAddDealer = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setLoadingAction(true);
    try {
      await ManufacturerServices.updateManufacturer({
        manufacturer_id: userId,
        status: "Allow to add dealer",
      });

      const retrieveData = await ManufacturerServices.findManufacturer({ manufacturer_id: userId });
      const row = retrieveData?.data?.[0];
      const userRowId = row?.users?.[0]?.id;
      if (userRowId) {
        await UserServices.resendUserCreationOtp({ user_id: userRowId });
      }

      setStatusOverride("Allow to add dealer");
      setInfoMessage("Allow to add dealer successful.");
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to allow add dealer."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManufacturerReject = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setLoadingAction(true);
    try {
      await ManufacturerServices.updateManufacturer({
        manufacturer_id: userId,
        status: "Reject",
      });
      setStatusOverride("Reject");
      setInfoMessage("Request rejected.");
    } catch (e) {
      setErrorMessage(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to reject request."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const role = {
    devicemanufacture: 'Device Manufacturer',
    dealer: 'Dealer',
    stateadmin: 'State Admin',
    sosadmin: 'SOS Admin',
    SystemAdmin: 'System Admin',
    dtorto: 'DTO User',
    esimprovider: 'M2M Service Provider'
  }

  const documentsConfig = useMemo(() => {
    if (userType === 'serviceProvider') {
      return [
        { key: 'file_authLetter', label: 'Authorization Letter', fallbackKeys: ['file_authorisation_letter'] },
        { key: 'file_officialTechnicalOnboardingRequestLetter', label: 'Official Technical Onboarding Request Letter' },
        { key: 'file_selfCertifiedDotM2mRegistrationCertificate', label: 'Self-Certified DoT M2M Registration Certificate' },
        // Note: public form submits this as file_affidavitNda
        { key: 'file_affidavitNda', label: 'Affidavit-cum-Undertaking for Skytron Backend Access', fallbackKeys: ['file_affidavit_nda'] },
        // Note: public form submits this as file_GSTCertificate
        { key: 'file_GSTCertificate', label: 'Self-Certified GST Registration Certificate', fallbackKeys: ['file_gstCertificate'] },
        // Note: public form submits this as file_idProof
        { key: 'file_idProof', label: 'Self-Certified ID Proof of Authorised Signatory' },
        // Note: public form submits this as file_companRegCertificate
        {
          key: 'file_companRegCertificate',
          label: 'Self Certified Company registration certificate (Optional)',
          fallbackKeys: ['file_companyRegCertificate'],
        },
      ];
    }
    if (userType === 'manufacturer') {
      return [
        { key: 'file_authLetter', label: 'Authorization Letter', fallbackKeys: ['file_authorisation_letter'] },
        { key: 'file_officialTechnicalOnboardingRequestLetter', label: 'Official Technical Onboarding Request Letter' },
        { key: 'file_vehicleTypeApprovalTacAnnexureCopy', label: 'Self-Certified Vehicle Type Approval (TAC) Annexure Copy' },
        { key: 'file_ais140DeviceTacCopy', label: 'Self-Certified AIS-140 Device TAC Copy' },
        { key: 'file_factoryFitmentDeclaration', label: 'Factory Fitment Declaration' },
        { key: 'cop_file', label: 'COP File' },
        { key: 'file_affidavitNda', label: 'Affidavit-cum-Undertaking for Skytron Backend Access', fallbackKeys: ['file_affidavit_nda'] },
        { key: 'file_GSTCertificate', label: 'Self-Certified GST Registration Certificate', fallbackKeys: ['file_gstCertificate'] },
        { key: 'file_idProof', label: 'Self-Certified ID Proof of Authorised Signatory' },
        {
          key: 'file_companRegCertificate',
          label: 'Self Certified Company registration certificate (Optional)',
          fallbackKeys: ['file_companyRegCertificate'],
        },
      ];
    }
    return [];
  }, [userType]);

  const documentsToRender = useMemo(() => {
    const rec = rawRecord || {};
    const list = (Array.isArray(documentsConfig) ? documentsConfig : [])
      .map((d) => {
        const fallbackKeys = Array.isArray(d.fallbackKeys) ? d.fallbackKeys : [];
        const allKeys = [d.key, ...fallbackKeys].filter(Boolean);
        const fileUrl = allKeys.map((k) => rec?.[k]).find((v) => !!v);
        if (!fileUrl) return null;
        return {
          key: d.key,
          label: d.label,
          fileUrl,
        };
      })
      .filter(Boolean);

    // If backend sends extra file_* fields not in config, append them to avoid missing docs.
    const knownUrls = new Set(list.map((x) => x.fileUrl));
    Object.keys(rec || {})
      .filter((k) => k.startsWith('file_') && rec?.[k])
      .forEach((k) => {
        const v = rec[k];
        if (knownUrls.has(v)) return;
        list.push({ key: k, label: k, fileUrl: v });
      });

    return list;
  }, [documentsConfig, rawRecord]);

  return (
    <Card sx={styles.card}>
      {isLoaded && (
        <>
          <Box sx={styles.header}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <IconButton size="small" onClick={handleBack} aria-label="back">
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ ...styles.headerSubtitle, mb: 0 }}>Back</Typography>
                </Stack>
                <Typography sx={styles.headerTitle}>
                  {user.name && user.name.toUpperCase()}
                </Typography>
                <Typography sx={styles.headerSubtitle}>
                  {user.role && role[user.role]} {user.district && `- ${user.district}`}
                </Typography>
              </Box>

              {(userType === 'serviceProvider' || userType === 'manufacturer') && (
                <Box sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
                  {errorMessage && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {errorMessage}
                    </Alert>
                  )}
                  {infoMessage && (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      {infoMessage}
                    </Alert>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                    sx={{ flexWrap: 'wrap' }}
                  >
                    {((userType === 'serviceProvider' && (lastApprovedId === userId || isApplicantActive || effectiveStatusLower === 'accept')) ||
                      (userType === 'manufacturer' && (lastApprovedId === userId || isApplicantActive || effectiveStatusLower === 'allow to login' || effectiveStatusLower === 'allow to add dealer'))) && (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={loadingAction}
                          onClick={handleResendOtp}
                          sx={{
                            borderRadius: "6px",
                            textTransform: "none",
                            fontWeight: 600,
                            borderColor: "#f59e0b",
                            color: "#f59e0b",
                            px: 2,
                            "&:hover": {
                              backgroundColor: "#fff7ed",
                              borderColor: "#d97706",
                              color: "#d97706",
                            },
                          }}
                        >
                          Resend OTP
                        </Button>
                      )}
                    {userType === 'serviceProvider' ? (
                      isRequestPending ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={loadingAction}
                            onClick={handleServiceProviderReject}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              fontWeight: 600,
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              px: 2,
                              "&:hover": {
                                backgroundColor: "#fee2e2",
                                borderColor: "#dc2626",
                                color: "#dc2626",
                              },
                            }}                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={loadingAction}
                            onClick={handleServiceProviderAccept}
                            sx={{
                              backgroundColor: "#2563eb",
                              "&:hover": { backgroundColor: "#1d4ed8" },
                              whiteSpace: "nowrap",
                            }}
                          >
                            Accept
                          </Button>
                        </>
                      ) : null
                    ) : userType === 'manufacturer' ? (
                      lastApprovedId === userId || effectiveStatusLower === 'allow to login' || isApplicantActive ? (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={loadingAction}
                          onClick={handleManufacturerAllowAddDealer}
                          sx={{
                            borderRadius: "6px",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2,
                            borderColor: "#7c3aed", // 🟣 violet
                            color: "#7c3aed",
                            "&:hover": {
                              backgroundColor: "#f5f3ff",
                              borderColor: "#6d28d9",
                              color: "#6d28d9",
                            },
                          }}
                        >
                          Allow to add dealer
                        </Button>
                      ) : isRequestPending ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={loadingAction}
                            onClick={handleManufacturerReject}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              fontWeight: 600,
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              px: 2,
                              "&:hover": {
                                backgroundColor: "#fee2e2",
                                borderColor: "#dc2626",
                                color: "#dc2626",
                              },
                            }}                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={loadingAction}
                            onClick={handleManufacturerAllowLogin}
                            sx={{
                              backgroundColor: "#2563eb",
                              "&:hover": { backgroundColor: "#1d4ed8" },
                              whiteSpace: "nowrap",
                            }}
                          >
                            Allow to login
                          </Button>
                        </>
                      ) : null
                    ) : null}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          <CardContent sx={styles.content}>
            {/* Personal Information */}
            <Typography sx={styles.sectionTitle}>Personal Information</Typography>
            <Grid container spacing={3}>
              {(userType === 'manufacturer' || userType === 'serviceProvider') && user.name && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={styles.label}>Applicant Name</Typography>
                  <Typography sx={styles.value}>{user.name}</Typography>
                </Grid>
              )}
              {user.email && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={styles.label}>
                    {(userType === 'manufacturer' || userType === 'serviceProvider') ? 'Applicant Email' : 'Email'}
                  </Typography>
                  <Typography sx={styles.value}>{user.email}</Typography>
                </Grid>
              )}
              {user.mobile && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={styles.label}>
                    {(userType === 'manufacturer' || userType === 'serviceProvider') ? 'Applicant Mobile' : 'Mobile'}
                  </Typography>
                  <Typography sx={styles.value}>{user.mobile}</Typography>
                </Grid>
              )}
              {user.state && (
                <Grid item xs={12} sm={6}>
                  <Typography sx={styles.label}>
                    {(userType === 'manufacturer' || userType === 'serviceProvider') ? 'Applicant State' : 'State'}
                  </Typography>
                  <Typography sx={styles.value}>{user.state}</Typography>
                </Grid>
              )}
            </Grid>

            {/* Business Information */}
            {(user.company_name || user.gstNo || user.expiryDate) && (
              <>
                <Typography sx={{ ...styles.sectionTitle, mt: 4 }}>Business Information</Typography>
                <Grid container spacing={3}>
                  {user.expiryDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography sx={styles.label}>Expiry Date</Typography>
                      <Typography sx={styles.value}>{user.expiryDate}</Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Additional Information */}
            {user.idProofno && (
              <>
                <Typography sx={{ ...styles.sectionTitle, mt: 4 }}>Additional Information</Typography>
                <Grid container spacing={3}>
                  {user.idProofno && (
                    <Grid item xs={12} sm={6}>
                      <Typography sx={styles.label}>ID Proof Number</Typography>
                      <Typography sx={styles.value}>{user.idProofno}</Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Documents */}
            {documentsToRender.length > 0 && (
              <>
                <Typography sx={{ ...styles.sectionTitle, mt: 4 }}>Documents</Typography>
                <Grid container spacing={2}>
                  {documentsToRender.map((doc) => (
                    <Grid item key={doc.key}>
                      <Button
                        startIcon={<DescriptionIcon />}
                        sx={styles.documentButton}
                        onClick={(e) => openFile(e, doc.fileUrl)}
                      >
                        {doc.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default Details;
