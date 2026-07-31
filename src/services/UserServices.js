/* eslint-disable no-unused-vars */
import axios from 'axios';
import { BASE_URL } from '../store/constant';
import { getAxiosInstance } from './axiosInstance';

const getRegisteredData = () => {
    const http = getAxiosInstance();        // show device
    return http.post("/api/devicestock/deviceStockFilter/")

}

//new
const getStateStats = () => {
    const http = getAxiosInstance();        // dashboard- active state 1st card
    return http.post("/api/homepageandstat/homepage_state/")
}


const getAlertDetails = () => {
    const http = getAxiosInstance();        // dashboard- total state 2nd card
    return http.post("/api/homepageandstat/homepage_alart/")
}

const getDeviceStats = () => {
    const http = getAxiosInstance();        // dashboard- total device 3rd card
    return http.post("/api/homepageandstat/homepage_device1/")
}



const getTaggedDevices = () => {
    const http = getAxiosInstance();
    return http.post("/api/homepageandstat/homepage_device2/")
}


//new

const getRegisteredUsers = () => {
    const http = getAxiosInstance();
    return http.get("/api/get_list/")  // userList APi
}
const getAll = () => {
    const http = getAxiosInstance();
    return http.get("/posts");
};
const getUsers = () => {
    const http = getAxiosInstance();
    return http.get("/users")
}
const getSingleUser = (userId) => {
    const http = getAxiosInstance();
    return http.get(`/api/get_details/${userId}`)
}
const registerUser = (userData) => {
    const http = getAxiosInstance();
    return http.post(`/api/create_user/`, userData)
}
const updateUser = (id, userData) => {
    const http = getAxiosInstance();
    return http.put(`/api/update_user/${id}/`, userData)
}

//UserManagement API Collection
const createStateAdmin = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/StateAdmin/create_StateAdmin/", formData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const fetchStateAdmin = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/StateAdmin/filter_StateAdmin/", formData)
}
const createDTO = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/DTO_RTO/create_DTO_RTO/", formData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const createManufacturer = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/manufacturer/create_manufacturer/", formData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const createEsimUser = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/eSimProvider/create_eSimProvider/", formData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const createM2MUser = createEsimUser;
const createVehicleOwner = (ownerData) => {
    const http = getAxiosInstance();
    return http.post(`/api/VehicleOwner/create_VehicleOwner/`, ownerData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const updateVehicleOwner = (ownerData) => {
    const http = getAxiosInstance();
    return http.post(`/api/VehicleOwner/update_VehicleOwner/`, ownerData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const createSOSAdmin = (formData) => {
    const http = getAxiosInstance();
    return http.post(`/api/SOSAdmin/create_SOSAdmin/`, formData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const createSOSUser = (formData) => {
    const http = getAxiosInstance();
    return http.post(`/api/SOSuser/create_SOSuser/`, formData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    })
}
const createSystemAdmin = (data) => {
    const http = getAxiosInstance();
    return http.post(`/api/create_systemadmin/`, data);
}
const fetchVehicleOwner = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/VehicleOwner/filter_VehicleOwner/", formData);
}
const fetchSimProvider = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/eSimProvider/filter_eSimProvider/?all_user=true", formData);
}
const updateSimProvider = (data) => {
    const http = getAxiosInstance();
    return http.post("/api/eSimProvider/update_eSimProvider/", data);
}
const fetchSOSAdmin = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/SOSAdmin/filter_SOSAdmin/", formData);
}
const fetchSOSUser = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/SOSuser/filter_SOSuser/", formData);
}
const fetchDTOList = (formData) => {
    const http = getAxiosInstance();
    return http.post("/api/DTO_RTO/filter_DTO_RTO/", formData);
}
const getStateAdminDashboard = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.post(`/api/homepageandstat/homepage_stateAdmin/${queryString ? `?${queryString}` : ''}`)
}
const getDealerDashboard = () => {
    const http = getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_Dealer/');
}
const getManufacturerDashboard = () => {
    const http = getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_Manufacturer/');
}
const getOwnerDashboard = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.post(`/api/homepageandstat/homepage_VehicleOwner/${queryString ? `?${queryString}` : ''}`);
}
const getDashboardUserData = () => {
    const http = getAxiosInstance();
    return http.post('/api/homepageandstat/homepage_user1/')
}
const getDashboardData = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.post(`/api/homepageandstat/homepage/${queryString ? `?${queryString}` : ''}`)
}
const getDTODashboardData = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.post(`/api/homepageandstat/homepage_DTO/${queryString ? `?${queryString}` : ''}`);
}
const getSOSAdminDashboard = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.get(`/api/SOS/SOS_Admin_report/${queryString ? `?${queryString}` : ''}`);
}
const getSOSLeadDashboard = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.get(`/api/SOS/SOS_TL_report/${queryString ? `?${queryString}` : ''}`);
}
const getSOSExeDashboard = () => {
    const http = getAxiosInstance();
    return http.get("/api/SOS/SOS_EX_report/");
}
const deactivateUser = (data) => {
    const http = getAxiosInstance();
    return http.post(`/api/deactivateUser/`, data);
}
const activateUser = (data) => {
    const http = getAxiosInstance();
    return http.post(`/api/activateUser/`, data);
}
const resendUserCreationOtp = (data, isFormData = false) => {
    const http = getAxiosInstance();
    return http.post(
        "/api/resend_usercreation_otp/",
        data,
        {
            headers: {
                "Content-type": isFormData ? "multipart/form-data" : "application/json",
            },
        }
    );
}

