const { exec } = require('child_process');
const ping = require('ping');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const express = require('express');
const dotenv = require('dotenv');
const { parseHtmlTables } = require('./helpers/scraper');  // Import the parseHtmlTables function
const { loginToDevice, loadCookies } = require('./helpers/login'); // Import login functions
const { pingIpRange, getIpAddress } = require('./helpers/Discover'); // Import device discovery functions

dotenv.config();

let ipAddress = '';
let loggedIn = false;

/**
 * Function to get data from the device and return as JSON.
 * @param {object} page - The Puppeteer page instance.
 * @returns {Promise<object>} - The parsed table data.
 */
async function getDataFromDevice(page) {
  await loadCookies(page);
  await page.goto(`http://${ipAddress}`, { waitUntil: 'networkidle2' });

  const tableData = await parseHtmlTables(page);
  return tableData;
}

// Create an Express web server
const app = express();
const port = process.env.PORT || 3000; // Use PORT environment variable or default to 3000

// Add a route for the /api endpoint
app.get('/api', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const tableData = await getDataFromDevice(page);
    
    await browser.close();
    res.json(tableData);
  } catch (error) {
    console.error('Error: Possibly CONNECTION-RESET');
    res.status(500).send('Error retrieving data. Offline?');
  }
});

// Start the server and perform the device discovery and login
app.listen(port, async () => {
  console.log(`Callisto Server is running at http://localhost:${port}/api`);

  try {
    console.log('Initializing network...');

    // Attempt to find IP address using MAC address
    try {
      ipAddress = await getIpAddress(process.env.MAC_ADDRESS);
    } catch (err) {
      // If MAC address lookup fails, run ping method and retry
      console.log('Executing ping...');
      const baseIp = process.env.BASE_IP;
      await pingIpRange(baseIp, 1, 254);
      ipAddress = await getIpAddress(process.env.MAC_ADDRESS, false);
      if (!ipAddress) {
        throw new Error(`Station [${process.env.MAC_ADDRESS}] not found after scanning your network.`);
      }
    }
    
    loggedIn = await loginToDevice(ipAddress, process.env.PASSWORD);
    if (loggedIn) {
      console.log('Ready to serve requests!');
    }
  } catch (error) {
    console.error('Error during startup:', error);
  }
});