# GeodAPI

GeodAPI is a Node.js application that discovers your station on the network, retrieves data from the device, and serves the data through an API endpoint.

## Table of Contents

- Installation

- Configuration

- Usage

- Project Structure

- Endpoints

 
## Prerequisites

- Node.js (v12 or higher)

- npm (Node Package Manager)

- A Geodnet Station

## Installation

1\. Clone OR download the repository:

```bash

   git clone https://github.com/yourusername/GeodAPI.git

   cd GeodAPI

```

2\. Install the dependencies:

```bash

   npm install

```

## Configuration

Create a `.env` file (if not exist) in the root of your project and add the following environment variables:

```env

MAC_ADDRESS=Your_Station_MAC_Address
PASSWORD=Your_Station_Key
BASE_IP=Your_Network_IP
PORT=3000

```

- `PORT`: The port number on which the Express server will run (default: 3000).

- `MAC_ADDRESS`: The MAC address of the Station.

- `BASE_IP`: The base IP (the first 3 segments) of your network (e.g., `192.168.1`).

- `PASSWORD`: The password used to log into the station.

## Usage

***
⚠Before you start the server⚠  

This is a testing tool and never meant to be used in public networks.

Please be advise. I do NOT recomend to open ports (port forward) this project at the moment.

Sensitive data may be leak.
***

To start the server, run the following command:

```bash

node GeodAPI.js

```

You should see the following output if the server starts successfully:

```bash

Callisto Server is running at http://localhost:3000/api
.
.
.
.
.
.
Connection established.
Ready to serve requests!

```

## Project Structure

- `helpers/Discover.js`: Contains functions for discovering devices on the network.

- `helpers/login.js`: Contains functions for logging into the device and managing cookies.

- `helpers/scraper.js`: Contains functions for scraping data from the device.

- `GeodAPI.js`: The main entry point of the application.

- `package.json`: Lists dependencies and scripts.

- `.env`: Contains environment variables.

- `README.md`: Documentation file.

## Endpoints

### GET /api

This endpoint attempts to discover the device, log in, retrieve data, and return it as JSON.

**Response**

- `200 OK`: Returns the scraped data from the device.

- `500 Internal Server Error`: Returns an error message if there was an issue retrieving the data.

**Example**

```bash

http://localhost:3000/api

```

**Response**

```json

{
    "Network Latency": "Uknown",
    "Local Network Status": "ONLINE",
    "Local Network Address": "192.168.1.28",
    "NTRIP Server Status": "TRANSMITTING",
    "Miner": "MINING",
    "Work Mode": "BASESTATION",
    "UTC Time": "2024-08-01 07:33:57",
    "UP Time": "4.03(days)",
    "Boot Type": "SW",
    "Power": "Power supply is good",
    "WiFi Signal": "-43 dbm",
    "Wifi Quality": "Signal is strong",
    "Wifi Latency": "Latency is low",
    "Firmware Version": "MGW200_V1.3.6",
    "Hardware Version": "hw_v1.0",
    "Activated Module": "GNSS+",
    "Serial Number": "***1CFA5"
}

```

## Notes

- Ensure the device is online and accessible on the network.

- Adjust the IP range in the `.env` file if necessary to match your network configuration.

- The `helpers/` directory contains modular code for specific tasks such as device discovery, login, and data scraping.

## License

This project is licensed under GNU GENERAL PUBLIC LICENSE.

---
