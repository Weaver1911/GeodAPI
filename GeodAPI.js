const express = require('express');
const dotenv = require('dotenv');
const { pingAddress, pingIpRange, getIpAddress } = require('./Utils/networkUtils');
const dataStructure = require('./helpers/dataStructure');
const debug = require('./Utils/DebugUtils');
const { loginToDevice } = require('./helpers/login');
const { fetchDeviceData } = require('./helpers/scraper_v2');

dotenv.config();

let ipAddress = '';
let loggedIn = false;
let axiosInstance;

async function checkDeviceStatus() {
  if (!axiosInstance) {
    debug.log('Device not initialized');
    return;
  }
  try {
    const result = await fetchDeviceData(axiosInstance);
    debug.log('Device data:', result);
  } catch (error) {
    debug.log('Error in checkDeviceStatus:', error);
    if (ipAddress) {
      const isOnline = await pingAddress(ipAddress);
      if (isOnline) {
        debug.log('Error retrieving data. But station seems to be online!');
      } else {
        debug.log('Error retrieving data. Station appears to be offline.');
      }
    }
  }
}

// Create an Express web server
const app = express();
const port = process.env.PORT || 3000;

// Add a route for the /api endpoint
app.get('/api', async (req, res) => {
  try {
    if (!axiosInstance) {
      throw new Error('Device not initialized');
    }
    const result = await fetchDeviceData(axiosInstance);
    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    const errorData = JSON.parse(JSON.stringify(dataStructure));
    
    const isAlive = await pingAddress(ipAddress);
    
    errorData.Station.Exception["Exception Code"] = error.response ? error.response.status.toString() : "Unknown";
    errorData.Station.Exception["Exception Description"] = error.message || "Unknown Error occurred";
    errorData.Station.Exception.Alive = isAlive ? "Yes" : "No";
    
    res.status(error.response ? error.response.status : 500).json(errorData);
  }
});

// Start the server and perform the device discovery and login
app.listen(port, async () => {
  console.log(`Callisto Server is running at http://localhost:${port}/api`);
  debug.log('Debug mode is enabled');

  try {
    console.log('Initializing network...');
    try {
      ipAddress = await getIpAddress(process.env.MAC_ADDRESS);
    } catch (err) {
      console.log('Executing ping...');
      const baseIp = process.env.BASE_IP;
      await pingIpRange(baseIp, 1, 254);
      ipAddress = await getIpAddress(process.env.MAC_ADDRESS, false);
      if (!ipAddress) {
        throw new Error(`Station [${process.env.MAC_ADDRESS}] not found after scanning your network.`);
      }
    }
    
    axiosInstance = await loginToDevice(ipAddress, process.env.MINER_KEY);
    console.log('Ready to serve requests!');
  } catch (error) {
    console.error('Error during startup:', error);
  }
});

process.on('SIGINT', async () => {
  debug.log('Shutting down...');
  process.exit();
});
// Enable or disable debug mode based on environment variable
debug.setDebugMode(process.env.DEBUG_MODE === 'true');