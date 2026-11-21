const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');

require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'), // server/.env
  quiet: true,
});

// Needed because of MongoDB DNS restrictions in Syria
dns.setServers(['1.1.1.1', '8.8.8.8']);

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};