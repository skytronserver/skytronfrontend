import * as Yup from "yup"; 
export const dealerInitialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstNo: "",
    deviceMake:"",
    deviceModel: "",
    state:"",
    district:"",
    userIdProofNo:"",
    expiryDate:"",
    authorizationLetter: null,
    companyRegistrationCertificate: null,
    gstCertificate: null,
    deviceManufacturerLetter: null,
    userIdProof: null,
};




export const dealerFormField = {
  name: {
    name:"name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  email: {
    name:"email",
    type: "text",
    label: "Email",
    validation: Yup.string().email("Invalid email address").required("Email is required"),
  },
  mobile: {
    name:"mobile",
    type: "text",
    label: "Mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
  },
  companyName: {
    name:"companyName",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("Company Name is required"),
  },
  gstNo: {
    name:"gstNo",
    type: "text",
    label: "GTS No",
    validation: Yup.string().required("GTS No is required"),
  },
  state: {
    name:"state",
    type: "text",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
  },
  district: {
    name:"district",
    type: "text",
    label: "District Name",
    validation: Yup.string().required("District Name is required"),
  },
  userIdProofNo: {
    name:"userIdProofNo",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().required("User ID Proof Number is required"),
  },
  deviceMake: {
    name:"deviceMake",
    type: "select",
    label: "Device Make",
    validation: Yup.string().required("Device Make is required"),
    options: [
      { value: "0", label: "One" },
      { value: "1", label: "Two" },
      { value: "2", label: "Three" },
    ],
  },
  deviceModel: {
    name:"deviceModel",
    type: "select",
    label: "Device Model",
    validation: Yup.string().required("Device Model is required"),
    options: [
      { value: "0", label: "One" },
      { value: "1", label: "Two" },
      { value: "2", label: "Three" },
    ],
  },
  expiryDate: {
    name:"expiryDate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
  },
  authorizationLetter:{
    name:"authorizationLetter",
    type: "file",
    label: "Authorization Letter",
    validation: Yup.mixed().required("Authorization Letter is required"),
  },
  companyRegistrationCertificate:{
    name:"companyRegistrationCertificate",
    type: "file",
    label: "Company Registration Certificate",
    validation: Yup.mixed().required("Company Registration Certificate is required"),
  },
  gstCertificate:{
    name:"gstCertificate",
    type: "file",
    label: "GST Certificate",
    validation: Yup.mixed().required("GST Certificate is required"),
  },
  deviceManufacturerLetter:{
    name:"deviceManufacturerLetter",
    type: "file",
    label: "Device Manufacturer Letter",
    validation: Yup.mixed().required("Device Manufacturer Letter is required"),
  },
  userIdProof:{
    name:"userIdProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Proof is required"),
  }
};
