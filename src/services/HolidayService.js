import { getAxiosInstance } from './axiosInstance';

// Get list of all holidays
const getAllHolidays = () => {
  const http = getAxiosInstance();
  return http.get(`/api/holiday/list/`);
};

// Create new holiday
const createHoliday = (holidayData) => {
  const http = getAxiosInstance();
  return http.post('/api/holiday/create/', holidayData);
};

// Update existing holiday
const updateHoliday = (id, holidayData) => {
  const http = getAxiosInstance();
  return http.post(`/api/holiday/update/${id}/`, holidayData);
};

// Delete holiday
const deleteHoliday = (id) => {
  const http = getAxiosInstance();
  return http.post(`/api/holiday/delete/${id}/`);
};

const HolidayService = {
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};

export default HolidayService; 