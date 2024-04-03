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
    label: "Vehicle Category",
    validation: Yup.string().required("Vehicle Category is required"),
  },
  maxSpeed: {
    name: "maxSpeed",
    type: "text",
    label: "Maximum Speed",
    validation: Yup.number().required("Maximum Speed is required"),
  },
  warnSpeed: {
    name: "warnSpeed",
    type: "text",
    label: "Warning Speed",
    validation: Yup.number().required("Warning Speed is required"),
  }
};
