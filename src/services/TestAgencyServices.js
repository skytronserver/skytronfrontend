import { getAxiosInstance } from './axiosInstance';

/**
 * Create a new Test Agency (System Admin / superadmin only).
 * Uses multipart/form-data because file uploads are required.
 * @param {FormData} formData
 */
const createTestAgency = (formData) => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/create_testAgency/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Update an existing Test Agency (System Admin / superadmin only).
 * testagency_id is required; all other fields are optional.
 * @param {FormData} formData
 */
const updateTestAgency = (formData) => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/update_testAgency/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Get full list of all Test Agencies (System Admin / superadmin only).
 */
const listTestAgency = () => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/list/', {});
};

const getNameList = () => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/name_list/', {});
};

/**
 * Create Test Agency details.
 * @param {Object} data { name, address, pincode }
 */
const createAgencyDetails = (data) => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/details/create/', data);
};

/**
 * Update Test Agency details.
 * @param {Object} data { detail_id, address, pincode }
 */
const updateAgencyDetails = (data) => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/details/update/', data);
};

/**
 * Get all Device Models assigned to the calling Test Agency.
 * Accessible by 'testagency' role only.
 */
const getAgencyDeviceModels = () => {
    const http = getAxiosInstance();
    return http.post('/api/testAgency/device_models/', {});
};

const TestAgencyServices = {
    createTestAgency,
    updateTestAgency,
    listTestAgency,
    getNameList,
    getAgencyDeviceModels,
    createAgencyDetails,
    updateAgencyDetails,
};

export default TestAgencyServices;
