const http = require("http");

const app = require("./app");
const { mongoConnect } = require('./services/mongo');
const { loadPlanetData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  // we load the planets each time the server runs, so they can be available
    await loadPlanetData();
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });   
}

startServer();

// common node pattern
