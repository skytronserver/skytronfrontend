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
            { value: "SETHBT", label: "Set Harshbreak" },
            { value: "SETHAT", label: "Set Harsh Acceleration" },
            { value: "SETRTT", label: "Set Harsh turning" },
            { value: "SETOTT", label: "Set Over Spped Treshold" },
            { value: "SETURION", label: "Set Data update rate in ignintion ON" },
            { value: "SETURIOFF", label: "Set Data update rate in ignintion OFF" },
            { value: "SETEMCR", label: "Set Emergency Cutoff rate" },
            { value: "SETURHP", label: "Set Upadate rate of Health Packet" },
            { value: "SETPIP", label: "Set Primary IP" },
            { value: "SETPPORT", label: "Set Primary Port" },
            { value: "SETEIP", label: "Set Emergency IP" },
            { value: "SETEPORT", label: "Set Emergency Port" },
            { value: "SETESCN", label: "Set Emergency control number" },
            { value: "SETAPN", label: "Set APN" },
            { value: "SETRESET", label: "Set Reset" },
            { value: "GETGETINFO", label: "Get Firmware Info" },
        ],
        validation: Yup.string().required("Command is required"),
    },
    input_value: {
        name: "input_value",
        type: "text",
        label: "Value",
        validation: Yup.string().when("selected_command", {
            is: (command) => !command || !command.toUpperCase().startsWith("GET"),
            then: (schema) => schema.required("Value is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
    },
};
