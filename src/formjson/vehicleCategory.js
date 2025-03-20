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
    validation: Yup.string()
      .required("Vehicle Category is required")
      .min(2, "Category must be at least 2 characters")
      .max(50, "Category cannot exceed 50 characters"),
  },
  maxSpeed: {
    name: "maxSpeed",
    type: "text",
    label: "Maximum Speed",
    validation: Yup.number()
      .required("Maximum Speed is required")
      .positive("Maximum Speed must be a positive number")
      .max(500, "Maximum Speed cannot exceed 500"),
  },
  warnSpeed: {
    name: "warnSpeed",
    type: "text",
    label: "Warning Speed",
    validation: Yup.number()
      .required("Warning Speed is required")
      .positive("Warning Speed must be a positive number")
      .max(500, "Warning Speed cannot exceed 500")
      .test(
        "lessThanMaxSpeed",
        "Warning Speed must be less than Maximum Speed",
        function (value) {
          return !value || !this.parent.maxSpeed || value <= this.parent.maxSpeed;
        }
      ),
  }
};
