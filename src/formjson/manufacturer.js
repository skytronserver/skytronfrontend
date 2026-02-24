import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
let providerList=[{value:'',label:'Select'}];
const FILE_SIZE = 1024 * 1024 ; // 1 MB
const SUPPORTED_FORMATS = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
const today = new Date().toISOString().split('T')[0];
const isTacExpired = (tacValidity) => {
  if (!tacValidity) return false;
  const d = new Date(tacValidity);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date(today);
  return d.getTime() < t.getTime();
};
export const manufacturerInitialValues = {
    esimProvider:[],
    name: "",
    mobile: "",
    email: "",
    dob:"",
    status: "Pending",
    expirydate:formattedDate,
    company_name: "",
    company_address: "",
    company_pin: "",
    company_email: "",
    company_phoneno: "",
    gstnnumber: "",
    panno: "",
    company_registration_no: "",
    idProofno:"",
    state:"",
    address: "",
    pin: "",
    notification_settings: true,
    manufacturer_type: "",
    file_officialTechnicalOnboardingRequestLetter: null,
    file_vehicleTypeApprovalTacAnnexureCopy: null,
    file_ais140DeviceTacCopy: null,
    file_factoryFitmentDeclaration: null,
    file_affidavitCumUndertakingBackendAccess: null,
    file_selfCertifiedGstRegistrationCertificate: null,
    file_selfCertifiedIdProofAuthorisedSignatory: null,
    file_selfCertifiedCompanyRegistrationCertificateOptional: null,
    tac_no: "",
    tac_validity: "",
    cop_no: "",
    cop_validity: "",
    device_model_details: "",
    lat: "",
    lon: "",
};

export const manufacturerFormField = {
  name: {
    name:"name",
    type: "text",
    label: "manufacturer.form.fields.name",
    validation: Yup.string().required("manufacturer.form.validation.name_required"),
  },
  email: {
    name:"email",
    type: "text",
    label: "manufacturer.form.fields.email",
    validation: Yup.string().email("manufacturer.form.validation.invalid_email").required("manufacturer.form.validation.email_required"),
  },
  mobile: {
    name:"mobile",
    type: "tel",
    label: "manufacturer.form.fields.mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'manufacturer.form.validation.invalid_mobile').required('manufacturer.form.validation.mobile_required'),
  },
  company_name: {
    name:"company_name",
    type: "text",
    label: "manufacturer.form.fields.company_name",
    validation: Yup.string().required("manufacturer.form.validation.company_name_required"),
  },
  dob: {
    name:"dob",
    type: "date", 
    label: "manufacturer.form.fields.dob",
    validation: Yup.date()
      .required("manufacturer.form.validation.dob_required")
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "manufacturer.form.validation.age_restriction")
      .max(today, "manufacturer.form.validation.future_date"),
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "manufacturer.form.fields.expiry_date",
    validation: Yup.date().required("manufacturer.form.validation.expiry_date_required"),
    minDate:today,
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
    name:"idProofno",
    type: "text",
    label: "manufacturer.form.fields.id_proof_number",
    validation: Yup.string().min(5, "manufacturer.form.validation.id_proof_min_length").required("manufacturer.form.validation.id_proof_required"),
  },
  gstnnumber: {
    name:"gstnnumber",
    type: "text",
    label: "manufacturer.form.fields.gst_no",
    validation: Yup.string()
      .matches(
        /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
        "Please enter a valid GST number"
      )
      .required("manufacturer.form.validation.gst_no_required"),
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
  manufacturer_type: {
    name: "manufacturer_type",
    type: "select",
    label: "Manufacturer Type",
    validation: Yup.string().required("Manufacturer Type is required"),
    options: [
      { label: "Select", value: "" },
      { label: "Vehicle manufacturer", value: "Vehicle manufacturer" },
      { label: "Device manufacturer", value: "Device manufacturer" },
    ],
  },
  state: {
    name:"state",
    type: "select",
    label: "manufacturer.form.fields.state",
    validation: Yup.string().required("manufacturer.form.validation.state_required"),
    options:[{'label':'manufacturer.form.select','value':''}]
  },
  esimProvider: {
    name:"esimProvider",
    type: "multiselect",
    label: "manufacturer.form.fields.m2m_provider",
    validation: Yup.array().required("manufacturer.form.validation.esim_provider_required"),
    options: providerList
  },
  notification_settings: {
    name: "notification_settings",
    type: "checkbox",
    label: "Enable Notifications",
    validation: Yup.boolean(),
  },
  tac_no: {
    name: "tac_no",
    type: "text",
    label: "TAC No",
    validation: Yup.string().required("TAC No is required"),
  },
  tac_validity: {
    name: "tac_validity",
    type: "date",
    label: "TAC Validity",
    validation: Yup.date().required("TAC Validity is required"),
    minDate: today,
  },
  cop_no: {
    name: "cop_no",
    type: "text",
    label: "COP No",
    validation: Yup.string().when("tac_validity", {
      is: (v) => isTacExpired(v),
      then: (schema) => schema.required("COP No is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  cop_validity: {
    name: "cop_validity",
    type: "date",
    label: "COP Validity",
    validation: Yup.date().nullable().when("tac_validity", {
      is: (v) => isTacExpired(v),
      then: (schema) => schema.required("COP Validity is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    minDate: today,
  },
  file_officialTechnicalOnboardingRequestLetter:{
    name:"file_officialTechnicalOnboardingRequestLetter",
    type: "file",
    label: "Official Technical Onboarding Request Letter",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Official Technical Onboarding Request Letter is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_vehicleTypeApprovalTacAnnexureCopy:{
    name:"file_vehicleTypeApprovalTacAnnexureCopy",
    type: "file",
    label: "Self-Certified Vehicle Type Approval (TAC) Annexure Copy",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Vehicle Type Approval (TAC) Annexure Copy is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_ais140DeviceTacCopy:{
    name:"file_ais140DeviceTacCopy",
    type: "file",
    label: "Self-Certified AIS-140 Device TAC Copy",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("AIS-140 Device TAC Copy is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_factoryFitmentDeclaration:{
    name:"file_factoryFitmentDeclaration",
    type: "file",
    label: "Factory Fitment Declaration",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Factory Fitment Declaration is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_affidavitCumUndertakingBackendAccess:{
    name:"file_affidavitCumUndertakingBackendAccess",
    type: "file",
    label: "Affidavit-cum-Undertaking for Skytron Backend Access",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Affidavit-cum-Undertaking for Skytron Backend Access is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_selfCertifiedGstRegistrationCertificate:{
    name:"file_selfCertifiedGstRegistrationCertificate",
    type: "file",
    label: "Self-Certified GST Registration Certificate",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Self-Certified GST Registration Certificate is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_selfCertifiedIdProofAuthorisedSignatory:{
    name:"file_selfCertifiedIdProofAuthorisedSignatory",
    type: "file",
    label: "Self-Certified ID Proof of Authorised Signatory",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Self-Certified ID Proof of Authorised Signatory is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_selfCertifiedCompanyRegistrationCertificateOptional:{
    name:"file_selfCertifiedCompanyRegistrationCertificateOptional",
    type: "file",
    label: "Self Certified Company registration certificate (Optional)",
    message:'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().notRequired().test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return true;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "manufacturer.form.validation.file_format", value => {
      if (!value) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  device_model_details: {
    name: "device_model_details",
    type: "text",
    label: "Device Model Details",
    validation: Yup.string().required("Device Model Details is required"),
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
