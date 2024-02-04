import * as Yup from "yup"; 
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
export const eSIMInitialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    dob: "",
    expiryDate:formattedDate,
    gstNo: "",
    state: "",
    authorizationLetter: null,
    companyRegistrationCertificate: null,
    gstCertificate: null,
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
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
  },
  expiryDate: {
    name:"expiryDate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
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
    label: "GST No",
    validation: Yup.string().required("GTS No is required"),
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
};
