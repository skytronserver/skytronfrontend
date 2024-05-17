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
let stateList=[];
  if (localStorage.getItem('oAuthToken') && sessionStorage.getItem('sessionID')) {
    stateList=await retriveStateList();
  }
export const stateInitials = {
    state:"",
    status:"",
};
export const districtInitials={
  state:"",
    status:"",
    district:"",
}
export const stateFields = {
    state: {
    name: "state",
    type: "text",
    label: "State Name",
    validation: Yup.string().required("State name is required"),
  },
  status: {
    name: "status",
    type: "select",
    label: "Status",
    validation: Yup.string().required("Status is required"),
    options: [
        { value: "active", label: "Active" },
        { value: "deactive", label: "Deactive" }
      ],
  },
};
export const districtFields = {
  district: {
  name: "district",
  type: "text",
  label: "District Name",
  validation: Yup.string().required("District name is required"),
},
state: {
  name: "state",
  type: "select",
  label: "State Name",
  validation: Yup.string().required("State is required"),
  options: stateList,
},
status: {
  name: "status",
  type: "select",
  label: "Status",
  validation: Yup.string().required("Status is required"),
  options: [
      { value: "active", label: "Active" },
      { value: "deactive", label: "Deactive" }
    ],
},
};
