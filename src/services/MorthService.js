import axios from 'axios';

const GROMED_BASE_URL = `${process.env.REACT_APP_BASE_URL}api/central_api/`;
const GROMED_TOKEN = process.env.REACT_APP_GROMED_TOKEN;

export const fetchMorthDashboardData = async () => {
  if (!GROMED_TOKEN) {
    console.error('Missing REACT_APP_GROMED_TOKEN for Gromed API');
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (GROMED_TOKEN) {
    headers['Authorization'] = `Bearer ${GROMED_TOKEN}`;
  }

  const response = await axios.get(GROMED_BASE_URL, {
    headers,
  });

  return response.data;
};
