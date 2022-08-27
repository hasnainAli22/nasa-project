const {
    getAllLaunches,
    scheduleNewLaunch,
    isLaunchExists,
    abortLaunchById,
} = require("../../models/launches.model.js");
const {getPagination} = require('../../service/query.js');
const httpGetAllLaunches = async(req, res) => {
    const {skip, limit} = getPagination(req.query);
    const launches = await getAllLaunches(skip,limit);
    return res.status(200).json(launches)
}
const httpAddNewLaunch = async (req, res) => {
    const launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: "Required Properties are missing!"
        })
    }
    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Request Made with invalid Date"
        })
    }
    await scheduleNewLaunch(launch);
    return res.status(200).json(launch);
}
const httpAbortLaunch = async (req, res) => {
    const abortId = +req.params.id;
    // IF launch not exists
    const existedLaunch = await isLaunchExists(abortId);
    if (!existedLaunch) {
        res.status(404).json({
            error: "Launch Not found"
        })
    }
    // If launch exists
    const aborted = await abortLaunchById(abortId);
    if(!aborted){
        return res.status(400).json({
            error: "Launch Not aborted!"
        })
    }
    return res.status(200).json({
        status: "Ok"
    })
}
module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}