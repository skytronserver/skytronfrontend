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
  if (sessionStorage.getItem('oAuthToken') && sessionStorage.getItem('sessionID')) {
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
    district_code:"",
}
export const stateFields = {
    state_name: {
    name: "state_name",
    type: "text",
    label: "form.stateName.label",
    validation: Yup.string().required("form.stateName.required"),
  },
  status: {
    name: "status",
    type: "select",
    label: "form.state.status.label",
    validation: Yup.string().required("form.state.status.required"),
    options: [
        { value: "active", label: "form.state.status.active" }
      ],
  },
};
export const districtFields = {
  district_name: {
    name: "district_name",
    type: "text",
    label: "form.districtName.label",
    validation: Yup.string().required("form.districtName.required"),
  },
  district_code: {
    name: "district_code",
    type: "text",
    label: "form.districtCode.label",
    validation: Yup.string().required("form.districtCode.required"),
  },
  state: {
    name: "state",
    type: "select",
    label: "form.stateName.label",
    validation: Yup.string().required("form.stateName.required"),
    options: stateList,
  },
  status: {
    name: "status",
    type: "select",
    label: "form.state.status.label",
    validation: Yup.string().required("form.state.status.required"),
    options: [
        { value: "active", label: "form.state.status.active" },
        { value: "deactive", label: "form.state.status.deactive" }
    ],
  },
};
