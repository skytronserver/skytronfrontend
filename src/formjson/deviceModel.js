import * as Yup from "yup";
const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];
export const providerList = []
export const today = new Date().toISOString().split('T')[0];
export const deviceModelInitials = {
  eSimProviders: [],
  model_name: "",
  test_agency: "",
  tac_no: "",
  tac_validity: "",
  vendor_id: "",
  hardware_version: "",
  tac_doc_path: null,
  cop_no: "",
  cop_validity: "",
  cop_file: null,
  agency_address: "",
  agency_pincode: "",
  api_url: "",
  token: "",
};
export const deviceModelFormField = {
  eSimProviders: {
    name: "eSimProviders",
    type: "multiselect",
    label: "deviceModelForm.fields.m2mServiceProvider",
    validation: Yup.array().min(1, "deviceModelForm.validation.m2mServiceProviderRequired"),
    options: [{ 'label': 'deviceModelForm.fields.select', 'value': '' }]
  },
  model_name: {
    name: "model_name",
    type: "text",
    label: "deviceModelForm.fields.model",
    validation: Yup.string().required("deviceModelForm.validation.modelRequired"),
  },
  tac_no: {
    name: "tac_no",
    type: "text",
    label: "deviceModelForm.fields.tacNo",
    validation: Yup.string().required("deviceModelForm.validation.tacNoRequired"),
  },
  test_agency: {
    name: "test_agency",
    type: "select",
    label: "deviceModelForm.fields.testAgency",
    validation: Yup.string().required("deviceModelForm.validation.testAgencyRequired"),
    options: []
  },
  agency_address: {
    name: "agency_address",
    type: "text",
    label: "Agency Address",
    disabled: true,
    validation: Yup.string(),
  },
  agency_pincode: {
    name: "agency_pincode",
    type: "text",
    label: "Agency Pincode",
    disabled: true,
    validation: Yup.string(),
  },
  tac_validity: {
    name: "tac_validity",
    type: "date",
    label: "deviceModelForm.fields.tacValidity",
    validation: Yup.date().required("deviceModelForm.validation.tacValidityRequired"),
  },
  vendor_id: {
    name: "vendor_id",
    type: "text",
    label: "deviceModelForm.fields.vendorId",
    validation: Yup.string().required("deviceModelForm.validation.vendorIdRequired"),
  },
  hardware_version: {
    name: "hardware_version",
    type: "text",
    label: "deviceModelForm.fields.hardwareVersion",
    validation: Yup.string().required("deviceModelForm.validation.hardwareVersionRequired"),
  },
  tac_doc_path: {
    name: "tac_doc_path",
    type: "file",
    label: "deviceModelForm.fields.uploadTac",
    validation: Yup.mixed()
      .required("deviceModelForm.validation.tacRequired")
      .test("fileSize", "File size is too large (max 512KB)", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "Unsupported format (must be PDF, JPG, PNG)", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  cop_no: {
    name: "cop_no",
    type: "text",
    label: "modelExtensionForm.fields.copNo",
    validation: Yup.string().when('tac_validity', {
      is: (val) => {
        if (!val) return false;
        const todayStr = new Date().toISOString().split('T')[0];
        return val < todayStr;
      },
      then: Yup.string().required("modelExtensionForm.validation.copNoRequired"),
      otherwise: Yup.string().nullable()
    }),
  },
  cop_validity: {
    name: "cop_validity",
    type: "date",
    label: "modelExtensionForm.fields.copValidity",
    validation: Yup.date()
      .min(new Date(new Date().setHours(0, 0, 0, 0)), "COP validity is required")
      .when('tac_validity', {
        is: (val) => {
          if (!val) return false;
          const todayStr = new Date().toISOString().split('T')[0];
          return val < todayStr;
        },
        then: Yup.date().required("modelExtensionForm.validation.copValidityRequired"),
        otherwise: Yup.date().nullable()
      }),
  },
  cop_file: {
    name: "cop_file",
    type: "file",
    label: "modelExtensionForm.fields.uploadCop",
    validation: Yup.mixed().when('tac_validity', {
      is: (val) => {
        if (!val) return false;
        const todayStr = new Date().toISOString().split('T')[0];
        return val < todayStr;
      },
      then: Yup.mixed()
        .required("modelExtensionForm.validation.copRequired")
        .test("fileSize", "File size is too large (max 512KB)", value => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        })
        .test("fileFormat", "Unsupported format (must be PDF, JPG, PNG)", value => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }),
      otherwise: Yup.mixed().nullable()
    }),
  },
  api_url: {
    name: "api_url",
    type: "text",
    label: "API URL",
    placeholder: "https://example.com/device/callback",
    validation: Yup.string().url("Must be a valid URL").nullable(),
  },
  token: {
    name: "token",
    type: "text",
    label: "Token (up to 500 characters)",
    multiline: true,
    rows: 3,
    validation: Yup.string().max(500, "Token can be at most 500 characters").nullable(),
  },
};