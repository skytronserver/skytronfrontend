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
  lat: "",
  lon: "",
};

export const vehicleOwnerField = {
  name: {
    name: "name",
    type: "text",
    label: "vehicleOwnerForm.fields.name",
    required: true,
    validation: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .matches(/^[A-Za-z\s]+$/, "Name must contain only alphabets")
      .required("vehicleOwnerForm.validation.nameRequired"),
  },
  email: {
    name: "email",
    type: "text",
    label: "vehicleOwnerForm.fields.email",
    required: true,
    validation: Yup.string()
      .trim()
      .email("vehicleOwnerForm.validation.invalidEmail")
      .max(100, "Email cannot exceed 100 characters")
      .required("vehicleOwnerForm.validation.emailRequired"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "vehicleOwnerForm.fields.mobile",
    required: true,
    validation: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number starting with 6-9")
      .required("vehicleOwnerForm.validation.mobileRequired"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "vehicleOwnerForm.fields.dob",
    required: true,
    maxDate: today,
    validation: Yup.date()
      .typeError("Please enter a valid date")
      .max(new Date(), "Date of birth cannot be in the future")
      .test("age", "Owner must be at least 18 years old", (value) => {
        if (!value) return false;
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        const monthDiff = today.getMonth() - value.getMonth();
        const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) ? age - 1 : age;
        return adjustedAge >= 18;
      })
      .required("vehicleOwnerForm.validation.dobRequired"),
  },
  address: {
    name: "address",
    type: "text",
    label: "vehicleOwnerForm.fields.address",
    required: true,
    validation: Yup.string()
      .trim()
      .min(10, "Address must be at least 10 characters")
      .max(255, "Address cannot exceed 255 characters")
      .required("vehicleOwnerForm.validation.addressRequired"),
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
    required: true,
    validation: Yup.string()
      .trim()
      .required("vehicleOwnerForm.validation.idProofNoRequired")
      .test("idProofFormat", "Enter a valid ID: Aadhaar (12 digits), Voter ID (e.g. ABC1234567), Passport (e.g. A1234567), or Driving License (e.g. DL0120110149646)", (value) => {
        if (!value) return false;
        const v = value.trim().toUpperCase().replace(/\s/g, "");
        const aadhaar       = /^\d{12}$/;                          // 12 digits
        const voterId       = /^[A-Z]{3}\d{7}$/;                   // 3 letters + 7 digits (e.g. ABC1234567)
        const passport      = /^[A-Z]\d{7}$/;                      // 1 letter + 7 digits (e.g. A1234567)
        const drivingLicense = /^[A-Z]{2}\d{10,13}$/;              // 2 letters + 10-13 digits (e.g. DL0120110149646)
        return aadhaar.test(v) || voterId.test(v) || passport.test(v) || drivingLicense.test(v);
      }),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    required: true,
    validation: Yup.number()
      .typeError("Latitude must be a number")
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .required("Latitude is required"),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    required: true,
    validation: Yup.number()
      .typeError("Longitude must be a number")
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .required("Longitude is required"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "vehicleOwnerForm.fields.idProof",
    required: true,
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
