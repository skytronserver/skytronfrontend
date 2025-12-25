import { getAxiosInstance } from './axiosInstance';

const IncidentService = {
    filterIncidents: (data) => {
        const http = getAxiosInstance();
        return http.post('/api/incident/filter/', data);
    }
};

export default IncidentService;
