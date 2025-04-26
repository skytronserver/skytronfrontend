import { getAxiosInstance } from './axiosInstance';

const POIService = {
  getAllPOIs: async () => {
    try {
      const http = getAxiosInstance();
      const response = await http.get("/api/poi/list/");
      return response.data;
    } catch (error) {
      console.error('Error fetching POIs:', error);
      throw error;
    }
  },

  createPOI: async (poiData) => {
    try {
      const http = getAxiosInstance();
      const response = await http.post("/api/poi/create/", poiData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating POI:', error);
      throw error;
    }
  },

  updatePOI: async (poiData) => {
    try {
      const http = getAxiosInstance();
      const response = await http.post(`/api/poi/update/`, poiData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating POI:', error);
      throw error;
    }
  },

  deletePOI: async (poiData) => {
    try {
      const http = getAxiosInstance();
      const response = await http.post(`/api/poi/delete/`, poiData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting POI:', error);
      throw error;
    }
  }
};

export default POIService; 