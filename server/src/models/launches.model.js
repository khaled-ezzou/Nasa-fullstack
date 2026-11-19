const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

//let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['SYR', 'NASA'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

async function existsLaunchWithId(launchId) { // returns a boolean
    return await launchesDatabase.findOne({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber'); // the minus - maes order desc

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches () {
    return await launchesDatabase
        .find({}, { '_id': 0, '__v': 0 });
}

async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet) {
        throw new Error('No matching planet found')
    }

    await launchesDatabase.findOneAndUpdate({ // we replaced .updateOne with .findOneAndUpdate it only returns properties that we set in our update, to get rid of setOnInsert property in the body of our request to give less info about what database we're using in order to not get hacked. 
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    }); 
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() +1; 

    const newLaunch = Object.assign(launch, { // here
        success : true,
        upcoming: true,
        customers: ['Syrian Arab Republic', 'NASA'],
        flightNumber: newFlightNumber,  
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1;
    // const aborted = launches.get(launchId); // returns the object from the map which is the launch
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
}