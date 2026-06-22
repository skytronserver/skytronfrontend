import * as Yup from "yup";
let deviceList = [];
let ownerList = [];
let categoryList = [];

export const taggingInitials = {
  vehicle_type: "old",
  device: "",
  vehicle_owner: "",
  state_code: "",
  district_code: "",
  district: "",
  vehicle_number: "",
  owner_id: "",
  engine_no: "",
  chassis_no: "",
  vehicle_make: "",
  vehicle_model: "",
  category: "",
  category_code: "",
  rcFile: null,
};

const isNotDummy = (value) => {
  if (!value) return true;
  // Reject if any character repeats 5 or more times in a row (e.g., 11111, SSSSS)
  if (/(.)\1{4,}/.test(value)) return false;
  // Reject obvious sequential numbers (e.g., 123456, 987654)
  if (/012345|123456|234567|345678|456789|567890/.test(value)) return false;
  if (/987654|876543|765432|654321|543210/.test(value)) return false;
  // Reject simple alternating patterns (e.g., 12121212)
  if (/^(..)\1+$/.test(value)) return false;
  return true;
};

export const taggingFields = {
  vehicle_type: {
    name: "vehicle_type",
    type: "select",
    label: "Vehicle Type",
    validation: Yup.string().oneOf(["old", "new"]).required("Vehicle Type is required"),
    options: [
      { label: "Old Vehicle", value: "old" },
      { label: "New Vehicle", value: "new" },
    ],
  },
  device: {
    name: "device",
    type: "select",
    label: "tagDeviceForm.fields.deviceImei",
    validation: Yup.string().required("tagDeviceForm.validation.deviceRequired"),
    options: deviceList,
  },
  vehicle_owner: {
    name: "vehicle_owner",
    type: "tel",
    label: "tagDeviceForm.fields.ownerMobile",
    validation: Yup.string()
      .matches(/^[6-9]\d{9}$/, 'tagDeviceForm.validation.mobileFormat')
      .test('not-dummy', 'Mobile number looks like a dummy entry', isNotDummy)
      .required('tagDeviceForm.validation.mobileRequired'),
  },
  state_code: {
    name: "state_code",
    type: "text",
    label: "State Code",
    validation: Yup.string(),
    disabled: true,
  },
  district_code: {
    name: "district_code",
    type: "select",
    label: "tagDeviceForm.fields.districtCode",
    validation: Yup.string().required("tagDeviceForm.validation.districtCodeRequired"),
    options: [],
  },
  district: {
    name: "district",
    type: "select",
    label: "tagDeviceForm.fields.district",
    validation: Yup.string().required("tagDeviceForm.validation.districtRequired"),
    options: [],
  },
  vehicle_number: {
    name: "vehicle_number",
    type: "text",
    label: "tagDeviceForm.fields.vehicleNumber",
    validation: Yup.string().when("vehicle_type", {
      is: "old",
      then: (schema) =>
        schema
          .matches(/^[A-Z]{0,3}[0-9]{1,4}$/, "Vehicle Number must be 1-3 letters followed by 1-4 numbers (e.g., AB1234, 1234)")
          .min(1, "Vehicle number is required")
          .max(7, "Vehicle number cannot exceed 7 characters")
          .test('not-dummy', 'Vehicle number looks like a dummy entry', isNotDummy)
          .required("tagDeviceForm.validation.vehicleNumberRequired"),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  owner_id: {
    name: "owner_id",
    type: "text",
    label: "Owner ID",
    disabled: true,
    validation: Yup.string().when("vehicle_type", {
      is: "new",
      then: (schema) => schema.required("Owner ID is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  },
  engine_no: {
    name: "engine_no",
    type: "text",
    label: "tagDeviceForm.fields.engineNo",
    validation: Yup.string()
      .matches(/^[A-Z0-9]+$/, "Engine number must contain only uppercase letters and numbers")
      .min(5, "Engine number must be at least 5 characters")
      .max(20, "Engine number cannot exceed 20 characters")
      .test('not-dummy', 'Engine number looks like a dummy entry', isNotDummy)
      .required("tagDeviceForm.validation.engineNoRequired"),
  },
  chassis_no: {
    name: "chassis_no",
    type: "text",
    label: "tagDeviceForm.fields.chassisNo",
    validation: Yup.string()
      .matches(/^[A-HJ-NPR-Z0-9]+$/, "Chassis number cannot contain the letters 'I', 'O', or 'Q' (Indian standard)")
      .length(17, "Chassis number must be exactly 17 characters long")
      .test('not-dummy', 'Chassis number looks like a dummy entry', isNotDummy)
      .required("tagDeviceForm.validation.chassisNoRequired"),
  },
  vehicle_make: {
    name: "vehicle_make",
    type: "text",
    label: "tagDeviceForm.fields.vehicleMake",
    validation: Yup.string()
      .trim()
      .min(2, "Vehicle Make must be at least 2 characters")
      .max(50, "Vehicle Make cannot exceed 50 characters")
      .matches(/^[a-zA-Z0-9\s.-]+$/, "Vehicle Make contains invalid characters")
      .test('not-dummy', 'Vehicle Make looks like a dummy entry', isNotDummy)
      .required("tagDeviceForm.validation.vehicleMakeRequired"),
  },
  vehicle_model: {
    name: "vehicle_model",
    type: "text",
    label: "tagDeviceForm.fields.vehicleModel",
    validation: Yup.string()
      .trim()
      .min(2, "Vehicle Model must be at least 2 characters")
      .max(50, "Vehicle Model cannot exceed 50 characters")
      .matches(/^[a-zA-Z0-9\s.-]+$/, "Vehicle Model contains invalid characters")
      .test('not-dummy', 'Vehicle Model looks like a dummy entry', isNotDummy)
      .required("tagDeviceForm.validation.vehicleModelRequired"),
  },
  category: {
    name: "category",
    type: "select",
    label: "tagDeviceForm.fields.vehicleCategory",
    validation: Yup.string().required("tagDeviceForm.validation.vehicleCategoryRequired"),
    options: categoryList,
  },
  category_code: {
    name: "category_code",
    type: "select",
    label: "Vehicle Category Code",
    validation: Yup.string().nullable(),
    options: [],
  },
  rcFile: {
    name: "rcFile",
    type: "file",
    label: "tagDeviceForm.fields.registrationCertificate",
    validation: Yup.mixed().required("tagDeviceForm.validation.registrationCertificateRequired"),
  },
};
 