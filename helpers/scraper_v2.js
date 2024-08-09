const dataStructure = require('./dataStructure');
const debug = require('../Utils/DebugUtils');
const { formatLocalTime } = require('../Utils/scraperUtils');


async function fetchDeviceData(axiosInstance) {
  try {
    const response = await axiosInstance.get('/devStatus');
    debug.log('Raw response data:', JSON.stringify(response.data, null, 2));
    return parseDeviceData(response.data);
  } catch (error) {
    debug.log('Error fetching device data:', error.message);
    throw error;
  }
}

function parseDeviceData(rawData) {
  const data = JSON.parse(JSON.stringify(dataStructure));

  // Map raw data to data structure
  data.Station = {
    ...data.Station,
    "Network Latency": rawData.netLatency || "",
    "Local Network Status": rawData.localIP ? rawData.localIP.split(',')[0] : "",
    "Local Network Address": rawData.localIP ? rawData.localIP.split(',')[1] : "",
    "NTRIP Server Status": rawData.nsStatus || "",
    "Miner": rawData.minerStatus || "",
    "Work Mode": rawData.workMode || "",
    "UTC Time": rawData.ts || "",
    "Local Time": formatLocalTime(),
    "UP Time": rawData.uptime || "",
    "Boot Type": rawData.bootType || "",
    "WiFi Signal": rawData.wifiStrength || "",
    "Firmware Version": rawData.fwVer || "",
    "Hardware Version": rawData.hwVer || "",
    "Serial Number": rawData.sn || ""
  };

  // Parse health information
  if (rawData.health) {
    const [power, wifiQuality, wifiLatency] = rawData.health.split(/;\s|,\s/).map(item => item.trim().replace(/\.$/, ''));
    data.Station["Power"] = power || "";
    data.Station["Wifi Quality"] = wifiQuality || "";
    data.Station["Wifi Latency"] = wifiLatency || "";
  }

  /** ToDo: Add SWC and Weather data
  if (rawData.swc) {
    data.SWC = { ...data.SWC, ...rawData.swc };
  }
  if (rawData.weather) {
    data.Weather = { ...data.Weather, ...rawData.weather };
  }
  */


  return data;
}

module.exports = {
  fetchDeviceData
};