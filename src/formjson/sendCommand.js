import * as Yup from "yup";

export const sendCommandInitials = {
    imei: "",
    command: "",
};

export const sendCommandFields = {
    imei: {
        name: "imei",
        type: "text",
        label: "IMEI",
        validation: Yup.string().required("IMEI is required"),
    },
    command: {
        name: "command",
        type: "text",
        label: "Command",
        validation: Yup.string().required("Command is required"),
    },
};
