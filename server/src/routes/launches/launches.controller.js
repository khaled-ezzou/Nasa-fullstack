const { getAllLaunches, addNewLaunch, existsLaunchWithId, abortLaunchById } = require('../../models/launches.model');

function httpGetAllLaunches(req, res) {
    return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
    const launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: 'Missing required launch property',
        })
    }
    // same date that is a string is turned into a date object
    launch.launchDate = new Date(launch.launchDate);
    // isNaN calls date.valueOf() to convert date into a number so if the date is valid we get false 
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch Date',
        })
    }

    addNewLaunch(launch);
    return res.status(201).json(launch);
}

function httpAbortLaunch (req, res) {
    const launchId = +req.params.id;

    if (!existsLaunchWithId(launchId)) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }

    const aborted = abortLaunchById(launchId);
    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}
