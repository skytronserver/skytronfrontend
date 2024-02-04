import * as Yup from "yup";
export const vehicleOwnerInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  address: "",
  vehicleRegNo: "",
  vehicleMake: "",
  vehicleModel: "",
  engineNo: "",
  vehicleCategory: "",
  chessisNo: "",
  addressProof: null,
  vehicleRc: null,
  deviceInvoice: null,
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
  },
  address: {
    name: "address",
    type: "text",
    label: "Full Address",
    validation: Yup.string().required("Full Address is required"),
  },
  vehicleRegNo: {
    name: "vehicleRegNo",
    type: "text",
    label: "Vehicle Registration No.",
    validation: Yup.string().required("Vehicle Registration No. is required"),
  },
  vehicleMake: {
    name: "vehicleMake",
    type: "text",
    label: "Vehicle Make",
    validation: Yup.string().required("Vehicle Make is required"),
  },
  vehicleModel: {
    name: "vehicleModel",
    type: "text",
    label: "Vehicle Model",
    validation: Yup.string().required("Vehicle Model is required"),
  },
  engineNo: {
    name: "engineNo",
    type: "text",
    label: "Engine No",
    validation: Yup.string().required("Engine number is required"),
  },
  vehicleCategory: {
    name: "vehicleCategory",
    type: "text",
    label: "Vehicle Category",
    validation: Yup.string().required("Vehicle Category is required"),
  },
  chessisNo: {
    name: "chessisNo",
    type: "text",
    label: "Chessis No",
    validation: Yup.string().required("Chessis No is required"),
  },
  vehicleRc: {
    name: "vehicleRc",
    type: "file",
    label: "Vehicle RC",
    validation: Yup.mixed().required("Vehicle RC is required"),
  },
  addressProof: {
    name: "addressProof",
    type: "file",
    label: "Address Proof",
    validation: Yup.mixed().required("Address Proof is required"),
  },
  deviceInvoice: {
    name: "deviceInvoice",
    type: "file",
    label: "Device Purchase Invoice",
    validation: Yup.mixed().required("Device Purchase Invoice is required"),
  },
};
