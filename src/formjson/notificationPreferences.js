import * as Yup from "yup";

export const notificationPreferencesInitialsFields = {
  nf_popup: false,
  nf_sms: false,
  nf_email: false,
};

export const notificationPreferencesFormFields = {
  nf_popup: {
    name: "nf_popup",
    type: "checkbox",
    label: "notificationPreferences.form.popup.label",
    validation: Yup.boolean(),
  },
  nf_sms: {
    name: "nf_sms",
    type: "checkbox",
    label: "notificationPreferences.form.sms.label",
    validation: Yup.boolean(),
  },
  nf_email: {
    name: "nf_email",
    type: "checkbox",
    label: "notificationPreferences.form.email.label",
    validation: Yup.boolean(),
  },
};
