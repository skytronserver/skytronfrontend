import * as Yup from "yup";

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
eighteenYearsAgo.setHours(0, 0, 0, 0);

export const goldNameValidation = (label = "Name") => 
  Yup.string()
    .matches(/^[a-zA-Z\s]+$/, `${label} must contain only alphabets`)
    .min(2, `${label} must be at least 2 characters`)
    .max(100, `${label} must be at most 100 characters`)
    .required(`${label} is required`);

export const goldMobileValidation = (label = "Mobile") =>
  Yup.string()
    .matches(/^[6-9]\d{9}$/, `${label} must be a valid 10-digit Indian number starting with 6-9`)
    .required(`${label} is required`);

export const goldEmailValidation = (label = "Email") =>
  Yup.string()
    .email(`Invalid ${label} address`)
    .max(100, `${label} must be at most 100 characters`)
    .required(`${label} is required`);

export const goldDobValidation = (label = "Date of Birth") =>
  Yup.date()
    .max(eighteenYearsAgo, `${label}: Must be at least 18 years old`)
    .required(`${label} is required`);

export const goldPanValidation = (label = "PAN No") =>
  Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, `${label} must be a valid format (e.g. ABCDE1234F)`)
    .required(`${label} is required`);

export const goldGstValidation = (label = "GST No") =>
  Yup.string()
    .matches(
      /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
      `${label} must be a valid 15-character GST format`
    )
    .required(`${label} is required`);

export const goldIdProofValidation = (label = "ID Proof") =>
  Yup.string()
    .matches(
      /^(?:[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}|[A-Z]{5}[0-9]{4}[A-Z]{1}|[A-Z]{3}[0-9]{7}|[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[0-9]{4}|[A-Z]{2}[0-9]{2}\s?[0-9]{11})$/,
      `${label} must be a valid Aadhaar, Voter ID, Passport, PAN, or DL number`
    )
    .required(`${label} is required`);

export const goldLatValidation = (label = "Latitude") =>
  Yup.number()
    .typeError(`${label} must be a number`)
    .min(-90, `${label} must be between -90 and 90`)
    .max(90, `${label} must be between -90 and 90`)
    .required(`${label} is required`);

export const goldLonValidation = (label = "Longitude") =>
  Yup.number()
    .typeError(`${label} must be a number`)
    .min(-180, `${label} must be between -180 and 180`)
    .max(180, `${label} must be between -180 and 180`)
    .required(`${label} is required`);

export const goldPinValidation = (label = "PIN Code") =>
  Yup.string()
    .matches(/^\d{6}$/, `${label} must be exactly 6 digits`)
    .required(`${label} is required`);
