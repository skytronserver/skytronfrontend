import * as Yup from "yup"; 

  let stateList=[];
  let districtList=[];
  const FILE_SIZE = 512 * 1024 ; // 512 KB
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];
export const dtoInitialsValues = {
    name: "",
    mobile: "",
    email: "",
    state:"",
    district_code:"",
    idProofno:"",
    dob:"",
    expirydate:formattedDate,
    dto_rto:"",
    file_idProof: null,
    file_authorisation_letter:null
};
export const dtoFormFields = {
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
    type: "tel",
    label: "Mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
  },
   state: {
    name:"state",
    type: "text",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
    disabled:true,
  },
  district_code: {
    name:"district_code",
    type: "select",
    label: "District Code",
    validation: Yup.string().required("District Code is required"),
    options:districtList,
  },
  idProofno: {
    name:"idProofno",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().min(5, "ID Proof Number must be at least 5 characters long").required("User ID Proof Number is required"),
  },
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
    maxDate:today
  },
  expirydate: {
    name:"expirydate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
    minDate:today
  },
  dto_rto: {
    name:"dto_rto",
    type: "select",
    label: "DTO/RTO",
    validation: Yup.string().required("DTO/RTO is required"),
    options: [
        { value: "DTO", label: "DTO" },
        { value: "RTO", label: "RTO" }
      ],
  },
  file_idProof:{
    name:"file_idProof",
    type: "file",
    label: "User ID Proof",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("User ID Proof is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_authorisation_letter: {
    name:"file_authorisation_letter",
    type: "file",
    label: "Authorization Letter",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed()
  .required("Authorization Letter is required")
  .test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
    if (!value) return false;
    return value.size <= FILE_SIZE;
  })
  .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
    if (!value) return false;
    return SUPPORTED_FORMATS.includes(value.type);
  })
  }
};
