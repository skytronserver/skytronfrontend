import * as Yup from "yup";
export const vehicleCategoryInitialsFields = {
    category:"",
    maxSpeed:"",
    warnSpeed:"",
    working_hour_start_time:"",
    working_hour_end_time:"",
};

export const vehicleCategoryFormFields = {
    category: {
    name: "category",
    type: "text",
    label: "vehicleCategory.form.category.label",
    validation: Yup.string().required("vehicleCategory.form.category.required"),
  },
  maxSpeed: {
    name: "maxSpeed",
    type: "text",
    label: "vehicleCategory.form.maxSpeed.label",
    validation: Yup.number().required("vehicleCategory.form.maxSpeed.required"),
  },
  warnSpeed: {
    name: "warnSpeed",
    type: "text",
    label: "vehicleCategory.form.warnSpeed.label",
    validation: Yup.number().required("vehicleCategory.form.warnSpeed.required"),
  },
  working_hour_start_time: {
    name: "working_hour_start_time",
    type: "time",
    label: "vehicleCategory.form.workingHourStartTime.label",
    validation: Yup.string().required("vehicleCategory.form.workingHourStartTime.required"),
  },
  working_hour_end_time: {
    name: "working_hour_end_time",
    type: "time",
    label: "vehicleCategory.form.workingHourEndTime.label",
    validation: Yup.string().required("vehicleCategory.form.workingHourEndTime.required"),
  }
};
