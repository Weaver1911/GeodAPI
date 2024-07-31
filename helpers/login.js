const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * Function to perform login using Puppeteer.
 * @param {string} ipAddress - The IP address of the device.
 * @param {string} password - The password to inject into the login screen.
 * @returns {Promise<void>}
 */
async function loginToDevice(ipAddress, password) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://${ipAddress}`, { waitUntil: 'networkidle2' });

  // Check if we need to log in
  if (await page.$('input[type="password"]')) {
    console.log('Connecting to device...');
    await page.type('input[type="password"]', password);

    // Find and click the login button
    await page.evaluate(() => {
      document.querySelector('button[onclick="login()"]').click();
    });

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Save cookies after logging in
    await saveCookies(page);
    console.log('Connection established.');
    return true;
  } else {
    console.log('Already logged in.');
    return true;
  }

  await browser.close();
}

/**
 * Function to save cookies to a file.
 * @param {object} page - The Puppeteer page instance.
 * @returns {Promise<void>}
 */
async function saveCookies(page) {
  const cookies = await page.cookies();
  await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
}

/**
 * Function to load cookies from a file.
 * @param {object} page - The Puppeteer page instance.
 * @returns {Promise<void>}
 */
async function loadCookies(page) {
  try {
    const cookiesString = await fs.readFile('./cookies.json');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
  } catch (error) {
    console.error('Error loading cookies:', error);
  }
}

module.exports = {
  loginToDevice,
  saveCookies,
  loadCookies,
};
