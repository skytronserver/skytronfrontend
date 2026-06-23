import * as Yup from "yup";
let modelList=[];
export const hpFrequencyInitials = {
  devicemodel: "",
  freq: "",
};

export const otaInitials = {
  devicemodel: "",
  command: "",
};

export const firmwareInitials = {
  devicemodel: "",
  firmware_vertion: "",
  file_bin: null,
};

export const hpFrequencyFields = {
  devicemodel: {
    name: "devicemodel",
    type: "select",
    label: "form.deviceModel.label",
    validation: Yup.string().required("form.deviceModel.required"),
    options: modelList,
  },
  freq: {
    name: "freq",
    type: "text",
    label: "form.frequency.label",
    validation: Yup.number().min(5, "Frequency must be at least 5 seconds").max(3600, "Frequency cannot exceed 3600 seconds").required("form.frequency.required"),
  },
};

export const otaFields = {
  devicemodel: {
    name: "devicemodel",
    type: "select",
    label: "form.deviceModel.label",
    validation: Yup.string().required("form.deviceModel.required"),
    options: modelList,
  },
  command: {
    name: "command",
    type: "text",
    label: "form.command.label",
    validation: Yup.string().required("form.command.required"),
  },
};
export const firmwareFields = {
  devicemodel: {
    name: "devicemodel",
    type: "select",
    label: "form.deviceModel.label",
    validation: Yup.string().required("form.deviceModel.required"),
    options: modelList,
  },
  firmware_vertion: {
    name: "firmware_vertion",
    type: "text",
    label: "form.firmwareVersion.label",
    validation: Yup.string().matches(/^\d+(\.\d+)*$/, "Must be a valid semantic version (e.g., 1.0 or 1.2.3)").required("form.firmwareVersion.required"),
  },
  file_bin: {
    name: "file_bin",
    type: "file",
    label: "form.selectFile.label",
    validation: Yup.mixed().required("form.selectFile.required"),
  },
};
