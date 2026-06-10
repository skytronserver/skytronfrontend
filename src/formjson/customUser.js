// formjson/customUser.js
// Form field config for Custom User creation/editing — follows the project's FormField pattern.
import * as Yup from 'yup';
import { indianStates } from './indianState';

const FILE_SIZE = 512 * 1024; // 512 KB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];

export const customUserInitialValues = {
  name: '',
  mobile: '',
  email: '',
  dob: '',
  address: '',
  address_pin: '',
  address_State: '',
  id_card_name: '',
  file_id_card: null,
  file_authorisation_letter: null,
  role_code: '',
};

// Dynamic fields — role_code options are loaded at runtime
export const customUserFields = {
  name: {
    name: 'name',
    type: 'text',
    label: 'Full Name',
    validation: Yup.string().required('Name is required'),
  },
  mobile: {
    name: 'mobile',
    type: 'tel',
    label: 'Mobile Number',
    validation: Yup.string()
      .matches(/^\d{10}$/, 'Mobile must be a 10-digit number')
      .required('Mobile is required'),
  },
  email: {
    name: 'email',
    type: 'text',
    label: 'Email',
    validation: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  },
  dob: {
    name: 'dob',
    type: 'date',
    label: 'Date of Birth',
    validation: Yup.date().nullable(),
  },
  role_code: {
    name: 'role_code',
    type: 'select',
    label: 'Role',
    options: [], // populated dynamically
    validation: Yup.string().required('Role is required'),
  },
  address: {
    name: 'address',
    type: 'text',
    label: 'Address',
    multiline: true,
    rows: 2,
    validation: Yup.string().nullable(),
  },
  address_pin: {
    name: 'address_pin',
    type: 'text',
    label: 'PIN Code',
    validation: Yup.string()
      .matches(/^\d{6}$/, 'PIN must be 6 digits')
      .nullable(),
  },
  address_State: {
    name: 'address_State',
    type: 'select',
    label: 'State',
    options: [], // populated from indianState
    validation: Yup.string().nullable(),
  },
  id_card_name: {
    name: 'id_card_name',
    type: 'text',
    label: 'ID Card Type',
    validation: Yup.string().nullable(),
  },
  file_id_card: {
    name: 'file_id_card',
    type: 'file',
    label: 'ID Card (PDF/Image)',
    validation: Yup.mixed()
      .nullable()
      .test('fileSize', 'File must be less than 512 KB', (v) => !v || v.size <= FILE_SIZE)
      .test('fileFormat', 'Only PDF, JPG, PNG allowed', (v) => !v || SUPPORTED_FORMATS.includes(v.type)),
  },
  file_authorisation_letter: {
    name: 'file_authorisation_letter',
    type: 'file',
    label: 'Authorisation Letter (PDF/Image)',
    validation: Yup.mixed()
      .nullable()
      .test('fileSize', 'File must be less than 512 KB', (v) => !v || v.size <= FILE_SIZE)
      .test('fileFormat', 'Only PDF, JPG, PNG allowed', (v) => !v || SUPPORTED_FORMATS.includes(v.type)),
  },
};
