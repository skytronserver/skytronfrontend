import * as Yup from "yup";
import i18next from 'i18next';

let taggedList = [];

export const uploadReceiptInitials = {
  device_id: "",
};

export const vahanVerificationInitials = {
  device_id: "",
};

export const vahanVerificationFields = {
  device_id: {
    name: "device_id",
    type: "autocomplete",
    label: i18next.t('uploadReceipt.fields.registrationNo'),
    validation: Yup.string().required(i18next.t('uploadReceipt.validation.registrationNoRequired')),
    options: [{ label: '', value: i18next.t('uploadReceipt.fields.selectRegistrationNo') }]
  },
};

export const uploadReceiptFormFields = {
  device_id: {
    name: "device_id",
    type: "select",
    label: i18next.t('uploadReceipt.fields.imeiNo'),
    validation: Yup.string().required(i18next.t('uploadReceipt.validation.imeiRequired')),
    options: taggedList,
  }
};
