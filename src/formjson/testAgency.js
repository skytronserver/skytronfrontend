import * as Yup from 'yup';

const FILE_SIZE = 1024 * 1024; // 1 MB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];

export const testAgencyInitialValues = {
    agency_name: '',
    company_address: '',
    company_pin: '',
    idProofno: '',
    status: 'Accept',
    name: '',
    email: '',
    mobile: '',
    dob: '',
    file_authLetter: null,
    file_idProof: null,
};

export const testAgencyFormFields = {
    agency_name: {
        name: 'agency_name',
        type: 'text',
        label: 'Agency Name',
        validation: Yup.string().required('Agency name is required'),
    },
    company_address: {
        name: 'company_address',
        type: 'text',
        label: 'Company Address',
        validation: Yup.string(),
    },
    company_pin: {
        name: 'company_pin',
        type: 'text',
        label: 'PIN / Postal Code',
        validation: Yup.string(),
    },
    idProofno: {
        name: 'idProofno',
        type: 'text',
        label: 'Applicant ID Proof Number (PAN CARD, ADHAR, VOTER ID, DRIVING LICENSE, PASSPORT)',
        validation: Yup.string(),
    },
    status: {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'Accept', label: 'Accept' },
            { value: 'Allow to login', label: 'Allow to login' },
            { value: 'Allow to add dealer', label: 'Allow to add dealer' },
            { value: 'Reject', label: 'Reject' },
        ],
        validation: Yup.string().required('Status is required'),
    },
    name: {
        name: 'name',
        type: 'text',
        label: 'Applicant Name',
        validation: Yup.string().required('Contact person name is required'),
    },
    email: {
        name: 'email',
        type: 'text',
        label: 'Applicant Email',
        validation: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
    },
    mobile: {
        name: 'mobile',
        type: 'tel',
        label: 'Applicant Mobile Number',
        validation: Yup.string()
            .matches(/^\d{10,15}$/, 'Mobile must be 10–15 digits')
            .required('Mobile number is required'),
    },
    dob: {
        name: 'dob',
        type: 'date',
        label: 'Applicant Date of Birth',
        validation: Yup.string().required('Date of birth is required'),
    },
    file_authLetter: {
        name: 'file_authLetter',
        type: 'file',
        label: 'Authorisation Letter (PDF)',
        message: 'Upload the authorisation letter in PDF, PNG or JPG format (max 1 MB)',
        validation: Yup.mixed()
            .required('Authorisation letter is required')
            .test('fileSize', 'File size should not exceed 1 MB', (value) => {
                if (!value) return false;
                return value.size <= FILE_SIZE;
            })
            .test('fileFormat', 'Only PDF, PNG, and JPG files are allowed', (value) => {
                if (!value) return false;
                return SUPPORTED_FORMATS.includes(value.type);
            }),
    },
    file_idProof: {
        name: 'file_idProof',
        type: 'file',
        label: 'ID Proof (PDF)',
        message: 'Upload the ID proof in PDF, PNG or JPG format (max 1 MB)',
        validation: Yup.mixed()
            .required('ID proof is required')
            .test('fileSize', 'File size should not exceed 1 MB', (value) => {
                if (!value) return false;
                return value.size <= FILE_SIZE;
            })
            .test('fileFormat', 'Only PDF, PNG, and JPG files are allowed', (value) => {
                if (!value) return false;
                return SUPPORTED_FORMATS.includes(value.type);
            }),
    },
};
