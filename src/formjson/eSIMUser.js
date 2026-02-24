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
export const eSIMInitialValues = {
  name: "",
  mobile: "",
  email: "",
  company_name: "",
  dob: "",
  status: "Pending",
  expirydate: formattedDate,
  gstnnumber: "",
  panno: "",
  company_registration_no: "",
  idProofno: "",
  state: '',
  address: "",
  pin: "",
  telecomProviders: [],
  company_address: "",
  company_pin: "",
  company_email: "",
  company_phoneno: "",
  m2m_reg_certificate_no: "",
  file_authLetter: null,
  file_officialTechnicalOnboardingRequestLetter: null,
  file_selfCertifiedDotM2mRegistrationCertificate: null,
  file_affidavitCumUndertakingBackendAccess: null,
  file_selfCertifiedGstRegistrationCertificate: null,
  file_selfCertifiedIdProofAuthorisedSignatory: null,
  file_selfCertifiedCompanyRegistrationCertificateOptional: null,
  lat: "",
  lon: "",
};

export const eSIMFormField = {
  name: {
    name: "name",
    type: "text",
    label: "esimUser.form.fields.name",
    validation: Yup.string().required("esimUser.form.validation.name_required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "esimUser.form.fields.email",
    validation: Yup.string().email("esimUser.form.validation.invalid_email").required("esimUser.form.validation.email_required"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "esimUser.form.fields.mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'esimUser.form.validation.invalid_mobile').required('esimUser.form.validation.mobile_required'),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "esimUser.form.fields.dob",
    validation: Yup.date().required("esimUser.form.validation.dob_required"),
    maxDate: today
  },
  expirydate: {
    name: "expirydate",
    type: "date",
    label: "esimUser.form.fields.expiry_date",
    validation: Yup.date().required("esimUser.form.validation.expiry_date_required"),
    minDate: today,
    disabled: true
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
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "esimUser.form.fields.id_proof_number",
    validation: Yup.string().min(5, "esimUser.form.validation.id_proof_min_length").required("esimUser.form.validation.id_proof_required"),
  },
  company_name: {
    name: "company_name",
    type: "text",
    label: "esimUser.form.fields.company_name",
    validation: Yup.string().required("esimUser.form.validation.company_name_required"),
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
  gstnnumber: {
    name: "gstnnumber",
    type: "text",
    label: "esimUser.form.fields.gst_no",
    validation: Yup.string()
      .matches(
        /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
        "Please enter a valid GST number"
      )
      .required("esimUser.form.validation.gst_no_required"),
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
    label: "Company Registration No",
    validation: Yup.string().required("Company Registration No is required"),
  },
  state: {
    name: "state",
    type: "select",
    label: "esimUser.form.fields.state",
    validation: Yup.string().required("esimUser.form.validation.state_required"),
    options: stateList,
  },
  telecomProviders: {
    name: "telecomProviders",
    type: "multiselect",
    label: "Linked Telecom Providers",
    validation: Yup.array()
      .min(1, "Please select at least one telecom provider")
      .required("Please select at least one telecom provider"),
    options: telecomProviderOptions,
  },
  m2m_reg_certificate_no: {
    name: "m2m_reg_certificate_no",
    type: "text",
    label: "M2M Registration Certificate No",
    validation: Yup.string().required("M2M Registration Certificate No is required"),
  },

  file_authLetter:{
    name:"file_authLetter",
    type: "file",
    label: "Authorization Letter",
    message: "esimUser.form.validation.file_restrictions",
    downloadUrl: "/templates/authorization-letter-format.txt",
    downloadLabel: "Format of authorisation letter",
    validation: Yup.mixed().required("Authorization Letter is required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },

  file_officialTechnicalOnboardingRequestLetter: {
    name: "file_officialTechnicalOnboardingRequestLetter",
    type: "file",
    label: "Official Technical Onboarding Request Letter",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Official Technical Onboarding Request Letter is required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedDotM2mRegistrationCertificate: {
    name: "file_selfCertifiedDotM2mRegistrationCertificate",
    type: "file",
    label: "Self-Certified DoT M2M Registration Certificate",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified DoT M2M Registration Certificate is required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_affidavitCumUndertakingBackendAccess: {
    name: "file_affidavitCumUndertakingBackendAccess",
    type: "file",
    label: "Affidavit-cum-Undertaking for Skytron Backend Access",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Affidavit-cum-Undertaking for Skytron Backend Access is required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedGstRegistrationCertificate: {
    name: "file_selfCertifiedGstRegistrationCertificate",
    type: "file",
    label: "Self-Certified GST Registration Certificate",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified GST Registration Certificate is required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedIdProofAuthorisedSignatory: {
    name: "file_selfCertifiedIdProofAuthorisedSignatory",
    type: "file",
    label: "Self-Certified ID Proof of Authorised Signatory",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().required("Self-Certified ID Proof of Authorised Signatory is required").test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedCompanyRegistrationCertificateOptional: {
    name: "file_selfCertifiedCompanyRegistrationCertificateOptional",
    type: "file",
    label: "Self Certified Company registration certificate (Optional)",
    message: "esimUser.form.validation.file_restrictions",
    validation: Yup.mixed().notRequired().test("fileSize", "esimUser.form.validation.file_size", value => {
      if (!value) return true;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "esimUser.form.validation.file_format", value => {
        if (!value) return true;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
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
