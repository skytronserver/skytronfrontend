import { getAxiosInstance } from './axiosInstance';

// Get all trips
const getTrips = async () => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.get('/api/trip/');
    return response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

// Get a specific trip by ID
const getTripById = async (tripId) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.get(`/api/trip/${tripId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trip ${tripId}:`, error);
    throw error;
  }
};

// Create a new trip
export const createTrip = async (tripData) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.post('/api/trip/create/', tripData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating trip:', error);
    return { success: false, error: error.message };
  }
};

// Update an existing trip
export const updateTrip = async (tripId, tripData) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.put(`/api/trip/${tripId}/update/`, tripData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating trip:', error);
    return { success: false, error: error.message };
  }
};

// End a trip
const endTrip = async (tripId) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.post(`/api/trip/${tripId}/end/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error ending trip:', error);
    return { success: false, error: error.message };
  }
};

// Cancel a trip
const cancelTrip = async (tripId) => {
  try {
    const axios = getAxiosInstance();
    const response = await axios.post(`/api/trip/${tripId}/cancel/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error cancelling trip:', error);
    return { success: false, error: error.message };
  }
};

const TripService = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  endTrip,
  cancelTrip
};

export default TripService;