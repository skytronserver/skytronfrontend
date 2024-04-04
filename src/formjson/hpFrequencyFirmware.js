import * as Yup from "yup";
import DeviceModelServices from "../services/DeviceModelServices";
const retriveModelList = async () => {
  try {
    const response = await DeviceModelServices.getAllModels();
    const list = response.data.map((device) => ({
      value: device.id,
      label: device.model_name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};

const modelList = await retriveModelList();
export const hpFrequencyInitials = {
  devicemodel: "",
  freq: "",
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
    label: "Device Model",
    validation: Yup.string().required("Device model is required"),
    options: modelList,
  },
  freq: {
    name: "freq",
    type: "text",
    label: "HP Frequency",
    validation: Yup.string().required("HP Frequency is required"),
  },
};
export const firmwareFields = {
  devicemodel: {
    name: "devicemodel",
    type: "select",
    label: "Device Model",
    validation: Yup.string().required("Device model is required"),
    options: modelList,
  },
  firmware_vertion: {
    name: "firmware_vertion",
    type: "text",
    label: "Firmware Version",
    validation: Yup.string().required("Firmware Version is required"),
  },
  file_bin: {
    name: "file_bin",
    type: "file",
    label: "Select File",
    validation: Yup.mixed().required("File is required"),
  },
};
