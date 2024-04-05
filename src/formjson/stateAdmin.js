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
const stateList=await retriveStateList();
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
export const stateAdminInitialValues = {
    name: "",
    mobile: "",
    email: "",
    dob:"",
    expirydate: formattedDate,
    state:"",
    idProofno: "",
    file_idProof: null,
  };
  export const stateAdminField = {
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
    expirydate: {
      name:"expirydate",
      type: "date",
      label: "Expiry Date",
      validation: Yup.date().required("Expiry Date is required"),
    },
    state: {
        name:"state",
        type: "select",
        label: "State Name",
        validation: Yup.string().required("State Name is required"),
        options: stateList,
      },
    idProofno: {
      name:"idProofno",
      type: "text",
      label: "ID Proof Number",
      validation: Yup.string().required("ID Proof Number is required"),
    },
    file_idProof: {
      name:"file_idProof",
      type: "file",
      label: "ID Proof",
      validation: Yup.mixed().required("ID Proof is required"),
    }
  };