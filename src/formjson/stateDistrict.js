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
    state: {
        name: "state",
        type: "text",
        label: "State Name",
        validation: Yup.string()
            .required("State name is required")
            .min(2, "State name must be at least 2 characters")
            .max(50, "State name cannot exceed 50 characters")
            .matches(/^[a-zA-Z\s]+$/, "State name can only contain letters and spaces"),
    },
    status: {
        name: "status",
        type: "select",
        label: "Status",
        validation: Yup.string()
            .required("Status is required")
            .oneOf(['active'], "Invalid status value"),
        options: [
            { value: "active", label: "Active" }
        ],
    },
};
export const districtFields = {
    district: {
        name: "district",
        type: "text",
        label: "District Name",
        validation: Yup.string()
            .required("District name is required")
            .min(2, "District name must be at least 2 characters")
            .max(50, "District name cannot exceed 50 characters")
            .matches(/^[a-zA-Z\s]+$/, "District name can only contain letters and spaces"),
    },
    district_code: {
        name: "district_code",
        type: "text",
        label: "District Code",
        validation: Yup.string()
            .required("District Code is required")
            .matches(/^[A-Z0-9]+$/, "District code must contain only uppercase letters and numbers")
            .min(2, "District code must be at least 2 characters")
            .max(10, "District code cannot exceed 10 characters"),
    },
    state: {
        name: "state",
        type: "select",
        label: "State Name",
        validation: Yup.string()
            .required("State is required")
            .nullable(),
        options: stateList,
    },
    status: {
        name: "status",
        type: "select",
        label: "Status",
        validation: Yup.string()
            .required("Status is required")
            .oneOf(['active', 'deactive'], "Invalid status value"),
        options: [
            { value: "active", label: "Active" },
            { value: "deactive", label: "Deactive" }
        ],
    },
};
