import * as Yup from "yup";
export const otherUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dtoCode: "",
  userIdNo: "",
  userIdProof: null,
  appointmentLetter: null,
  role:"",
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
    type: "text",
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
  dtoCode: {
    name: "dtoCode",
    type: "text",
    label: "DTO/RTO Code",
    validation: Yup.string().required("DTO/RTO Code cannot be blank"),
  },
  userIdNo: {
    name: "userIdNo",
    type: "text",
    label: "User ID Number",
    validation: Yup.string().required("User ID No is required field"),
  },
  role: {
    name:"role",
    type: "select",
    label: "User Type(Role)",
    validation: Yup.string().required("Role is required"),
    options: [
      { value: "filment", label: "Fitment Verifier" },
      { value: "sosadmin", label: "SOS Admin" },
      { value: "teamleader", label: "Team Leader" },
      {value:"sosexecutive",label:"SOS Executive"}
    ],
  },
  userIdProof: {
    name: "userIdProof",
    type: "file",
    label: "User ID Proof",
    validation: Yup.mixed().required("User ID Document is required"),
  },
  appointmentLetter: {
    name: "appointmentLetter",
    type: "file",
    label: "Appointment Letter",
    validation: Yup.mixed().required("Appointment Letter is required"),
  },
};
