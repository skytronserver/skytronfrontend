import * as Yup from "yup"; 
export const eSIMInitialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstNo: "",
    deviceMake: "",
    state: "",
    authorizationLetter: null,
    companyRegistrationCertificate: null,
    gstCertificate: null,
    typeApprovalCertificate: null,
    deviceManufacturerLetter: null,
};

export const eSIMFormField = {
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
  deviceMake: {
    name:"deviceMake",
    type: "text",
    label: "Device Make",
    validation: Yup.string().required("Device Make is required"),
  },
  state: {
    name:"state",
    type: "text",
    label: "State",
    validation: Yup.string().required("State Name is required"),
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
  typeApprovalCertificate:{
    name:"typeApprovalCertificate",
    type: "file",
    label: "Type Approval Certificate",
    validation: Yup.mixed().required("Type Approval Certificate is required"),
  },
  deviceManufacturerLetter:{
    name:"deviceManufacturerLetter",
    type: "file",
    label: "Device Manufacturer Letter",
    validation: Yup.mixed().required("Device Manufacturer Letter is required"),
  }
};
