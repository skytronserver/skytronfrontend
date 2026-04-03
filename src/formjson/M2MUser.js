import * as Yup from "yup";
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const stateList = [{ 'value': '', 'label': '' }];
const telecomProviderOptions = [
  { value: "airtel", label: "Airtel" },
  { value: "bsnl", label: "BSNL" },
  { value: "vodafone", label: "Vodafone" },
  { value: "jio", label: "Jio" },
];
const FILE_SIZE = 1024 * 1024; // 1 MB
const SUPPORTED_FORMATS = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
const today = new Date().toISOString().split('T')[0];
export const m2mUserInitialValues = {
  name: "",
  email: "",
  mobile: "",
  dob: "",
  idProofno: "",
  address: "",
  pin: "",
  state: '',

  company_name: "",
  company_email: "",
  company_phoneno: "",
  company_address: "",
  company_pin: "",
  lat: "",
  lon: "",

  gstnnumber: "",
  panno: "",
  company_registration_no: "",

  telecomProviders: [],
  m2m_reg_certificate_no: "",

  file_selfCertifiedIdProofAuthorisedSignatory: null,
  file_authLetter: null,
  file_selfCertifiedPanCard: null,
  file_selfCertifiedGstRegistrationCertificate: null,
  file_selfCertifiedCompanyRegistrationCertificateOptional: null,
  file_officialTechnicalOnboardingRequestLetter: null,
  file_affidavitCumUndertakingBackendAccess: null,
  file_selfCertifiedDotM2mRegistrationCertificate: null,

  status: "Pending",
  expirydate: formattedDate,
};

