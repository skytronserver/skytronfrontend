import * as Yup from "yup";
let stateList=[];
let modelList=[];
export const ipSettingInitials = {
    state:"",
    devicemodel:"",
    ip_tracking:"",
    ip_tracking2:"",
    ip_sos:"",
    port_tracking:"",
    port_tracking2:"",
    port_sos:"",
    sms_tracking:"",
    sms_tracking2:"",
    sms_sos:"",
};
export const ipSettingFormFields = {
    state: {
        name: "state",
        type: "select",
        label: "form.state.label",
        validation: Yup.string().required("form.state.required"),
        options: stateList,
    },
    devicemodel: {
        name: "devicemodel",
        type: "select",
        label: "form.deviceModel.label",
        validation: Yup.string().required("form.deviceModel.required"),
        options: modelList,
    },
    ip_tracking: {
        name: "ip_tracking",
        type: "text",
        label: "form.ipTracking1.label",
        validation: Yup.string().required("form.ipTracking1.required"),
    },
    ip_tracking2: {
        name: "ip_tracking2",
        type: "text",
        label: "form.ipTracking2.label",
    },
    ip_sos: {
        name: "ip_sos",
        type: "text",
        label: "form.ipSos.label",
        validation: Yup.string().required("form.ipSos.required"),
    },
    port_tracking: {
        name: "port_tracking",
        type: "text",
        label: "form.portTracking1.label",
        validation: Yup.string().required("form.portTracking1.required"),
    },
    port_tracking2: {
        name: "port_tracking2",
        type: "text",
        label: "form.portTracking2.label",
    },
    port_sos: {
        name: "port_sos",
        type: "text",
        label: "form.portSos.label",
        validation: Yup.string().required("form.portSos.required"),
    },
    sms_tracking: {
        name: "sms_tracking",
        type: "text",
        label: "form.smsTracking1.label",
        validation: Yup.string().required("form.smsTracking1.required"),
    },
    sms_tracking2: {
        name: "sms_tracking2",
        type: "text",
        label: "form.smsTracking2.label",
    },
    sms_sos: {
        name: "sms_sos",
        type: "text",
        label: "form.smsSos.label",
        validation: Yup.string().required("form.smsSos.required"),
    },
};
