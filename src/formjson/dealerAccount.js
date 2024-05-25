import * as Yup from "yup";
import { indianStates } from "./indianState";
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split("T")[0];
export const dealerAccountInitialValues = {
  manufacturer:"",
  name: "",
  mobile: "",
  email: "",
  dob: "",
  company_name: "",
  gstnnumber: "",
  address_State: "",
  address: "",
  idProofno: "",
  expiryDate: formattedDate,
  file_authLetter: null,
  file_companRegCertificate: null,
  file_GSTCertificate: null,
  file_idProof: null,
};

export const dealerAccountFormField = {
  manufacturer: {
    name: "manufacturer",
    type: "select",
    label: "Manufacturer",
    validation: Yup.string().required("Manufacturer is required"),
    options: [],
  },
  name: {
    name: "name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Email",
    validation: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  },
  mobile: {
    name: "mobile",
    type: "text",
    label: "Mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "Mobile Number must be a 10-digit number")
      .required("Mobile Number is required"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
  },
  company_name: {
    name: "company_name",
    type: "text",
    label: "Company Name",
    validation: Yup.string().required("Company Name is required"),
  },
  gstnnumber: {
    name: "gstnnumber",
    type: "text",
    label: "GST No",
    validation: Yup.string().required("GTS No is required"),
  },
  address_State: {
    name: "address_State",
    type: "select",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
    options: [],
  },
  address: {
    name: "address",
    type: "select",
    label: "District Name",
    validation: Yup.string().required("District Name is required"),
    options: [],
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().required("User ID Proof Number is required"),
  },
  expiryDate: {
    name: "expiryDate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
  },
  file_authLetter: {
    name: "file_authLetter",
    type: "file",
    label: "Authorization Letter",
    validation: Yup.mixed().required("Authorization Letter is required"),
  },
  file_companRegCertificate: {
    name: "file_companRegCertificate",
    type: "file",
    label: "Company/Shop Registration/Establishment Certificate",
    validation: Yup.mixed().required(
      "Company/Shop Registration/Establishment Certificate is required"
    ),
  },
  file_GSTCertificate: {
    name: "file_GSTCertificate",
    type: "file",
    label: "GST Certificate",
    validation: Yup.mixed().required("GST Certificate is required"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Proof is required"),
  },
};
