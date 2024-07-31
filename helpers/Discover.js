const { exec } = require('child_process');
const ping = require('ping');

/**
 * Function to ping a range of IP addresses.
 * @param {string} baseIp - The base IP to ping.
 * @param {number} start - The starting number for the IP range.
 * @param {number} end - The ending number for the IP range.
 * @returns {Promise<number>} - Resolves with the number of devices found.
 */
async function pingIpRange(baseIp, start, end) {
  console.log('Discovering devices...');
  const pingPromises = [];
  for (let i = start; i <= end; i++) {
    const ip = `${baseIp}.${i}`;
    pingPromises.push(ping.promise.probe(ip));
  }
  const results = await Promise.all(pingPromises);
  const activeDevices = results.filter(result => result.alive).length;
  console.log(`${activeDevices} connected devices found.`);
  return activeDevices;
}

/**
 * Function to get the IP address from a given MAC address.
 * @param {string} macAddress - The MAC address to find the IP for.
 * @param {boolean} [firstTry=true] - Indicates if this is the first attempt.
 * @returns {Promise<string>} - Resolves with the IP address.
 */
async function getIpAddress(macAddress, firstTry = true) {
  return new Promise((resolve, reject) => {
    exec('arp -a', (error, stdout, stderr) => {
      if (error) {
        return reject(`exec error: ${error}`);
      }
      if (stderr) {
        return reject(`stderr: ${stderr}`);
      }

      if (firstTry) {
        console.log(`Searching for station [${macAddress.toUpperCase()}]...`);
      }

      const arpEntries = stdout.split('\n');
      for (let entry of arpEntries) {
        const columns = entry.split(/\s+/);
        if (columns.includes(macAddress)) {
          console.log(`Station [${macAddress.toUpperCase()}] has been located...`);
          const ipAddress = columns[1].replace(/[()]/g, '');
          console.log(`Station IP Address is [${ipAddress}]`);
          return resolve(ipAddress);
        }
      }

      if (firstTry) {
        console.log(`Station [${macAddress.toUpperCase()}] not found... (yet)`);
      }
      return reject(`MAC Address [${macAddress.toUpperCase()}] not found in ARP table.`);
    });
  });
}

module.exports = {
  pingIpRange,
  getIpAddress,
};
