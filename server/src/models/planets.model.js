// the csv parser takes advantage of the node stream api by reading big files as chunks of data to prevent memory spikes and keep cpu utilization stable by coonecting the reading stream through a pipe
const fs = require('fs');
const path = require('path');

const { rejects } = require('assert');
const {parse} = require('csv-parse');
const { resolve } = require('dns');

const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6;
}

function loadPlanetData () {
    //the event emitter
    return new Promise((resolve,reject) => {fs.createReadStream(path.join(__dirname,'..','..','data', 'kepler_data.csv'))
    // Why we need to pipe ?
    // calling parsing method iimediately, the stream won't delivered any data yet. Streams emit data asynchronously in chunks over time, so piping connects the flow directly to the parser so it can consume each part it arrives.
    // trying to parse immediately would just pass an empty buffer
        .pipe(parse({
            comment:'#',
            columns:true,
        }))
        //The .on() method is used to listen for specific events emitted by the stream. You use it to handle the parsed data chunk by chunk, catch any errors that occur during processing, or know when the entire file has been successfully read. Next, you could set up an event listener to log every finished object so you can verify the output in real time.
        .on('data', (data) => {
            if(isHabitablePlanet(data)) {
                habitablePlanets.push(data);
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('end', () => {
            console.log('done', `${habitablePlanets.length} habitable planets found`);
            resolve();
        })
    });
}

function getAllPlanets() {
    return habitablePlanets;
}

module.exports = {
    loadPlanetData,
    getAllPlanets,
};
