const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']); // Had to do this because of Mongo DB restrictions on Syria

require('dotenv').config();

const http = require("http");

const mongoose = require("mongoose");

const app = require("./app");

const { loadPlanetData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  // we load the planets each time the server runs, so they can be available
    await loadPlanetData();
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });   
}

startServer();

// common node pattern
