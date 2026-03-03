import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import skytronlogo from "../../assets/images/skytron-logo2.png";
import PublicRegistrationMockService from "../../services/PublicRegistrationMockService";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import axios from "axios";
import { retriveCreatedSimProviderPub, retriveStateListPub } from "../../helper";
import { eSIMFormField, eSIMInitialValues } from "../../formjson/eSIMUser";
import {
  manufacturerFormField,
  manufacturerInitialValues,
} from "../../formjson/manufacturer";
import "./registrationForm.css";

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

const API_ENDPOINTS = {
  m2m: `${process.env.REACT_APP_BASE_URL}api/pub/eSimProvider/create_eSimProvider/`,
  manufacturer: `${process.env.REACT_APP_BASE_URL}api/pub/manufacturer/create_manufacturer/`,
};

const buildReferenceNo = (prefix, data) => {
  const raw = data?.id ?? data?.users?.[0]?.id;
  if (raw === undefined || raw === null || String(raw).trim() === "") return null;
  return `${prefix}/${raw}`;
};

const getReferencePrefixByRole = (roleLabel) => {
  if (roleLabel === "M2M Service Provider") return "M2M";
  if (roleLabel === "Vehicle Manufacturer") return "VEHICLE-MANUFACTURER";
  if (roleLabel === "AIS-140 Device Manufacturer") return "AIS-140-DEVICE-MANUFACTURER";
  return "REFERENCE";
};

