const { JSDOM } = require('jsdom');

/**
 * Function to parse HTML tables and extract data using JSDOM.
 * @param {object} page - The Puppeteer page instance.
 * @returns {Promise<object>} - Resolves with the extracted data.
 */
async function parseHtmlTables(page) {
  const html = await page.content(); // Get the page content
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const data = {};

  // Parse Device Status table
  document.querySelectorAll('.table.table-hover:nth-of-type(1) tbody tr').forEach(row => {
    const key = row.querySelector('td:nth-of-type(1)').textContent.trim();
    let value = row.querySelector('td:nth-of-type(2)').textContent.trim();

    switch (key) {
      case 'WiFi Quality':
        // Extract WiFi Quality value from the nested <td> element first
        const wifiQualityElement = row.querySelector('td:nth-of-type(3)');
        if (wifiQualityElement) {
          const wifiQualityMatch = wifiQualityElement.textContent.match(/\((.*?)\)/);
          if (wifiQualityMatch) {
            data['WiFi Quality'] = wifiQualityMatch[1].trim();
          }
        }
        break;
      case 'Network Latency':
        data['Network Latency'] = value.replace(/\s*TEST$/, '').trim();
        break;
      case 'Local Network':
        const [status, address] = value.split(',');
        if (status) data['Local Network Status'] = status.trim();
        if (address) data['Local Network Address'] = address.trim();
        break;
      case 'Health':
        const healthParts = value.split(/\s*<br\s*\/?>\s*/i).map(part => part.trim());

        // Extract Power
        data['Power'] = healthParts[0] || '';

        // Extract WiFi Signal and WiFi Latency
        if (healthParts.length > 1) {
          const healthDetails = healthParts.slice(1).join(' ').split(',').map(part => part.trim());
          data['Wifi Signal'] = healthDetails[0] || '';
          data['Wifi Latency'] = healthDetails[1] || '';
        }
        break;
      case 'NTRIP Server Status':
        // Remove "PING" from the value
        data['NTRIP Server Status'] = value.replace(/\s*PING$/, '').trim();
        break;
      default:
        data[key] = value;
        break;
    }
  });

  // Parse Device Info table
  document.querySelectorAll('.table.table-hover:nth-of-type(2) tbody tr').forEach(row => {
    const key = row.querySelector('td:nth-of-type(1)').textContent.trim();
    const value = row.querySelector('td:nth-of-type(2)').textContent.trim();

    // Avoid overwriting keys if they already exist in the data
    if (key && !data[key]) data[key] = value;
  });

  // Additional processing for the Health field
  if (data['Power']) {
    // Extract Power, Wifi Signal, and Wifi Latency
    const parts = data['Power'].split(/\.\s*/);
    data['Power'] = (parts[0] || '').trim();
    if (parts.length > 1) {
      const signalAndLatency = parts[1].split(',').map(part => part.trim());
      data['Wifi Signal'] = signalAndLatency[0].replace(/WiFi signal strength is\s*/, 'Signal is ').trim();
      data['Wifi Latency'] = signalAndLatency[1] ? signalAndLatency[1].replace(/network latency is\s*/, 'Latency is ').trim() : '';
    }
  }

  // Rearrange the JSON data

  const rearrangedData = {
    "Network Latency": data["Network Latency"] || "",
    "Local Network Status": data["Local Network Status"] || "",
    "Local Network Address": data["Local Network Address"] || "",
    "NTRIP Server Status": data["NTRIP Server Status"] || "",
    "Miner": data["Miner"] || "",
    "Work Mode": data["Work Mode"] || "",
    "UTC Time": data["UTC Time"] || "",
    "UP Time": data["UP Time"] || "",
    "Boot Type": data["Boot Type"] || "",
    "Power": data["Power"] || "",
    "WiFi Signal": data["WiFi Quality"] || "",
    "Wifi Quality": data["Wifi Signal"] || "",
    "Wifi Latency": data["Wifi Latency"] || "",
    "Firmware Version": data["Firmware Version"] || "",
    "Hardware Version": data["Hardware Version"] || "",
    "Activated Module": data["Activated Module"] || "",
    "Serial Number": data["Serial Number"] || "",
    "Kpi": "N/A",
    "Alert": "N/A",
    "Wind Speed": "N/A",
    "Wind Gust": "N/A",
    "Wind Direction": "N/A",
    "Local Time": "N/A"
  };

  return rearrangedData;
}

// Export the function
module.exports = {
  parseHtmlTables
};
