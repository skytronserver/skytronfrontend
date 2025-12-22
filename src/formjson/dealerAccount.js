import * as Yup from "yup";
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
    type: "select",
    label: "dealerAccountForm.fields.manufacturer",
    validation: Yup.string().required("dealerAccountForm.validation.manufacturerRequired"),
    options: [],
  },
  name: {
    name: "name",
    type: "text",
    label: "dealerAccountForm.fields.name",
    validation: Yup.string().required("dealerAccountForm.validation.nameRequired"),
  },
  email: {
    name: "email",
    type: "text",
    label: "dealerAccountForm.fields.email",
    validation: Yup.string()
      .email("dealerAccountForm.validation.invalidEmail")
      .required("dealerAccountForm.validation.emailRequired"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "dealerAccountForm.fields.mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "dealerAccountForm.validation.mobileFormat")
      .required("dealerAccountForm.validation.mobileRequired"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "dealerAccountForm.fields.dob",
    validation: Yup.date().required("dealerAccountForm.validation.dobRequired"),
    maxDate: today
  },
  company_name: {
    name: "company_name",
    type: "text",
    label: "dealerAccountForm.fields.companyName",
    validation: Yup.string().required("dealerAccountForm.validation.companyNameRequired"),
  },
  gstnnumber: {
    name: "gstnnumber",
    type: "text",
    label: "dealerAccountForm.fields.gstNo",
    validation: Yup.string()
      .matches(
        /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
        "Please enter a valid GST number"
      )
      .required("dealerAccountForm.validation.gstNoRequired"),
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
    validation: Yup.string().min(5, "dealerAccountForm.validation.idProofMinLength").required("dealerAccountForm.validation.userIdProofNoRequired"),
  },
  expirydate: {
    name: "expirydate",
    type: "date",
    label: "dealerAccountForm.fields.expirydate",
    validation: Yup.date().required("dealerAccountForm.validation.expirydateRequired"),
    minDate: today
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
    validation: Yup.number()
      .typeError("dealerAccountForm.validation.latNumber")
      .required("Latitude is required"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    validation: Yup.number()
      .typeError("dealerAccountForm.validation.lonNumber")
      .required("Longitude is required"),
  },
};
