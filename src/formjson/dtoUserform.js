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
const stateList=await retriveStateList();
const districtList=await retriveDistrictList();
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
export const dtoInitialsValues = {
    name: "",
    mobile: "",
    email: "",
    state:"",
    district:"",
    idProofno:"",
    expiryDate:formattedDate,
    dto_rto:"",
    file_idProof: null,
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
    type: "text",
    label: "Mobile",
    validation: Yup.string().matches(/^\d{10}$/, 'Mobile Number must be a 10-digit number').required('Mobile Number is required'),
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
    name:"idProofno",
    type: "text",
    label: "User ID Proof Number",
    validation: Yup.string().required("User ID Proof Number is required"),
  },
  expiryDate: {
    name:"expiryDate",
    type: "date",
    label: "Expiry Date",
    validation: Yup.date().required("Expiry Date is required"),
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
    validation: Yup.mixed().required("User ID Proof is required"),
  }
};
