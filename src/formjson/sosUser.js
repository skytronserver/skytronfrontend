import * as Yup from "yup";
  let stateList=[];
  const FILE_SIZE = 512 * 1024 ; // 512 KB
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
  const today = new Date().toISOString().split('T')[0];
export const sosUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  dtoCode: "",
  state:'',
  idProofno: "",
  file_idProof: null,
  file_authorization_letter:null
};
export const sosOtherUserInitialValues = {
  user_type:"",
  name: "",
  mobile: "",
  email: "",
  dob:"",
  dtoCode: "",
  state:'',
  idProofno: "",
  file_idProof: null,
  file_authorization_letter:null
};
export const sosUserFormField = {
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
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
    maxDate:today
  },
  state: {
    name:"state",
    type: "select",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
    options:stateList,
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Number",
    validation: Yup.string()
        .min(5, "ID Proof Number must be at least 5 characters long")
        .required("User ID No is required field"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "User ID Proof",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("User ID Document is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_authorization_letter: {
    name: "file_authorization_letter",
    type: "file",
    label: "Authorization Letter",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("Authorization Letter Document is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  }
};

export const sosOtherUserFormField = {
  user_type: {
    name: "user_type",
    type: "select",
    label: "User Type",
    validation: Yup.string().required("User Type is required"),
    options:[{value:'Team_lead',label:'Team Lead'},{value:'Desk_executive',label:'Desk Executive'},{value:'Field_executive',label:'Field Executive'}]
  },
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
  dob: {
    name:"dob",
    type: "date",
    label: "Date of Birth",
    validation: Yup.date().required("Date of Birth is required"),
    maxDate:today
  },
  state: {
    name:"state",
    type: "select",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
    options:stateList,
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "User ID Number",
    validation: Yup.string()
        .min(5, "ID Proof Number must be at least 5 characters long")
        .required("User ID No is required field"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "User ID Proof",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("User ID Document is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  },
  file_authorization_letter: {
    name: "file_authorization_letter",
    type: "file",
    label: "Authorization Letter",
    message:'Only JPG, PDF, PNG files are allowed and must be below 512KB.',
    validation: Yup.mixed().required("Authorization Letter Document is required").test("fileSize", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", "Max size is 520KB and supported files are pdf/png/jpg", value => {
      if (!value) return false;
      return SUPPORTED_FORMATS.includes(value.type);
    }),
  }
};
