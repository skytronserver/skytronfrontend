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
    type: "select",
    label: "vehicleCategory.form.category.label",
    options: [
      { value: "AMBULANCE", label: "Ambulance" },
      { value: "BUS", label: "Bus" },
      { value: "DUMPER", label: "Dumper" },
      { value: "POLICE", label: "Police" },
      { value: "SCHOOL_BUS", label: "School bus" },
      { value: "TANKER", label: "Tanker" },
      { value: "TAXI", label: "Taxi" },
      { value: "TRUCK", label: "Truck" },
    ],
    validation: Yup.string().required("vehicleCategory.form.category.required"),
  },
  maxSpeed: {
    name: "maxSpeed",
    type: "text",
    label: "vehicleCategory.form.maxSpeed.label",
    validation: Yup.number().min(1, "Max Speed must be at least 1").max(300, "Max Speed cannot exceed 300").required("vehicleCategory.form.maxSpeed.required"),
  },
  warnSpeed: {
    name: "warnSpeed",
    type: "text",
    label: "vehicleCategory.form.warnSpeed.label",
    validation: Yup.number()
      .min(1, "Warn Speed must be at least 1")
      .max(300, "Warn Speed cannot exceed 300")
      .lessThan(Yup.ref('maxSpeed'), "Warn Speed must be less than Max Speed")
      .required("vehicleCategory.form.warnSpeed.required"),
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
    validation: Yup.string()
      .test("is-greater", "End time must be after start time", function(value) {
        const { working_hour_start_time } = this.parent;
        if (!working_hour_start_time || !value) return true;
        return value > working_hour_start_time;
      })
      .required("vehicleCategory.form.workingHourEndTime.required"),
  }
};
