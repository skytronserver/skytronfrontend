import * as Yup from "yup";
const currentDate = new Date();
const FILE_SIZE = 512 * 1024 ; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];
export const vehicleOwnerInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  address: "",
  expiryDate: formattedDate,
  idProofno: "",
  file_idProof: null,

};
export const vehicleOwnerField = {
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
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
    maxDate:today
  },
  address: {
    name: "address",
    type: "text",
    label: "Full Address",
    validation: Yup.string().required("Full Address is required"),
  },
  expiryDate: {
    name:"expiryDate",
    type: "date",
    label: "Expiry Date",
    disabled:true,
    validation: Yup.date().required("Expiry Date is required"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().min(5, "ID Proof Number must be at least 5 characters long").required("User ID Proof Number is required"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "ID Proof",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("ID Proof is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  }
};