const UserRegistrationForm = () => {
  const { role: roleSlug } = useParams();
  const selectedRole = getRoleLabel(roleSlug);
  const isSchoolAdmin = selectedRole === "School Administrator";
  const isM2MServiceProvider = selectedRole === "M2M Service Provider";
  const isManufacturerRole =
    selectedRole === "Vehicle Manufacturer" ||
    selectedRole === "AIS-140 Device Manufacturer";

  const [m2mInitialValuesState, setM2MInitialValuesState] = useState(eSIMInitialValues);
  const [manufacturerInitialValuesState, setManufacturerInitialValuesState] =
    useState(manufacturerInitialValues);

  const [m2mUpdatedFormFields, setM2MUpdatedFormField] = useState(eSIMFormField);
  const [isM2MFormLoaded, setIsM2MFormLoaded] = useState(false);

  const [manufacturerUpdatedFormFields, setManufacturerUpdatedFormField] =
    useState(manufacturerFormField);
  const [isManufacturerFormLoaded, setIsManufacturerFormLoaded] =
    useState(false);

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
  const [referenceNo, setReferenceNo] = useState(null);
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

  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  useEffect(() => {
    let active = true;
    if (!isM2MServiceProvider) {
      setIsM2MFormLoaded(false);
      setM2MUpdatedFormField(eSIMFormField);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const stateList = await retriveStateListPub();
        if (!active) return;

        const assamState = Array.isArray(stateList)
          ? stateList.find((s) => String(s?.label || "").toLowerCase() === "assam")
          : null;

        setM2MInitialValuesState((prev) => ({
          ...prev,
          state: assamState?.value ?? prev.state,
        }));

        setM2MUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          state: {
            ...prevConfig.state,
            gridHidden: true,
            disabled: true,
            options: [
              ...(assamState?.value
                ? [{ value: assamState.value, label: assamState.label }]
                : []),
              ...prevConfig.state.options,
            ],
          },
        }));
        setIsM2MFormLoaded(true);
      } catch (e) {
        if (!active) return;
        setIsM2MFormLoaded(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [isM2MServiceProvider]);

  useEffect(() => {
    let active = true;
    if (!isManufacturerRole) {
      setIsManufacturerFormLoaded(false);
      setManufacturerUpdatedFormField(manufacturerFormField);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const stateList = await retriveStateListPub();
        if (!active) return;

        const assamState = Array.isArray(stateList)
          ? stateList.find((s) => String(s?.label || "").toLowerCase() === "assam")
          : null;

        let eSimProvider = [];
        try {
          eSimProvider = await retriveCreatedSimProviderPub({});
          if (
            Array.isArray(eSimProvider) &&
            eSimProvider.length === 1 &&
            String(eSimProvider?.[0]?.label || "").toLowerCase().includes("no data")
          ) {
            eSimProvider = await retriveCreatedSimProviderPub({ state: "Assam" });
          }
        } catch (e) {
          eSimProvider = [];
        }

        setManufacturerInitialValuesState((prev) => ({
          ...prev,
          state: assamState?.value ?? prev.state,
          manufacturer_type: selectedRole === "Vehicle Manufacturer"
            ? "Vehicle manufacturer"
            : selectedRole === "AIS-140 Device Manufacturer"
              ? "Device manufacturer"
              : prev.manufacturer_type,
        }));

        setManufacturerUpdatedFormField((prevConfig) => {
          const nextConfig = {
            ...prevConfig,
            state: {
              ...prevConfig.state,
              gridHidden: true,
              disabled: true,
              options: assamState?.value
                ? [{ value: assamState.value, label: assamState.label }]
                : prevConfig.state.options,
            },
            esimProvider: {
              ...prevConfig.esimProvider,
              options: eSimProvider || [],
            },
            manufacturer_type: {
              ...prevConfig.manufacturer_type,
              disabled: selectedRole === "Vehicle Manufacturer" || selectedRole === "AIS-140 Device Manufacturer",
              options: selectedRole === "Vehicle Manufacturer"
                ? [
                  { label: "Vehicle manufacturer (Factory Fitted AIS-140 Device)", value: "Vehicle manufacturer" }
                ]
                : selectedRole === "AIS-140 Device Manufacturer"
                  ? [
                    { label: "Device manufacturer (Retrofitted AIS-140 Device)", value: "Device manufacturer" }
                  ]
                  : prevConfig.manufacturer_type?.options || []
            }
          };

          if (selectedRole === "Vehicle Manufacturer") {
            // keep factory fitment declaration for Vehicle Manufacturer
          } else {
            delete nextConfig.file_factoryFitmentDeclaration;
          }

          if (selectedRole === "AIS-140 Device Manufacturer") {
            delete nextConfig.device_model_details;
          }

          return nextConfig;
        });

        setIsManufacturerFormLoaded(true);
      } catch (e) {
        if (!active) return;
        setIsManufacturerFormLoaded(true); // always mark loaded even on error
      }
    })();

    return () => {
      active = false;
    };
  }, [isManufacturerRole, selectedRole]);

  const m2mValidationSchema = useMemo(() => {
    if (!isM2MServiceProvider) return null;
    const shape = Object.keys(m2mUpdatedFormFields).reduce((acc, field) => {
      acc[field] = m2mUpdatedFormFields[field].validation;
      return acc;
    }, {});
    return Yup.object(shape);
  }, [isM2MServiceProvider, m2mUpdatedFormFields]);

  const manufacturerValidationSchema = useMemo(() => {
    if (!isManufacturerRole) return null;
    const shape = Object.keys(manufacturerUpdatedFormFields).reduce((acc, field) => {
      acc[field] = manufacturerUpdatedFormFields[field].validation;
      return acc;
    }, {});
    return Yup.object(shape);
  }, [isManufacturerRole, manufacturerUpdatedFormFields]);

  const paperStyle = useMemo(
    () => ({
      background: "rgba(255, 255, 255, 0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.6)",
      borderRadius: "20px",
      boxShadow: "0 8px 40px rgba(128,0,128,0.13), 0 2px 8px rgba(0,0,0,0.08)",
      p: 0,
    }),
    []
  );

  const logoStyle = useMemo(() => ({}), []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleM2MSubmit = async (
    values,
    { setSubmitting: setFormikSubmitting, resetForm }
  ) => {
    setFormikSubmitting(true);
    setErrorMessage("");
    setInfoMessage("");
    setReferenceNo(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", values?.name || "");
      fd.append("email", values?.email || "");
      fd.append("mobile", values?.mobile || "");
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
      const stateRaw = values?.state;
      let stateId = stateRaw;
      if (typeof stateRaw === "string") {
        const trimmed = stateRaw.trim();
        const asNumber = trimmed !== "" ? Number(trimmed) : NaN;
        if (!Number.isNaN(asNumber)) {
          stateId = asNumber;
        } else {
          const opt = m2mUpdatedFormFields?.state?.options?.find(
            (o) => String(o?.label || "").toLowerCase() === trimmed.toLowerCase()
          );
          if (opt?.value !== undefined && opt?.value !== null && String(opt.value) !== "") {
            stateId = opt.value;
          }
        }
      }
      fd.append("stateId", stateId || "");
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

      const res = await axios.post(API_ENDPOINTS.m2m, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReferenceNo(buildReferenceNo(getReferencePrefixByRole(selectedRole), res?.data));
      setShowSuccess(true);
      resetForm({ values: eSIMInitialValues });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to submit registration request.";
      setErrorMessage(msg);
    } finally {
      setFormikSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleM2MSubmitWithTerms = (values, actions) => {
    setPendingSubmit(() => () => handleM2MSubmit(values, actions));
    setTermsOpen(true);
  };

  const handleTermsCancel = () => {
    setTermsOpen(false);
    setPendingSubmit(null);
  };

  const handleTermsConfirm = async () => {
    const fn = pendingSubmit;
    setTermsOpen(false);
    setPendingSubmit(null);
    if (typeof fn === "function") {
      await fn();
    }
  };

  const handleManufacturerStateChange = (event, formik) => {
    const fieldName = event.target.name;
    if (fieldName !== "state") return;

    (async () => {
      try {
        const getDetailsOf = { state: event.target.value };
        let eSimProvider = await retriveCreatedSimProviderPub({});
        if (
          Array.isArray(eSimProvider) &&
          eSimProvider.length === 1 &&
          String(eSimProvider?.[0]?.label || "").toLowerCase().includes("no data")
        ) {
          eSimProvider = await retriveCreatedSimProviderPub(getDetailsOf);
        }
        setManufacturerUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          esimProvider: {
            ...prevConfig.esimProvider,
            options: eSimProvider || [],
          },
        }));
      } catch (e) {
        setManufacturerUpdatedFormField((prevConfig) => ({
          ...prevConfig,
          esimProvider: {
            ...prevConfig.esimProvider,
            options: [],
          },
        }));
      }
    })();
  };

  const handleManufacturerSubmit = async (
    values,
    { setSubmitting: setFormikSubmitting, resetForm }
  ) => {
    setFormikSubmitting(true);
    setErrorMessage("");
    setInfoMessage("");
    setReferenceNo(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", values?.name || "");
      fd.append("email", values?.email || "");
      fd.append("mobile", values?.mobile || "");
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
      const stateRaw = values?.state;
      let stateId = stateRaw;
      if (typeof stateRaw === "string") {
        const trimmed = stateRaw.trim();
        const asNumber = trimmed !== "" ? Number(trimmed) : NaN;
        if (!Number.isNaN(asNumber)) {
          stateId = asNumber;
        } else {
          const opt = manufacturerUpdatedFormFields?.state?.options?.find(
            (o) => String(o?.label || "").toLowerCase() === trimmed.toLowerCase()
          );
          if (opt?.value !== undefined && opt?.value !== null && String(opt.value) !== "") {
            stateId = opt.value;
          }
        }
      }
      fd.append("state", stateId || "");
      fd.append("address", values?.address || "");
      fd.append("pin", values?.pin || "");
      fd.append("manufacturer_type", values?.manufacturer_type || "");
      fd.append("tac", values?.tac_no || values?.tac || "");
      fd.append("tac_validity", values?.tac_validity || "");
      const tacValidityRaw = values?.tac_validity;
      const tacDate = tacValidityRaw ? new Date(tacValidityRaw) : null;
      const todayDate = new Date(new Date().toISOString().split("T")[0]);
      const isTacExpired =
        tacDate && !Number.isNaN(tacDate.getTime())
          ? tacDate.getTime() < todayDate.getTime()
          : false;
      if (isTacExpired) {
        fd.append("cop_no", values?.cop_no || "");
        fd.append("cop_validity", values?.cop_validity || "");
      }
      fd.append("device_model_details", values?.device_model_details || "");
      fd.append("lat", values?.lat || "");
      fd.append("lon", values?.lon || "");

      (values?.esimProvider || []).forEach((id) => {
        if (id !== undefined && id !== null && String(id).trim() !== "") {
          fd.append("esimProvider[]", id);
        }
      });

      if (values?.file_authLetter) fd.append("file_authLetter", values.file_authLetter);
      if (values?.file_officialTechnicalOnboardingRequestLetter)
        fd.append(
          "file_officialTechnicalOnboardingRequestLetter",
          values.file_officialTechnicalOnboardingRequestLetter
        );
      if (values?.file_vehicleTypeApprovalTacAnnexureCopy)
        fd.append(
          "file_vehicleTypeApprovalTacAnnexureCopy",
          values.file_vehicleTypeApprovalTacAnnexureCopy
        );
      if (values?.file_ais140DeviceTacCopy)
        fd.append("file_ais140DeviceTacCopy", values.file_ais140DeviceTacCopy);
      if (isTacExpired && values?.cop_file) fd.append("cop_file", values.cop_file);
      if (
        selectedRole === "Vehicle Manufacturer" &&
        values?.file_factoryFitmentDeclaration
      )
        fd.append("file_factoryFitmentDeclaration", values.file_factoryFitmentDeclaration);
      if (values?.file_affidavitCumUndertakingBackendAccess)
        fd.append("file_affidavitNda", values.file_affidavitCumUndertakingBackendAccess);
      if (values?.file_selfCertifiedGstRegistrationCertificate)
        fd.append("file_GSTCertificate", values.file_selfCertifiedGstRegistrationCertificate);
      if (values?.file_selfCertifiedIdProofAuthorisedSignatory)
        fd.append("file_idProof", values.file_selfCertifiedIdProofAuthorisedSignatory);
      if (values?.file_selfCertifiedCompanyRegistrationCertificateOptional)
        fd.append(
          "file_companRegCertificate",
          values.file_selfCertifiedCompanyRegistrationCertificateOptional
        );

      const res = await axios.post(API_ENDPOINTS.manufacturer, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReferenceNo(buildReferenceNo(getReferencePrefixByRole(selectedRole), res?.data));
      setShowSuccess(true);
      resetForm({ values: manufacturerInitialValues });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to submit registration request.";
      setErrorMessage(msg);
    } finally {
      setFormikSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleManufacturerSubmitWithTerms = (values, actions) => {
    setPendingSubmit(() => () => handleManufacturerSubmit(values, actions));
    setTermsOpen(true);
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

  const doHandleSubmit = async () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setPendingSubmit(() => doHandleSubmit);
    setTermsOpen(true);
  };

  return (
    <Box className="reg-form-wrapper" sx={{ px: { xs: 1, sm: 4, md: 8, lg: 14, xl: 18 }, py: { xs: 2, sm: 4 }, width: "100%" }}>
      <Paper sx={paperStyle}>

        {/* ── Premium Header Banner ── */}
        <Box className="reg-header-banner">
          <img src={skytronlogo} alt="Skytron Logo" className="reg-logo-img" />
          <span className="reg-brand-name">SKYTRON</span>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
            <PersonAddIcon sx={{ fontSize: 42, color: "rgba(255,255,255,0.9)", mb: 0.5 }} />
          </Box>
          <Typography className="reg-form-title">New User Registration</Typography>
          <span className="reg-role-badge">{selectedRole || "Account Request"}</span>
        </Box>

        {/* ── Form Body ── */}
        <Box className="reg-form-body">

          {showSuccess && (
            <Box className="reg-success-box" sx={{ mb: 3 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 52, color: "#2e7d32", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                Registration Submitted!
              </Typography>
              <Typography variant="body2" sx={{ color: "#4caf50", mt: 0.5 }}>
                Your request has been received and is under review.
              </Typography>
              {referenceNo ? (
                <Typography variant="body2" sx={{ color: "#1b5e20", mt: 1, fontWeight: 700 }}>
                  Reference No: {referenceNo}
                </Typography>
              ) : null}
              <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  className="reg-outline-btn"
                  sx={{ py: 1, px: 2.5 }}
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
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
            isM2MServiceProvider ? (
              <Box>
                {isM2MFormLoaded && m2mValidationSchema ? (
                  <Formik
                    initialValues={m2mInitialValuesState}
                    validationSchema={m2mValidationSchema}
                    onSubmit={handleM2MSubmitWithTerms}
                    enableReinitialize
                  >
                    {(formik) => (
                      <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2} className="form-controller">
                          {(() => {
                            const keys = Object.keys(m2mUpdatedFormFields);
                            const nonFiles = keys.filter(
                              (k) => m2mUpdatedFormFields?.[k]?.type !== "file"
                            );
                            const files = keys.filter(
                              (k) => m2mUpdatedFormFields?.[k]?.type === "file"
                            );
                            return (
                              <>
                                {/* ── Text / select fields ── */}
                                {nonFiles.map((field) => {
                                  const cfg = m2mUpdatedFormFields[field];
                                  if (cfg?.gridHidden) return null;
                                  return (
                                    <Grid key={field} item xs={12} md={cfg?.gridFull ? 12 : 6} sm={12}>
                                      <FormField
                                        fieldConfig={cfg}
                                        formik={formik}
                                      />
                                    </Grid>
                                  );
                                })}

                                {/* ── Document uploads section ── */}
                                {files.length > 0 && (
                                  <Grid item xs={12} sx={{ mt: 1.5, mb: 0.5 }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        pt: 1,
                                        borderTop: "1.5px solid",
                                        borderColor: "rgba(128,0,128,0.18)",
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: "11px",
                                          fontWeight: 700,
                                          letterSpacing: "1.5px",
                                          textTransform: "uppercase",
                                          color: "#800080",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Document Uploads
                                      </Typography>
                                      <Box sx={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(128,0,128,0.22),transparent)" }} />
                                    </Box>
                                  </Grid>
                                )}

                                {files.map((field) => (
                                  <Grid key={field} item md={6} sm={12} xs={12}>
                                    <FormField
                                      fieldConfig={m2mUpdatedFormFields[field]}
                                      formik={formik}
                                    />
                                  </Grid>
                                ))}
                              </>
                            );
                          })()}
                          <Grid item xs={12} style={{ marginTop: "20px" }}>
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              className="reg-submit-btn"
                              startIcon={<PersonAddIcon />}
                              disabled={submitting}
                              sx={{ mt: 1, mb: 1 }}
                            >
                              {submitting ? "Submitting..." : "Submit Registration Request"}
                            </Button>
                          </Grid>
                        </Grid>
                        <Box sx={{ textAlign: "center", mt: 1 }}>
                          <Button
                            variant="text"
                            className="reg-text-link"
                            startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
                            onClick={() => (window.location.href = "/user-registration-request")}
                          >
                            Change Role
                          </Button>
                        </Box>
                      </form>
                    )}
                  </Formik>
                ) : null}
              </Box>
            ) : isManufacturerRole ? (
              <Box>
                {isManufacturerFormLoaded && manufacturerValidationSchema ? (
                  <Formik
                    initialValues={manufacturerInitialValuesState}
                    validationSchema={manufacturerValidationSchema}
                    onSubmit={handleManufacturerSubmitWithTerms}
                    enableReinitialize
                  >
                    {(formik) => (
                      <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2} className="form-controller">
                          {(() => {
                            const keys = Object.keys(manufacturerUpdatedFormFields);
                            const nonFiles = keys.filter(
                              (k) => manufacturerUpdatedFormFields?.[k]?.type !== "file"
                            );
                            const files = keys.filter(
                              (k) => manufacturerUpdatedFormFields?.[k]?.type === "file"
                            );
                            const tacValidityRaw = formik?.values?.tac_validity;
                            const tacDate = tacValidityRaw ? new Date(tacValidityRaw) : null;
                            const todayDate = new Date(new Date().toISOString().split("T")[0]);
                            const isTacExpired =
                              tacDate && !Number.isNaN(tacDate.getTime())
                                ? tacDate.getTime() < todayDate.getTime()
                                : false;
                            const shouldHideCop = !isTacExpired;
                            const hiddenKeys = shouldHideCop
                              ? new Set(["cop_no", "cop_validity", "cop_file"])
                              : new Set();

                            const visibleNonFiles = nonFiles.filter((f) => !hiddenKeys.has(f));
                            const visibleFiles = files.filter((f) => !hiddenKeys.has(f));

                            return (
                              <>
                                {/* ── Text / select fields ── */}
                                {visibleNonFiles.map((field) => {
                                  const cfg = manufacturerUpdatedFormFields[field];
                                  if (cfg?.gridHidden) return null;
                                  return (
                                    <Grid key={field} item xs={12} md={cfg?.gridFull ? 12 : 6} sm={12}>
                                      <FormField
                                        fieldConfig={cfg}
                                        formik={formik}
                                        handleOptionChange={handleManufacturerStateChange}
                                      />
                                    </Grid>
                                  );
                                })}

                                {/* ── Document uploads section ── */}
                                {visibleFiles.length > 0 && (
                                  <Grid item xs={12} sx={{ mt: 1.5, mb: 0.5 }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        pt: 1,
                                        borderTop: "1.5px solid",
                                        borderColor: "rgba(128,0,128,0.18)",
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: "11px",
                                          fontWeight: 700,
                                          letterSpacing: "1.5px",
                                          textTransform: "uppercase",
                                          color: "#800080",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Document Uploads
                                      </Typography>
                                      <Box sx={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(128,0,128,0.22),transparent)" }} />
                                    </Box>
                                  </Grid>
                                )}

                                {visibleFiles.map((field) => (
                                  <Grid key={field} item md={6} sm={12} xs={12}>
                                    <FormField
                                      fieldConfig={manufacturerUpdatedFormFields[field]}
                                      formik={formik}
                                      handleOptionChange={handleManufacturerStateChange}
                                    />
                                  </Grid>
                                ))}
                              </>
                            );
                          })()}
                          <Grid item xs={12} style={{ marginTop: "20px" }}>
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              className="reg-submit-btn"
                              startIcon={<PersonAddIcon />}
                              disabled={submitting}
                              sx={{ mt: 1, mb: 1 }}
                            >
                              {submitting ? "Submitting..." : "Submit Registration Request"}
                            </Button>
                          </Grid>
                        </Grid>
                        <Box sx={{ textAlign: "center", mt: 1 }}>
                          <Button
                            variant="text"
                            className="reg-text-link"
                            startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
                            onClick={() => (window.location.href = "/user-registration-request")}
                          >
                            Change Role
                          </Button>
                        </Box>
                      </form>
                    )}
                  </Formik>
                ) : null}
              </Box>
            ) : (
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
                  className="reg-submit-btn"
                  startIcon={<PersonAddIcon />}
                  disabled={submitting}
                  sx={{ mt: 3, mb: 1 }}
                >
                  {submitting ? "Submitting..." : "Submit Registration Request"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 1 }}>
                  <Button
                    variant="text"
                    className="reg-text-link"
                    startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
                    onClick={() => (window.location.href = "/user-registration-request")}
                  >
                    Change Role
                  </Button>
                </Box>
              </Box>
            )
          )}
        </Box> {/* end reg-form-body */}
      </Paper>

      <Dialog
        open={termsOpen}
        onClose={handleTermsCancel}
        maxWidth="sm"
        fullWidth
        className="reg-terms-dialog"
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #6a0080, #9c27b0)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            py: 2,
          }}
        >
          Terms and Conditions
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          <Box component="ol" sx={{ pl: 2.5, mb: 0, "& li": { mb: 1.5, color: "#444", lineHeight: 1.6 } }}>
            <li>Submission of documents does not automatically guarantee backend access.</li>
            <li>Implementation Agency reserves the right to verify submitted documents with issuing authorities.</li>
            <li>Implementation Agency may conduct technical compatibility evaluation prior to granting access.</li>
            <li>Backend access, if granted, shall be role-based, limited, and revocable at sole discretion of the Implementation Agency.</li>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleTermsCancel} variant="outlined" className="reg-outline-btn" sx={{ px: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleTermsConfirm} variant="contained" className="reg-submit-btn" sx={{ px: 3, py: 1 }}>
            I Agree &amp; Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRegistrationForm;
