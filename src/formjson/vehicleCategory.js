import * as Yup from "yup";
export const vehicleCategoryInitialsFields = {
    category:"",
    maxSpeed:"",
    warnSpeed:"",
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
  }
};
