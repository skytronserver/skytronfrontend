import * as Yup from "yup";
import { goldNameValidation, goldMobileValidation, goldEmailValidation, goldDobValidation, goldGstValidation, goldIdProofValidation, goldLatValidation, goldLonValidation } from "./validationHelpers";
const FILE_SIZE = 512 * 1024; // 512 MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
const currentDate = new Date();
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split("T")[0];
const today = new Date().toISOString().split('T')[0];

export const dealerAccountInitialValues = {
  manufacturer: "",
  name: "",
  mobile: "",
  email: "",
  dob: "",
  company_name: "",
  gstnnumber: "",
  address_State: "",
  districts: [],
  idProofno: "",
  expirydate: formattedDate,
  file_authLetter: null,
  file_companRegCertificate: null,
  file_GSTCertificate: null,
  file_idProof: null,
  lat: "",
  lon: "",
};

export const dealerAccountFormField = {
  manufacturer: {
    name: "manufacturer",
    type: "text",
    label: "dealerAccountForm.fields.manufacturer",
    validation: Yup.string().required("dealerAccountForm.validation.manufacturerRequired"),
    disabled: true,
  },
  name: {
    name: "name",
    type: "text",
    label: "dealerAccountForm.fields.name",
    validation: goldNameValidation("Name"),
  },
  email: {
    name: "email",
    type: "text",
    label: "dealerAccountForm.fields.email",
    validation: goldEmailValidation("Email"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "dealerAccountForm.fields.mobile",
    validation: goldMobileValidation("Mobile"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "dealerAccountForm.fields.dob",
    validation: goldDobValidation("Date of Birth"),
    maxDate: today
  },
  company_name: {
    name: "company_name",
    type: "text",
    label: "dealerAccountForm.fields.companyName",
    validation: goldNameValidation("Company Name"),
  },
  gstnnumber: {
    name: "gstnnumber",
    type: "text",
    label: "Company GST No",
    validation: goldGstValidation("Company GST No"),
  },
  address_State: {
    name: "address_State",
    type: "text",
    label: "dealerAccountForm.fields.state",
    validation: Yup.string().required("dealerAccountForm.validation.stateRequired"),
    disabled: true
  },
  districts: {
    name: "districts",
    type: "multiselect",
    label: "dealerAccountForm.fields.district",
    validation: Yup.array().required("dealerAccountForm.validation.districtsRequired"),
    options: [],
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "dealerAccountForm.fields.userIdProofNo",
    validation: goldIdProofValidation("User ID Proof No"),
  },
  expirydate: {
    name: "expirydate",
    type: "date",
    label: "dealerAccountForm.fields.expirydate",
    disabled: true,
    validation: Yup.date().required("dealerAccountForm.validation.expirydateRequired"),
    minDate: today,
  },
  file_authLetter: {
    name: "file_authLetter",
    type: "file",
    label: "dealerAccountForm.fields.authorizationLetter",
    message: "dealerAccountForm.messages.fileRestrictions",
    validation: Yup.mixed().required("dealerAccountForm.validation.authorizationLetterRequired")
      .test("fileSize", "dealerAccountForm.validation.fileSize", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "dealerAccountForm.validation.fileFormat", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_companRegCertificate: {
    name: "file_companRegCertificate",
    type: "file",
    label: "dealerAccountForm.fields.companyRegistrationCertificate",
    message: "dealerAccountForm.messages.fileRestrictions",
    validation: Yup.mixed().required("dealerAccountForm.validation.companyRegistrationCertificateRequired")
      .test("fileSize", "dealerAccountForm.validation.fileSize", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "dealerAccountForm.validation.fileFormat", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      })
  },
  file_GSTCertificate: {
    name: "file_GSTCertificate",
    type: "file",
    label: "dealerAccountForm.fields.gstCertificate",
    message: "dealerAccountForm.messages.fileRestrictions",
    validation: Yup.mixed().required("dealerAccountForm.validation.gstCertificateRequired")
      .test("fileSize", "dealerAccountForm.validation.fileSize", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "dealerAccountForm.validation.fileFormat", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "dealerAccountForm.fields.userIdProof",
    message: "dealerAccountForm.messages.fileRestrictions",
    validation: Yup.mixed().required("dealerAccountForm.validation.userIdProofRequired")
      .test("fileSize", "dealerAccountForm.validation.fileSize", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "dealerAccountForm.validation.fileFormat", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    validation: goldLatValidation("Latitude"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    validation: goldLonValidation("Longitude"),
  },
};
