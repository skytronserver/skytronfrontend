import * as Yup from "yup";

export const sendCommandInitials = {
    imei: "",
    selected_command: "",
    input_value: "",
};

export const sendCommandFields = {
    imei: {
        name: "imei",
        type: "text",
        label: "IMEI",
        validation: Yup.string().required("IMEI is required"),
    },
    selected_command: {
        name: "selected_command",
        type: "select",
        label: "Command",
        options: [
            { value: "SETREGNO", label: "Set Reg No" },
            { value: "SETSOSDIS", label: "Disable SOS" },
            { value: "SETHBT", label: "Set Heartbeat" },
            { value: "SETHAT", label: "Set Harsh Acceleration" },
            { value: "SETRTT", label: "Set RTT" },
            { value: "SETOTT", label: "Set OTT" },
            { value: "SETURION", label: "Set URI On" },
            { value: "SETURIOFF", label: "Set URI Off" },
            { value: "SETEMCR", label: "Set Emergency CR" },
            { value: "SETURHP", label: "Set URI HP" },
            { value: "SETPIP", label: "Set Primary IP" },
            { value: "SETPPORT", label: "Set Primary Port" },
            { value: "SETEIP", label: "Set Emergency IP" },
            { value: "SETEPORT", label: "Set Emergency Port" },
            { value: "SETESCN", label: "Set Emergency control number" },
            { value: "SETAPN", label: "Set APN" },
            { value: "SETRESET", label: "Set Reset" },
        ],
        validation: Yup.string().required("Command is required"),
    },
    input_value: {
        name: "input_value",
        type: "text",
        label: "Value",
        validation: Yup.string().required("Value is required"),
    },
};
