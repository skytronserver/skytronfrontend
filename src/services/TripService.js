import { getAxiosInstance } from './axiosInstance';

// Mock functions for trip planning
// In a real implementation, these would call actual API endpoints

// Get all trips for a device
const getTrips = (deviceId) => {
  // In a real implementation, this would be an API call
  // For now, we'll use localStorage
  const trips = JSON.parse(localStorage.getItem(`trips_${deviceId}`) || '[]');
  return Promise.resolve({ data: trips });
};

// Get a specific trip by ID
const getTripById = (tripId) => {
  // In a real implementation, this would be an API call
  const allTrips = JSON.parse(localStorage.getItem('all_trips') || '[]');
  const trip = allTrips.find(t => t.id === tripId);
  return Promise.resolve({ data: trip });
};

// Create a new trip
export const createTrip = async (tripData) => {
  try {
    // Generate a unique ID for the trip
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the trip object with the generated ID
    const newTrip = {
      id: tripId,
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get existing trips from localStorage
    const existingTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    // Add the new trip to the list
    existingTrips.push(newTrip);
    
    // Save the updated trips list to localStorage
    localStorage.setItem('trips', JSON.stringify(existingTrips));
    
    // Also save to device-specific collection
    const deviceTrips = JSON.parse(localStorage.getItem(`trips_${tripData.device_id}`) || '[]');
    deviceTrips.push(newTrip);
    localStorage.setItem(`trips_${tripData.device_id}`, JSON.stringify(deviceTrips));
    
    return { success: true, data: newTrip };
  } catch (error) {
    console.error('Error creating trip:', error);
    return { success: false, error: error.message };
  }
};

// Update an existing trip
export const updateTrip = async (tripId, tripData) => {
  try {
    // Get existing trips from localStorage
    const existingTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    // Find the trip index
    const tripIndex = existingTrips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex === -1) {
      return { success: false, error: 'Trip not found' };
    }
    
    // Update the trip
    const updatedTrip = {
      ...existingTrips[tripIndex],
      ...tripData,
      updatedAt: new Date().toISOString(),
    };
    
    // Replace the trip in the array
    existingTrips[tripIndex] = updatedTrip;
    
    // Save the updated trips list to localStorage
    localStorage.setItem('trips', JSON.stringify(existingTrips));
    
    // Also update in device-specific collection
    const deviceTrips = JSON.parse(localStorage.getItem(`trips_${updatedTrip.device_id}`) || '[]');
    const deviceTripIndex = deviceTrips.findIndex(trip => trip.id === tripId);
    
    if (deviceTripIndex !== -1) {
      deviceTrips[deviceTripIndex] = updatedTrip;
      localStorage.setItem(`trips_${updatedTrip.device_id}`, JSON.stringify(deviceTrips));
    }
    
    return { success: true, data: updatedTrip };
  } catch (error) {
    console.error('Error updating trip:', error);
    return { success: false, error: error.message };
  }
};

// Delete a trip
const deleteTrip = (tripId, deviceId) => {
  // In a real implementation, this would be an API call
  const allTrips = JSON.parse(localStorage.getItem('all_trips') || '[]');
  const deviceTrips = JSON.parse(localStorage.getItem(`trips_${deviceId}`) || '[]');
  
  // Remove the trip from both collections
  const filteredAllTrips = allTrips.filter(t => t.id !== tripId);
  const filteredDeviceTrips = deviceTrips.filter(t => t.id !== tripId);
  
  // Save to localStorage
  localStorage.setItem('all_trips', JSON.stringify(filteredAllTrips));
  localStorage.setItem(`trips_${deviceId}`, JSON.stringify(filteredDeviceTrips));
  
  return Promise.resolve({ data: { success: true } });
};

// Update trip status
const updateTripStatus = (tripId, status) => {
  try {
    // Get trips from both collections
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const tripIndex = allTrips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }

    // Update the trip status
    const updatedTrip = {
      ...allTrips[tripIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    // If the trip is completed, add completion time
    if (status === 'completed') {
      updatedTrip.completedAt = new Date().toISOString();
    }

    // Update in general collection
    allTrips[tripIndex] = updatedTrip;
    localStorage.setItem('trips', JSON.stringify(allTrips));

    // Update in device-specific collection
    const deviceTrips = JSON.parse(localStorage.getItem(`trips_${updatedTrip.device_id}`) || '[]');
    const deviceTripIndex = deviceTrips.findIndex(t => t.id === tripId);
    
    if (deviceTripIndex !== -1) {
      deviceTrips[deviceTripIndex] = updatedTrip;
      localStorage.setItem(`trips_${updatedTrip.device_id}`, JSON.stringify(deviceTrips));
    }

    return Promise.resolve({ data: updatedTrip });
  } catch (error) {
    console.error('Error updating trip status:', error);
    return Promise.reject(error);
  }
};

const TripService = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripStatus
};

export default TripService; 