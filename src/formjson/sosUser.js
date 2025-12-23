import { disable } from "ol/rotationconstraint";
import * as Yup from "yup";
let stateList = [];
const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "application/pdf",
];
const today = new Date().toISOString().split("T")[0];
export const sosUserInitialValues = {
  name: "",
  mobile: "",
  email: "",
  dob: "",
  dtoCode: "",
  state: "",
  idProofno: "",
  file_idProof: null,
  file_authorization_letter: null,
  lat: "",
  lon: "",
};
export const emTeamInitialValues = {
  name: "",
  detail: "",
  state: "",
  teamlead: "",
  members: [],
};
export const sosOtherUserInitialValues = {
  user_type: "",
  name: "",
  mobile: "",
  email: "",
  dob: "",
  dtoCode: "",
  state: "",
  idProofno: "",
  file_idProof: null,
  file_authorization_letter: null,
  lat: "",
  lon: "",
};
export const sosUserFormField = {
  name: {
    name: "name",
    type: "text",
    label: "sosUserForm.fields.name",
    validation: Yup.string().required("sosUserForm.validation.nameRequired"),
  },
  mobile: {
    name: "mobile",
    type: "tel",
    label: "sosUserForm.fields.mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "sosUserForm.validation.invalidMobile")
      .required("sosUserForm.validation.mobileRequired"),
  },
  email: {
    name: "email",
    type: "text",
    label: "sosUserForm.fields.email",
    validation: Yup.string()
      .email("sosUserForm.validation.invalidEmail")
      .required("sosUserForm.validation.emailRequired"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "sosUserForm.fields.dob",
    validation: Yup.date().required("sosUserForm.validation.dobRequired"),
    maxDate: today,
  },
  state: {
    name: "state",
    type: "select",
    label: "sosUserForm.fields.state",
    validation: Yup.string().required("sosUserForm.validation.stateRequired"),
    options: stateList,
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "sosUserForm.fields.idProofNo",
    validation: Yup.string()
      .min(5, "sosUserForm.validation.idProofNoLength")
      .required("sosUserForm.validation.idProofNoRequired"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "sosUserForm.fields.idProof",
    message: "sosUserForm.fields.fileMessage",
    validation: Yup.mixed()
      .required("sosUserForm.validation.idProofRequired")
      .test(
        "fileSize",
        "sosUserForm.validation.fileSize",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "sosUserForm.validation.fileFormat",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
  file_authorization_letter: {
    name: "file_authorization_letter",
    type: "file",
    label: "sosUserForm.fields.authLetter",
    message: "sosUserForm.fields.fileMessage",
    validation: Yup.mixed()
      .required("sosUserForm.validation.authLetterRequired")
      .test(
        "fileSize",
        "sosUserForm.validation.fileSize",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "sosUserForm.validation.fileFormat",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
  lat: {
    name: "lat",
    type: "number",
    label: "Latitude",
    validation: Yup.number()
      .typeError("Latitude must be a number")
      .nullable(),
  },
  lon: {
    name: "lon",
    type: "number",
    label: "Longitude",
    validation: Yup.number()
      .typeError("Longitude must be a number")
      .nullable(),
  },
};

// ('teamlead', 'desk_ex', 'police_ex', 'ambulance_ex', 'PCR'(police control room), 'ACR'(ambulance control room)
export const sosOtherUserFormField = {
  user_type: {
    name: "user_type",
    type: "select",
    label: "sosUserForm.fields.userType",
    validation: Yup.string().required("sosUserForm.validation.userTypeRequired"),
    options: [
      { value: "teamlead", label: "sosUserForm.options.teamLead" },
      { value: "desk_ex", label: "sosUserForm.options.deskExecutive" },
      { value: "police_ex", label: "sosUserForm.options.policeExecutive" },
      { value: "ambulance_ex", label: "sosUserForm.options.ambulanceExecutive" },
      { value: "PCR", label: "sosUserForm.options.policeControlRoom" },
      { value: "ACR", label: "sosUserForm.options.ambulanceControlRoom" },
    ],
  },
  name: {
    name: "name",
    type: "text",
    label: "sosUserForm.fields.name",
    validation: Yup.string().required("sosUserForm.validation.nameRequired"),
  },
  mobile: {
    name: "mobile",
    type: "text",
    label: "sosUserForm.fields.mobile",
    validation: Yup.string()
      .matches(/^\d{10}$/, "sosUserForm.validation.invalidMobile")
      .required("sosUserForm.validation.mobileRequired"),
  },
  email: {
    name: "email",
    type: "text",
    label: "sosUserForm.fields.email",
    validation: Yup.string()
      .email("sosUserForm.validation.invalidEmail")
      .required("sosUserForm.validation.emailRequired"),
  },
  dob: {
    name: "dob",
    type: "date",
    label: "sosUserForm.fields.dob",
    validation: Yup.date().required("sosUserForm.validation.dobRequired"),
    maxDate: today,
  },
  state: {
    name: "state",
    type: "select",
    label: "sosUserForm.fields.state",
    validation: Yup.string().required("sosUserForm.validation.stateRequired"),
    options: stateList,
    disabled: true,
  },
  idProofno: {
    name: "idProofno",
    type: "text",
    label: "sosUserForm.fields.idProofNo",
    validation: Yup.string()
      .min(5, "sosUserForm.validation.idProofNoLength")
      .required("sosUserForm.validation.idProofNoRequired"),
  },
  file_idProof: {
    name: "file_idProof",
    type: "file",
    label: "sosUserForm.fields.idProof",
    message: "sosUserForm.fields.fileMessage",
    validation: Yup.mixed()
      .required("sosUserForm.validation.idProofRequired")
      .test(
        "fileSize",
        "sosUserForm.validation.fileSize",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "sosUserForm.validation.fileFormat",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
  file_authorization_letter: {
    name: "file_authorization_letter",
    type: "file",
    label: "sosUserForm.fields.authLetter",
    message: "sosUserForm.fields.fileMessage",
    validation: Yup.mixed()
      .required("sosUserForm.validation.authLetterRequired")
      .test(
        "fileSize",
        "sosUserForm.validation.fileSize",
        (value) => {
          if (!value) return false;
          return value.size <= FILE_SIZE;
        }
      )
      .test(
        "fileFormat",
        "sosUserForm.validation.fileFormat",
        (value) => {
          if (!value) return false;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  },
};

export const emTeamFormField = {
  name: {
    name: "name",
    type: "text",
    label: "emTeamForm.fields.name",
    validation: Yup.string().required("emTeamForm.validation.nameRequired"),
  },
  detail: {
    name: "detail",
    type: "text",
    label: "emTeamForm.fields.shiftDetails",
    validation: Yup.string().required("emTeamForm.validation.detailsRequired"),
  },
  state: {
    name: "state",
    type: "text",
    label: "emTeamForm.fields.stateName",
    validation: Yup.string().required("emTeamForm.validation.stateRequired"),
    disabled: true,
    // options: stateList,
  },
  teamlead: {
    name: "teamlead",
    type: "select",
    label: "emTeamForm.fields.teamLead",
    validation: Yup.string().required("emTeamForm.validation.teamLeadRequired"),
    options: [{ value: "", label: "emTeamForm.options.selectTeamLead" }],
  },
  members: {
    name: "members",
    type: "multiselect",
    label: "emTeamForm.fields.teamMember",
    validation: Yup.array().required("emTeamForm.validation.teamMemberRequired"),
    options: [{ value: "", label: "emTeamForm.options.select" }],
  },
};
