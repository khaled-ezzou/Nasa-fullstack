// the csv parser takes advantage of the node stream api by reading big files as chunks of data to prevent memory spikes and keep cpu utilization stable by coonecting the reading stream through a pipe
const fs = require('fs');
const path = require('path');

const {parse} = require('csv-parse');

const planets = require('./planets.mongo');

// const habitablePlanets = []; we removed it to use our Mongo DB

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6;
}

function loadPlanetData () {
    //the event emitter
    return new Promise((resolve,reject) => {fs.createReadStream(path.join(__dirname,'..','..','data', 'kepler_data.csv'))
    // Why we need to pipe ?
    // calling parsing method iimediately, the stream won't delivere any data yet. Streams emit data asynchronously in chunks over time, so piping connects the flow directly to the parser so it can consume each part it arrives.
    // trying to parse immediately would just pass an empty buffer
        .pipe(parse({
            comment:'#',
            columns:true,
        }))
        //The .on() method is used to listen for specific events emitted by the stream. You use it to handle the parsed data chunk by chunk, catch any errors that occur during processing, or know when the entire file has been successfully read. Next, you could set up an event listener to log every finished object so you can verify the output in real time.
        .on('data', async (data) => {
            if(isHabitablePlanet(data)) {
                // habitablePlanets.push(data); // instead we'll push into Mongo
                // TODO: Replace below create with insert + update = upsert // to prevent calling loadData multiple times if we run multiple instances of the server and only updates if there's any thing new
                // await planets.create({
                //     keplerName: data.kepler_name, // kepler_name matches column name in our csv data
                // });

                // new version abstraction in savePlanet function
                savePlanet(data);
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', async () => {
            const countPlanetsFound = (await getAllPlanets()).length;
            // console.log('done', `${habitablePlanets.length} habitable planets found`); // old
            console.log('done', `${countPlanetsFound} habitable planets found`); // new
            resolve();
        })
    });
}

// because of mongoose it's async
async function getAllPlanets() {
    // return habitablePlanets; before mongo
    return await planets.find({}, { // TODO: notice here 
        '_id': 0, '__v': 0, // fields to exclude that come from the database, setting them to 1 will include them.
    });
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({ // TODO: notice here 
            keplerName: planet.kepler_name, // query filter as first argument
        }, {
            keplerName: planet.kepler_name, // object to insert if elements don't exist in document in first argument  
        }, {
            upsert: true, // now our planets will be added if they don't exist already.
    });
    } catch (err) {
        console.error(`Could not save planet ${err}`);
    }
}

module.exports = {
    loadPlanetData,
    getAllPlanets,
};
