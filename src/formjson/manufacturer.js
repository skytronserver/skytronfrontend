import * as Yup from "yup";
import { goldNameValidation, goldMobileValidation, goldEmailValidation, goldDobValidation, goldPanValidation, goldGstValidation, goldIdProofValidation, goldLatValidation, goldLonValidation, goldPinValidation } from "./validationHelpers";
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

  assam_office_address: "",
  assam_office_pin: "",
  assam_office_phone: "",
  assam_office_lat: "",
  assam_office_lon: "",

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
      { label: "Vehicle manufacturer (Factory Fitted AIS-140 Device)", value: "Vehicle manufacturer" },
      { label: "Device manufacturer (Retrofitted AIS-140 Device)", value: "Device manufacturer" },
    ],
  },
  name: {
    name: "name",
    type: "text",
    label: "Applicant Name",
    validation: goldNameValidation("Applicant Name"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Applicant Email",
    validation: goldEmailValidation("Applicant Email"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "Applicant Mobile No",
    validation: goldMobileValidation("Applicant Mobile No"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "Applicant DOB",
    validation: goldDobValidation("Applicant DOB"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "Applicant ID Proof No (PAN CARD, ADHAR, VOTER ID, DRIVING LICENSE, PASSPORT)",
    validation: goldIdProofValidation("Applicant ID Proof No"),
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
    validation: goldPinValidation("Applicant PIN Code"),
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
    validation: goldNameValidation("Company Name"),
  },
  company_email: {
    name: "company_email",
    type: "text",
    label: "Company Email",
    validation: goldEmailValidation("Company Email"),
  },
  company_phoneno: {
    name: "company_phoneno",
    type: "tel",
    label: "Company Phone No",
    validation: goldMobileValidation("Company Phone No"),
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
    validation: goldPinValidation("Company PIN"),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Company Address Lat",
    validation: goldLatValidation("Company Address Lat"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Company Address Lon",
    gridHidden: true,
    validation: goldLonValidation("Company Address Lon"),
  },
  assam_office_address: {
    name: "assam_office_address",
    type: "text",
    label: "Assam Office Address",
    validation: Yup.string().required("Assam Office Address is required"),
  },
  assam_office_pin: {
    name: "assam_office_pin",
    type: "text",
    label: "Assam Office PIN",
    validation: goldPinValidation("Assam Office PIN"),
  },
  assam_office_phone: {
    name: "assam_office_phone",
    type: "tel",
    label: "Assam Office Phone No",
    validation: goldMobileValidation("Assam Office Phone No"),
  },
  assam_office_lat: {
    name: "assam_office_lat",
    type: "number",
    label: "Assam Office Lat",
    validation: goldLatValidation("Assam Office Lat"),
  },
  assam_office_lon: {
    name: "assam_office_lon",
    type: "number",
    label: "Assam Office Lon",
    validation: goldLonValidation("Assam Office Lon"),
  },
  gstnnumber: {
    name: "gstnnumber",
    type: "text",
    label: "Company GST No",
    validation: goldGstValidation("Company GST No"),
  },
  panno: {
    name: "panno",
    type: "text",
    label: "Company PAN No",
    validation: goldPanValidation("Company PAN No"),
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
    label: "AIS-140 VLTD Device Make",
    validation: Yup.string().required("AIS-140 Device Make is required"),
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
    label: "AIS-140 Device TAC No",
    validation: Yup.string().required("AIS-140 Device TAC No is required"),
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
    validation: Yup.date()
      .min(new Date(new Date().setHours(0, 0, 0, 0)), "COP validity is required")
      .nullable()
      .when("tac_validity", {
        is: (v) => isTacExpired(v),
        then: (schema) => schema.required("COP Validity is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
  },

  file_selfCertifiedIdProofAuthorisedSignatory: {
    name: "file_selfCertifiedIdProofAuthorisedSignatory",
    type: "file",
    label: "Self Certified Applicant ID Proof (PDF)",
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
    downloadUrl: "/templates/Factory Fitted/Authorization of Representative for Technical Onboarding – Factory-Fitted AIS-140 Devices.pdf",
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
    label: "Self Certified Company PAN Card",
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
    label: "Self Certified Company GST Certificate",
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
    downloadUrl: "/templates/Factory Fitted/Technical Onboarding request letter– Factory-Fitted AIS-140 Devices in Vehicles.pdf",
    downloadLabel: "Format of request letter",
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
    downloadUrl: "/templates/Factory Fitted/MANUFACTURER AFFIDAVIT.pdf",
    downloadLabel: "Format of Affidavit-Cum-Undertaking",
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
    label: "Self-Certified Vehicle Type Approval (TAC) Annexure Copy Showing the VLTD Details",
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
    label: "Device TAC (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().required("Device TAC is required").test("fileSize", "manufacturer.form.validation.file_size", value => {
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
    label: "Device COP (PDF)",
    message: 'manufacturer.form.validation.file_restrictions',
    validation: Yup.mixed().when("tac_validity", {
      is: (v) => isTacExpired(v),
      then: (schema) =>
        schema
          .required("Device COP is required")
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
    downloadUrl: "/templates/Factory Fitted/FACTORY FITMENT DECLARATION.pdf",
    downloadLabel: "Format of Factory Fitment Declaration",
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