const getESIMProviderDashboard = () => {
    const http = getAxiosInstance();
    return http.post("/api/homepageandstat/homepage_esimProvider/");
};
const getM2MProviderDashboard = getESIMProviderDashboard;

const getVehicleAlertStatistics = (startDate, endDate) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const queryString = queryParams.toString();
    return http.get(`/api/Statistics/vehicle_alert_statistics/${queryString ? `?${queryString}` : ''}`);
};

const publicUserRegistration = (data) => {
    const isFormData = data instanceof FormData;
    return axios.post(`${BASE_URL}api/public/user_registration/`, data, {
        headers: {
            "Content-type": isFormData ? "multipart/form-data" : "application/json",
        },
    });
};

const setLoginSettings = (data) => {
    const http = getAxiosInstance();
    return http.post('/api/set_login_settings/', data);
};

const updateVehicleOwnerExpiry = (data) => {
    const http = getAxiosInstance();
    return http.post('/api/update_vehicle_owner_expiry/', data);
};

const getVehicleStatusMetrics = () => {
    const http = getAxiosInstance();
    return http.get('/api/vehicle_status_metrics/');
};

const getSOSMonthlyMetrics = (year) => {
    const http = getAxiosInstance();
    return http.get(`${process.env.REACT_APP_BASE_URL}api/SOS/monthly_metrics/?year=${year}`);
};

const getLoginReport = (params) => {
    const http = getAxiosInstance();
    const queryParams = new URLSearchParams();
    if (params) {
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
    }
    const queryString = queryParams.toString();
    return http.get(`/school/api/admin/users/login-report/${queryString ? `?${queryString}` : ''}`);
};


const UserServices = {

    getStateStats,
    getAlertDetails,
    getDeviceStats,
    getTaggedDevices,
    getRegisteredUsers,
    getAll,
    getUsers,
    getSingleUser,
    registerUser,
    updateUser,
    createVehicleOwner,
    updateVehicleOwner,
    createStateAdmin,
    createDTO,
    createManufacturer,
    createEsimUser,
    createM2MUser,
    createSOSAdmin,
    createSOSUser,
    createSystemAdmin,
    fetchVehicleOwner,
    fetchSimProvider,
    updateSimProvider,
    fetchSOSAdmin,
    fetchSOSUser,
    fetchDTOList,
    getStateAdminDashboard,
    getDashboardUserData,
    getDashboardData,
    getDealerDashboard,
    getManufacturerDashboard,
    getOwnerDashboard,
    getDTODashboardData,
    getSOSAdminDashboard,
    getSOSLeadDashboard,
    getSOSExeDashboard,
    deactivateUser,
    activateUser,
    resendUserCreationOtp,
    getESIMProviderDashboard,
    getM2MProviderDashboard,
    getVehicleAlertStatistics,
    publicUserRegistration,
    setLoginSettings,
    updateVehicleOwnerExpiry,
    getVehicleStatusMetrics,
    getSOSMonthlyMetrics,
    getAmbulanceFleetMetrics: () => {
        const http = getAxiosInstance();
        return http.get('/api/ambulance_fleet_metrics/');
    },
    getPoliceFleetMetrics: () => {
        const http = getAxiosInstance();
        return http.get('/api/police_fleet_metrics/');
    },
    getLoginReport
};

export default UserServices;