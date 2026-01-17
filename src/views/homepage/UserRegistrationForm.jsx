import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import skytronlogo from "../../assets/images/skytron-logo2.png";
import PublicRegistrationMockService from "../../services/PublicRegistrationMockService";

const ROLE_OPTIONS = [
  { slug: "m2m-service-provider", label: "M2M Service Provider" },
  { slug: "vehicle-manufacturer", label: "Vehicle Manufacturer" },
  {
    slug: "ais-140-device-manufacturer",
    label: "AIS-140 Device Manufacturer",
  },
  { slug: "school-administrator", label: "School Administrator" },
  { slug: "others", label: "Others" },
];

const getRoleLabel = (slug) =>
  ROLE_OPTIONS.find((x) => x.slug === slug)?.label || "";

const UserRegistrationForm = () => {
  const { role: roleSlug } = useParams();
  const selectedRole = getRoleLabel(roleSlug);
  const isSchoolAdmin = selectedRole === "School Administrator";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    org_name: "",
    email: "",
    mobile: "",
    dob: "1990-01-01",
    request: "",
    gst_no: "",
    registration_no: "",
    plant_location: "",
    cop_no: "",
    udise_code: "",
    district: "",
    address: "",
    latitude: "",
    longitude: "",
    otp: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentError, setDocumentError] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [schoolDocs, setSchoolDocs] = useState({
    principalRequestLetter: null,
    representativeKycDocument: null,
  });
  const [schoolDocError, setSchoolDocError] = useState("");

  const paperStyle = useMemo(
    () => ({
      p: 3,
      backdropFilter: "blur(5px)",
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    }),
    []
  );

  const logoStyle = useMemo(
    () => ({
      color: "#800080",
      fontFamily: "Quantico",
      fontWeight: "900",
      fontSize: "15px",
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    }),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePdfFile = (file) => {
    if (!file) return { ok: false, error: "File is required." };
    const isPdf =
      file.type === "application/pdf" ||
      (file.type === "" && file.name.toLowerCase().endsWith(".pdf"));
    if (!isPdf) return { ok: false, error: "Only PDF files are allowed." };
    const maxSizeBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { ok: false, error: "File size must not exceed 3 MB." };
    }
    return { ok: true, error: "" };
  };

  const handleSchoolDocChange = (key) => (e) => {
    const file = (e.target.files || [])[0] || null;
    setSchoolDocError("");
    if (!file) {
      setSchoolDocs((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const v = validatePdfFile(file);
    if (!v.ok) {
      setSchoolDocs((prev) => ({ ...prev, [key]: null }));
      setSchoolDocError(v.error);
      e.target.value = "";
      return;
    }
    setSchoolDocs((prev) => ({ ...prev, [key]: file }));
  };

  const handleUseMyLocation = () => {
    setErrorMessage("");
    setInfoMessage("");
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setInfoMessage("Location captured.");
      },
      () => {
        setErrorMessage(
          "Unable to capture location. Please allow location permission."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSendOtp = () => {
    setErrorMessage("");
    setInfoMessage("");
    if (!formData.mobile || String(formData.mobile).trim().length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number first.");
      return;
    }
    setOtpSent(true);
    setInfoMessage("OTP sent (demo). Use 123456.");
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      setDocuments([]);
      setDocumentError("");
      return;
    }

    const pdfFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        (file.type === "" && file.name.toLowerCase().endsWith(".pdf"))
    );

    const totalSize = pdfFiles.reduce((sum, file) => sum + file.size, 0);
    const maxSizeBytes = 3 * 1024 * 1024;

    if (!pdfFiles.length) {
      setDocuments([]);
      setDocumentError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (totalSize > maxSizeBytes) {
      setDocuments([]);
      setDocumentError("Total size of uploaded PDFs must not exceed 3 MB.");
      e.target.value = "";
      return;
    }

    setDocuments(pdfFiles);
    setDocumentError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setInfoMessage("");

    if (!selectedRole) {
      setErrorMessage("Invalid role. Please go back and select a role.");
      setSubmitting(false);
      return;
    }

    if (!isSchoolAdmin && documentError) {
      setSubmitting(false);
      return;
    }

    if (isSchoolAdmin) {
      if (!formData.org_name.trim()) {
        setErrorMessage("Name of School is required.");
        setSubmitting(false);
        return;
      }
      if (!formData.firstName.trim()) {
        setErrorMessage("Name of Contact Person is required.");
        setSubmitting(false);
        return;
      }
      if (!formData.address.trim()) {
        setErrorMessage("School Address is required.");
        setSubmitting(false);
        return;
      }
      if (!formData.latitude.trim() || !formData.longitude.trim()) {
        setErrorMessage("School latitude and longitude are required.");
        setSubmitting(false);
        return;
      }
      if (!otpSent) {
        setErrorMessage("Please send OTP first.");
        setSubmitting(false);
        return;
      }
      if (String(formData.otp).trim() !== "123456") {
        setErrorMessage("Invalid OTP (demo). Use 123456.");
        setSubmitting(false);
        return;
      }

      const principalV = validatePdfFile(schoolDocs.principalRequestLetter);
      const repV = validatePdfFile(schoolDocs.representativeKycDocument);
      if (!principalV.ok || !repV.ok) {
        setSchoolDocError(principalV.error || repV.error);
        setErrorMessage(
          "Please upload mandatory school documents (PDF, max 3 MB each)."
        );
        setSubmitting(false);
        return;
      }
      if (schoolDocError) {
        setSubmitting(false);
        return;
      }
    }

    try {
      const applicantName = isSchoolAdmin
        ? formData.firstName.trim()
        : formData.firstName + (formData.lastName ? ` ${formData.lastName}` : "");

      const payload = {
        role: selectedRole,
        applicant: {
          name: applicantName,
          email: formData.email,
          mobile: formData.mobile,
          dob: isSchoolAdmin ? undefined : formData.dob,
        },
        organization: {
          name: formData.org_name,
        },
        roleDetails: {
          gst_no: formData.gst_no,
          registration_no: formData.registration_no,
          plant_location: formData.plant_location,
          cop_no: formData.cop_no,
          udise_code: isSchoolAdmin ? undefined : formData.udise_code,
          district: isSchoolAdmin ? undefined : formData.district,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          otp_verified: isSchoolAdmin ? true : undefined,
          request_detail: isSchoolAdmin ? undefined : formData.request,
        },
        documents: [
          ...(!isSchoolAdmin
            ? documents.map((f) => ({
              name: f.name,
              type: f.type,
              size: f.size,
            }))
            : []),
          ...(schoolDocs.principalRequestLetter
            ? [
              {
                name: schoolDocs.principalRequestLetter.name,
                type: schoolDocs.principalRequestLetter.type,
                size: schoolDocs.principalRequestLetter.size,
                category: "Principal Request Letter",
              },
            ]
            : []),
          ...(schoolDocs.representativeKycDocument
            ? [
              {
                name: schoolDocs.representativeKycDocument.name,
                type: schoolDocs.representativeKycDocument.type,
                size: schoolDocs.representativeKycDocument.size,
                category: "Representative KYC Document",
              },
            ]
            : []),
        ],
      };

      const res = PublicRegistrationMockService.createRequest(payload);
      setReferenceNumber(res.referenceNumber);
      setShowSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        org_name: "",
        email: "",
        mobile: "",
        dob: "1990-01-01",
        request: "",
        gst_no: "",
        registration_no: "",
        plant_location: "",
        cop_no: "",
        udise_code: "",
        district: "",
        address: "",
        latitude: "",
        longitude: "",
        otp: "",
      });
      setDocuments([]);
      setDocumentError("");
      setSchoolDocs({ principalRequestLetter: null, representativeKycDocument: null });
      setSchoolDocError("");
      setOtpSent(false);
    } catch (err) {
      const msg = err?.message || "Failed to submit registration request.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
        <Grid item xs={12} md={8} lg={6}>
          <Paper sx={paperStyle}>
            <Typography variant="h6" gutterBottom align="center">
              <img
                src={skytronlogo}
                alt="Logo"
                style={{ height: "auto", width: "36px" }}
              />
              <br />
              <span style={logoStyle}>SKYTRON</span>
            </Typography>

            <Box sx={{ textAlign: "center", mb: 3 }}>
              <PersonAddIcon sx={{ fontSize: 48, color: "#800080", mb: 2 }} />

              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#800080", mb: 1 }}
              >
                New User Registration
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Role: <strong>{selectedRole || "-"}</strong>
              </Typography>
            </Box>

            {showSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Registration request submitted successfully.
                {referenceNumber ? (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Reference Number: <strong>{referenceNumber}</strong>
                    </Typography>
                    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#800080",
                          "&:hover": { backgroundColor: "#660066" },
                        }}
                        onClick={() =>
                        (window.location.href =
                          "/registration-status?ref=" +
                          encodeURIComponent(referenceNumber))
                        }
                      >
                        Track Status
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: "#800080",
                          color: "#800080",
                          "&:hover": { borderColor: "#660066", color: "#660066" },
                        }}
                        onClick={() => (window.location.href = "/")}
                      >
                        Back to Login
                      </Button>
                    </Box>
                  </Box>
                ) : null}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            {infoMessage && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {infoMessage}
              </Alert>
            )}

            {!showSuccess && (
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {isSchoolAdmin ? (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Name of School"
                          name="org_name"
                          value={formData.org_name}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Name of Contact Person"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Organisation Name"
                          name="org_name"
                          value={formData.org_name}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" disabled>
                      <InputLabel>User Role</InputLabel>
                      <Select label="User Role" value={selectedRole || ""}>
                        {ROLE_OPTIONS.map((r) => (
                          <MenuItem key={r.slug} value={r.label}>
                            {r.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {(selectedRole === "Vehicle Manufacturer" ||
                    selectedRole === "AIS-140 Device Manufacturer") && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="GST Number"
                          name="gst_no"
                          value={formData.gst_no}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                    )}

                  {selectedRole === "M2M Service Provider" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Provider Registration Number"
                        name="registration_no"
                        value={formData.registration_no}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                  )}

                  {selectedRole === "Vehicle Manufacturer" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Plant Location"
                        name="plant_location"
                        value={formData.plant_location}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                  )}

                  {selectedRole === "AIS-140 Device Manufacturer" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="COP Number"
                        name="cop_no"
                        value={formData.cop_no}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                  )}

                  {isSchoolAdmin && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email ID"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mobile Number"
                          name="mobile"
                          type="tel"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          inputProps={{
                            pattern: "[0-9]{10}",
                            title: "Please enter a valid 10-digit mobile number",
                          }}
                          placeholder="Enter 10-digit mobile number"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="School Address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="School Latitude"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="School Longitude"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleUseMyLocation}
                          sx={{
                            borderColor: "#800080",
                            color: "#800080",
                            "&:hover": { borderColor: "#660066", color: "#660066" },
                          }}
                        >
                          Use my location
                        </Button>
                      </Grid>

                      <Grid item xs={12} md={7}>
                        <TextField
                          fullWidth
                          label="OTP"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          inputProps={{ maxLength: 6 }}
                        />
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleSendOtp}
                          sx={{
                            borderColor: "#800080",
                            color: "#800080",
                            py: 1.75,
                            "&:hover": { borderColor: "#660066", color: "#660066" },
                          }}
                        >
                          Send OTP
                        </Button>
                      </Grid>


                      <Grid item xs={12} md={6}>
                        <Box>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{
                              borderColor: "#800080",
                              color: "#800080",
                              justifyContent: "space-between",
                              "&:hover": {
                                borderColor: "#660066",
                                color: "#660066",
                              },
                            }}
                          >
                            Upload Principal Letter (PDF)
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              hidden
                              onChange={handleSchoolDocChange("principalRequestLetter")}
                            />
                          </Button>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {schoolDocs.principalRequestLetter?.name ||
                              "Request letter from the School Principal"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{
                              borderColor: "#800080",
                              color: "#800080",
                              justifyContent: "space-between",
                              "&:hover": {
                                borderColor: "#660066",
                                color: "#660066",
                              },
                            }}
                          >
                            Upload KYC Document (PDF)
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              hidden
                              onChange={handleSchoolDocChange("representativeKycDocument")}
                            />
                          </Button>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {schoolDocs.representativeKycDocument?.name ||
                              "KYC document of the authorised representative"}
                          </Typography>
                        </Box>
                      </Grid>
                      {schoolDocError ? (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="error">
                            {schoolDocError}
                          </Typography>
                        </Grid>
                      ) : null}
                    </>
                  )}

                  {!isSchoolAdmin && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mobile Number"
                          name="mobile"
                          type="tel"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          inputProps={{
                            pattern: "[0-9]{10}",
                            title: "Please enter a valid 10-digit mobile number",
                          }}
                          placeholder="Enter 10-digit mobile number"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date of Birth"
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{
                              borderColor: "#800080",
                              color: "#800080",
                              justifyContent: "space-between",
                              py: 1.75,
                              "&:hover": {
                                borderColor: "#660066",
                                color: "#660066",
                              },
                            }}
                          >
                            Upload Documents (PDF)
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              multiple
                              hidden
                              onChange={handleDocumentChange}
                            />
                          </Button>
                          {documentError && (
                            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                              {documentError}
                            </Typography>
                          )}
                          {!documentError && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {documents.length > 0
                                ? `${documents.length} PDF file(s) selected (max total 3 MB)`
                                : "Upload supporting documents (PDF, max total 3 MB)"}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={
                            selectedRole === "Others"
                              ? "Please describe your role and request"
                              : "Your Request"
                          }
                          name="request"
                          value={formData.request}
                          onChange={handleInputChange}
                          required
                          multiline
                          rows={4}
                          variant="outlined"
                          placeholder="Please describe your account request and requirements..."
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: "#800080",
                    "&:hover": {
                      backgroundColor: "#660066",
                    },
                    py: 1.5,
                  }}
                  startIcon={<PersonAddIcon />}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Registration Request"}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="text"
                    onClick={() => (window.location.href = "/user-registration-request")}
                    sx={{
                      color: "#800080",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Change Role
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserRegistrationForm;
