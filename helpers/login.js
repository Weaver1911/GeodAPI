const axios = require('axios');
const debug = require('../Utils/DebugUtils');

async function loginToDevice(ipAddress, minerKey) {
  const baseUrl = `http://${ipAddress}`;
  const loginData = new URLSearchParams();
  loginData.append('mkey', minerKey);

  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true
  });

  try {
    const response = await axiosInstance.post('/login', loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    debug.log('Login successful!');
    return axiosInstance;
  } catch (error) {
    debug.log('Login failed:', error.message);
    if (error.response) {
      debug.log('Response status:', error.response.status);
      debug.log('Response data:', error.response.data);
    }
    throw error;
  }
}

module.exports = {
  loginToDevice
};