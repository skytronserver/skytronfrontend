import * as Yup from "yup";
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
let providerList = [{ value: '', label: 'Select' }];
const FILE_SIZE = 1024 * 1024; // 1 MB
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
  manufacturer_type: "",
  name: "",
  email: "",
  mobile: "",
  dob: "",
  idProofno: "",
  address: "",
  pin: "",
  state: "",

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

  device_model_details: "",
  esimProvider: [],
  tac_no: "",
  tac_validity: "",
  cop_no: "",
  cop_validity: "",

  file_selfCertifiedIdProofAuthorisedSignatory: null,
  file_authLetter: null,
  file_pan: null,
  file_selfCertifiedGstRegistrationCertificate: null,
  file_selfCertifiedCompanyRegistrationCertificateOptional: null,
  file_officialTechnicalOnboardingRequestLetter: null,
  file_affidavitCumUndertakingBackendAccess: null,
  file_vehicleTypeApprovalTacAnnexureCopy: null,
  file_ais140DeviceTacCopy: null,
  cop_file: null,
  file_factoryFitmentDeclaration: null,

  status: "Pending",
  expirydate: formattedDate,
};

export const manufacturerFormField = {
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
  name: {
    name: "name",
    type: "text",
    label: "Applicant Name",
    validation: Yup.string().required("manufacturer.form.validation.name_required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Applicant Email",
    validation: Yup.string().email("manufacturer.form.validation.invalid_email").required("manufacturer.form.validation.email_required"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "Applicant Mobile No",
    validation: Yup.string().matches(/^\d{10}$/, 'manufacturer.form.validation.invalid_mobile').required('manufacturer.form.validation.mobile_required'),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "Applicant DOB",
    validation: Yup.date()
      .required("manufacturer.form.validation.dob_required")
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "manufacturer.form.validation.age_restriction")
      .max(today, "manufacturer.form.validation.future_date"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "Applicant ID Proof No",
    validation: Yup.string().min(5, "manufacturer.form.validation.id_proof_min_length").required("manufacturer.form.validation.id_proof_required"),
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
    label: "Applicant State",
    validation: Yup.string().required("manufacturer.form.validation.state_required"),
    options: [{ 'label': 'manufacturer.form.select', 'value': '' }]
  },

  company_name: {
    name: "company_name",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("manufacturer.form.validation.company_name_required"),
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
    label: "Company Address Lat",
    validation: Yup.number()
      .typeError("Latitude must be a number")
      .nullable(),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Company Address Lon",
    gridHidden: true,
    validation: Yup.number()
      .typeError("Longitude must be a number")
      .nullable(),
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
    label: "Company Registration No (Optional)",
    validation: Yup.string().notRequired(),
  },
  device_model_details: {
    name: "device_model_details",
    type: "text",
    label: "Device Model Details",
    validation: Yup.string().required("Device Model Details is required"),
  },
  esimProvider: {
    name: "esimProvider",
    type: "multiselect",
    label: "eSIM Provider (M2M)",
    validation: Yup.array().required("manufacturer.form.validation.esim_provider_required"),
    options: providerList
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

  file_selfCertifiedIdProofAuthorisedSignatory: {
    name: "file_selfCertifiedIdProofAuthorisedSignatory",
    type: "file",
    label: "Applicant ID Proof (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Self-Certified ID Proof of Authorised Signatory is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_authLetter: {
    name: "file_authLetter",
    type: "file",
    label: "Auth Letter (PDF)",
    message: "manufacturer.form.validation.file_restrictions",
    downloadUrl: "/templates/authorization-letter-format.txt",
    downloadLabel: "Format of authorisation letter",
    validation: Yup.mixed().required("Authorization Letter is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_pan: {
    name: "file_pan",
    type: "file",
    label: "PAN (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("PAN document is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedGstRegistrationCertificate: {
    name: "file_selfCertifiedGstRegistrationCertificate",
    type: "file",
    label: "GST Certificate (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Self-Certified GST Registration Certificate is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_selfCertifiedCompanyRegistrationCertificateOptional: {
    name: "file_selfCertifiedCompanyRegistrationCertificateOptional",
    type: "file",
    label: "Company Registration Certificate (PDF) (Optional)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().notRequired().test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return true;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return true;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_officialTechnicalOnboardingRequestLetter: {
    name: "file_officialTechnicalOnboardingRequestLetter",
    type: "file",
    label: "Official Technical Onboarding Request Letter",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Official Technical Onboarding Request Letter is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_affidavitCumUndertakingBackendAccess: {
    name: "file_affidavitCumUndertakingBackendAccess",
    type: "file",
    label: "Affidavit-cum-Undertaking for Skytron Backend Access",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Affidavit-cum-Undertaking for Skytron Backend Access is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_vehicleTypeApprovalTacAnnexureCopy: {
    name: "file_vehicleTypeApprovalTacAnnexureCopy",
    type: "file",
    label: "Self-Certified Vehicle Type Approval (TAC) Annexure Copy",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Vehicle Type Approval (TAC) Annexure Copy is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_ais140DeviceTacCopy: {
    name: "file_ais140DeviceTacCopy",
    type: "file",
    label: "TAC (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("TAC Copy is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  cop_file: {
    name: "cop_file",
    type: "file",
    label: "COP (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().when("tac_validity", {
      is: (v) => isTacExpired(v),
      then: (schema) =>
        schema
          .required("COP File is required")
          .test("fileSize", "manufacturer.form.validation.file_size", (value) => {
            if (!value) return false;
            return value.size <= FILE_SIZE;
          })
          .test("fileFormat", "manufacturer.form.validation.file_format", (value) => {
            if (!value) return false;
            return SUPPORTED_FORMATS.includes(value.type);
          }),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  file_factoryFitmentDeclaration: {
    name: "file_factoryFitmentDeclaration",
    type: "file",
    label: "Factory Fitment Declaration",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Factory Fitment Declaration is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
      .test("fileFormat", "manufacturer.form.validation.file_format", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
};
