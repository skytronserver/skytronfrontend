import * as Yup from "yup";
import SettingService from "../services/SettingService";
const retriveStateList = async () => {
  try {
    const response = await SettingService.filter_settings_State();
    const list=response.data.map(device => ({
      value: device.id,
      label: device.state,
    })); 
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
     console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
const retriveDistrictList = async () => {
    try {
      const response = await SettingService.filter_settings_District();
      const list=response.data.map(device => ({
        value: device.id,
        label: device.district,
      })); 
      return list;
    } catch (error) {
      if (error.response && error.response.status === 404) {
       console.log('No Data Found')
      } else {
        console.log('No Data Found')
      }
    }
  };
  let stateList=[];
  let districtList=[];
  if (localStorage.getItem('oAuthToken') && sessionStorage.getItem('sessionID')) {
    stateList=await retriveStateList();
    districtList=await retriveDistrictList();
  }
export const sosUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob:"",
  dtoCode: "",
  state:'',
  district:'',
  idProofno: "",
  file_idProof: null,
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
  },
  dtoCode: {
    name: "dtoCode",
    type: "text",
    label: "DTO/RTO Code",
    validation: Yup.string().required("DTO/RTO Code cannot be blank"),
  },
  state: {
    name:"state",
    type: "select",
    label: "State Name",
    validation: Yup.string().required("State Name is required"),
    options:stateList,
  },
  district: {
    name:"district",
    type: "select",
    label: "District Name",
    validation: Yup.string().required("District Name is required"),
    options:districtList,
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
  }
};
