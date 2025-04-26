import * as Yup from "yup";
const currentDate = new Date();
const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
currentDate.setFullYear(currentDate.getFullYear() + 2);
const formattedDate = currentDate.toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

export const ownerInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob: "",
  address: "",
  expirydate: formattedDate,
  idProofno: "",
  file_idProof: null,
};

export const vehicleOwnerField = {
  name: {
    name: "name",
    type: "text",
    label: "vehicleOwnerForm.fields.name",
    validation: Yup.string().required("vehicleOwnerForm.validation.nameRequired"),
  },
  email: {
    name: "email",
    type: "text",
    label: "vehicleOwnerForm.fields.email",
    validation: Yup.string()
      .email("vehicleOwnerForm.validation.invalidEmail")
      .required("vehicleOwnerForm.validation.emailRequired"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "vehicleOwnerForm.fields.mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "vehicleOwnerForm.validation.mobileFormat")
      .required("vehicleOwnerForm.validation.mobileRequired"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "vehicleOwnerForm.fields.dob",
    validation: Yup.date().required("vehicleOwnerForm.validation.dobRequired"),
    maxDate: today
  },
  address: {
    name: "address",
    type: "text",
    label: "vehicleOwnerForm.fields.address",
    validation: Yup.string().required("vehicleOwnerForm.validation.addressRequired"),
  },
  expirydate: {
    name: "expirydate",
    type: "date",
    label: "vehicleOwnerForm.fields.expiryDate",
    disabled: true,
    validation: Yup.date().required("vehicleOwnerForm.validation.expiryDateRequired"),
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "vehicleOwnerForm.fields.idProofNo",
    validation: Yup.string()
      .min(5, "vehicleOwnerForm.validation.idProofNoLength")
      .required("vehicleOwnerForm.validation.idProofNoRequired"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "vehicleOwnerForm.fields.idProof",
    message: "vehicleOwnerForm.fields.fileMessage",
    validation: Yup.mixed()
      .required("vehicleOwnerForm.validation.idProofRequired")
      .test("fileSize", "vehicleOwnerForm.validation.fileSize", value => {
        if (!value) return false;
        return value.size <= FILE_SIZE;
      })
      .test("fileFormat", "vehicleOwnerForm.validation.fileFormat", value => {
        if (!value) return false;
        return SUPPORTED_FORMATS.includes(value.type);
      }),
  }
};