export const m2mUserFormField = {
  name: {
    name: "name",
    type: "text",
    label: "m2mUser.form.fields.name",
    validation: Yup.string().required("m2mUser.form.validation.name_required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "m2mUser.form.fields.email",
    validation: Yup.string().email("m2mUser.form.validation.invalid_email").required("m2mUser.form.validation.email_required"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "m2mUser.form.fields.mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'm2mUser.form.validation.invalid_mobile').required('m2mUser.form.validation.mobile_required'),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "m2mUser.form.fields.dob",
    validation: Yup.date().required("m2mUser.form.validation.dob_required"),
    maxDate: today
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "m2mUser.form.fields.id_proof_number",
    validation: Yup.string().min(5, "m2mUser.form.validation.id_proof_min_length").required("m2mUser.form.validation.id_proof_required"),
  },
  address: {
    name: "address",
    type: "text",
    label: "Applicant Address",
    validation: Yup.string().required("Address is required"),
  },
  pin: {
    name: "pin",
    type: "text",
    label: "Applicant PIN Code",
    validation: Yup.string()
      .matches(/^\d{6}$/, "PIN Code must be 6 digits")
      .required("PIN Code is required"),
  },
  state: {
    name: "state",
    type: "select",
    label: "m2mUser.form.fields.state",
    validation: Yup.string().required("m2mUser.form.validation.state_required"),
    options: stateList,
  },

  company_name: {
    name: "company_name",
    type: "text",
    label: "m2mUser.form.fields.company_name",
    validation: Yup.string().required("m2mUser.form.validation.company_name_required"),
  },
  company_email: {
    name: "company_email",
    type: "text",
    label: "Company Email",
    validation: Yup.string().email("Please enter a valid company email").required("Company Email is required"),
  },
  company_phoneno: {
    name: "company_phoneno",
    type: "tel",
    label: "Company Phone No",
    validation: Yup.string().matches(/^\d{10}$/, "Please enter a valid 10-digit phone number").required("Company Phone No is required"),
  },
  company_address: {
    name: "company_address",
    type: "text",
    label: "Company Address",
    validation: Yup.string().required("Company Address is required"),
  },
  company_pin: {
    name: "company_pin",
    type: "text",
    label: "Company PIN",
    validation: Yup.string().matches(/^\d{6}$/, "Please enter a valid 6-digit PIN").required("Company PIN is required"),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    validation: Yup.string()
      .matches(/^-?\d+\.\d+$/, "Latitude must be in decimal format (e.g., 21.9974)")
      .required("Latitude is required"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    gridHidden: true,
    validation: Yup.string()
      .matches(/^-?\d+\.\d+$/, "Longitude must be in decimal format (e.g., 79.0011)")
      .required("Longitude is required"),
  },

  gstnnumber: {
    name: "gstnnumber",
    type: "text",
    label: "Company GST No",
    validation: Yup.string()
      .matches(
        /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
        "Please enter a valid GST number"
      )
      .required("m2mUser.form.validation.gst_no_required"),
  },
  panno: {
    name: "panno",
    type: "text",
    label: "Company PAN No",
    validation: Yup.string().required("Company PAN No is required"),
  },
  company_registration_no: {
    name: "company_registration_no",
    type: "text",
    label: "Company Registration No (Optional)",
    validation: Yup.string().notRequired(), // Made optional as requested
  },

  telecomProviders: {
    name: "telecomProviders",
    type: "multiselect",
    label: "Linked Telecom Providers",
    validation: Yup.array()
      .min(2, "At least two telecom providers are required")
      .required("Linked Telecom Providers are required"),
    options: telecomProviderOptions,
  },
  m2m_reg_certificate_no: {
    name: "m2m_reg_certificate_no",
    type: "text",
    label: "DoT M2M Registration Certificate No",
    validation: Yup.string().required("M2M Registration Certificate No is required"),
  },

  file_selfCertifiedIdProofAuthorisedSignatory: {
    name: "file_selfCertifiedIdProofAuthorisedSignatory",
    type: "file",
    label: "Self-Certified ID Proof of Authorised Signatory",
    message: "m2mUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified ID Proof of Authorised Signatory is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_authLetter: {
    name: "file_authLetter",
    type: "file",
    label: "Authorization Letter",
    message: "m2mUser.form.validation.file_restrictions",
    downloadUrl: "/templates/M2M/M2M AUTHORISED REPRESENTATIVE.pdf",
    downloadLabel: "Format of authorisation letter",
    validation: Yup.mixed().required("Authorization Letter is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedPanCard: {
    name: "file_selfCertifiedPanCard",
    type: "file",
    label: "Self-Certified Company Pan Card",
    message: "m2mUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified Company Pan Card is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedGstRegistrationCertificate: {
    name: "file_selfCertifiedGstRegistrationCertificate",
    type: "file",
    label: "Self-Certified Company GST Registration Certificate",
    message: "m2mUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified Company GST Registration Certificate is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedCompanyRegistrationCertificateOptional: {
    name: "file_selfCertifiedCompanyRegistrationCertificateOptional",
    type: "file",
    label: "Self Certified Company registration certificate (Optional)",
    message: "m2mUser.form.validation.file_restrictions",
    validation: Yup.mixed().notRequired().test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return true;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return true;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_officialTechnicalOnboardingRequestLetter: {
    name: "file_officialTechnicalOnboardingRequestLetter",
    type: "file",
    label: "Official Technical Onboarding Request Letter",
    message: "m2mUser.form.validation.file_restrictions",
    downloadUrl: "/templates/M2M/M2M Service Provider – Technical Onboarding Request Letter.pdf",
    downloadLabel: "Format of request letter",
    validation: Yup.mixed().required("Official Technical Onboarding Request Letter is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_affidavitCumUndertakingBackendAccess: {
    name: "file_affidavitCumUndertakingBackendAccess",
    type: "file",
    label: "Affidavit-cum-Undertaking for Skytron Backend Access",
    message: "m2mUser.form.validation.file_restrictions",
    downloadUrl: "/templates/M2M/M2M AFFIDAVIT.pdf",
    downloadLabel: "Format of Affidavit-Cum-Undertaking",
    validation: Yup.mixed().required("Affidavit-cum-Undertaking for Skytron Backend Access is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedDotM2mRegistrationCertificate: {
    name: "file_selfCertifiedDotM2mRegistrationCertificate",
    type: "file",
    label: "Self-Certified DoT M2M Registration Certificate",
    message: "m2mUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified DoT M2M Registration Certificate is required").test("fileSize", "m2mUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "m2mUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
};
