// userActions.js
import { SET_USER, SET_LOADING, SET_ERROR } from '../store/constant';
import axios from 'axios';
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const loginUser = (username, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    // Make a request to your authentication API endpoint
    const response = await axios.post('http://216.10.244.243:2000/api/user_login', {
      username,
      password,
    });
    dispatch(setUser(response.data));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
