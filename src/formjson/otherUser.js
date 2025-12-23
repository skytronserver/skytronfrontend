import * as Yup from "yup";
export const otherUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  dtoCode: "",
  idProofno: "",
  file_idProof: null,
  lat: "",
  lon: "",
};
export const otherUserFormField = {
  name: {
    name: "name",
    type: "text",
    label: "Name",
    validation: Yup.string().required("Name is required"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "Mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "Mobile Number must be a 10-digit number")
      .required("Mobile Number is required"),
  },
  email: {
    name: "email",
    type: "text",
    label: "Email",
    validation: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
  },
  dtoCode: {
    name: "dtoCode",
    type: "text",
    label: "DTO/RTO Code",
    validation: Yup.string().required("DTO/RTO Code cannot be blank"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Number",
    validation: Yup.string().required("User ID No is required field"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Document is required"),
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
