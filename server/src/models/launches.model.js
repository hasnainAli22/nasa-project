const axios = require('axios');
const launchesDB = require("./launches.mongo.js");
const planets = require("./planets.mongo.js");

const DEFAULT_LAUNCH_NUMBER= 100;

const launches = new Map();

let latestFlightNumber = 100;
const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date("15 June, 2030"),
    target: 'Kepler-442 b',
    customer: ["NASA", "SpaceX"],
    upcoming: true,
    success: true,
}

launches.set(launch.flightNumber, launch);
saveLaunch(launch)
async function saveLaunch(launch){
    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true,
    });
    launchesDB.findOneAndUpdate();
}
const SpaceX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
async function populateLaunches(){
    const response =await axios.post(SpaceX_API_URL, {
        "query": {},
        "options": {
            "pagination":false,
            populate:[
                {
                    path:'rocket',
                    select:{
                        name:true,
                    }
                },
                {
                    path:'payloads',
                    select: {
                        customers : 1
                    }
                }
            ]
        },
    })
    const launchesDocs = response.data.docs;
    for(const launchDoc of launchesDocs){
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload)=>{
            return payload['customers']
        });
        // const energy = {'hello': 'there'}
        const newLaunch = {
            "flightNumber":  launchDoc['flight_number'],
            "mission":  launchDoc['name'],
            "rocket": launchDoc['rocket']['name'],
            "launchDate": launchDoc['date_local'],
            "target": '',
            "customer": customers,
            "upcoming": launchDoc['upcoming'],
            "success": launchDoc['success'],
        }
        console.log(newLaunch.flightNumber,' ',newLaunch.mission);
        saveLaunch(newLaunch);
        
    }
}
async function getLaunchesData(){
    const firstLaunch =await findLaunch({
        mission:'FalconSat',
        flight_number:1,
        rocket:'Falcon 1'
    });
    if(firstLaunch){
        console.log("Launches already exists");
    }else{
        console.log("Downloading the Launches");
        await populateLaunches()
    }
    

}
async function getAllLaunches(skip, limit) {
    return await launchesDB
        .find({},{
            "_id":0, 
            "__v":0
        })
        .sort({flightNumber: 1})
        .skip(skip)
        .limit(limit);
}
async function findLaunch(filter){
    return await launchesDB.findOne(filter)
}
const isLaunchExists = async (id) => {
    // return launches.has(id);
    // return await launchesDB.findOne({flightNumber: id});
    return await findLaunch({flightNumber: id})

}
// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(latestFlightNumber,
//         {
//             ...launch,
//             upcoming: true,
//             success: true,
//             customer: ["NASA", "SpaceX"]
//         });
// }
async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target
    });
    if(!planet){
        throw new Error("Planet Not Found");
    }
    const latestFlightNumber = await getLatestLaunch() + 1;
    // const newLaunch = {
    //     ...launch, 
    //     upcoming:true,
    //     success: true,
    //     customer: ["NASA", "SpaceX"],
    //     flightNumber: latestFlightNumber,
    
    // }
    const newLaunch =Object.assign(launch,{
        upcoming:true,
        success: true,
        customer: ["NASA", "SpaceX"],
        flightNumber: latestFlightNumber,
    });
    await saveLaunch(newLaunch)
    // return await newLaunch;
}
async function abortLaunchById(launchId) {

    const abortedLaunch = await launchesDB.updateOne({flightNumber: launchId},{upcoming:false, success:false})
    return abortedLaunch.modifiedCount === 1;
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
}
async function getLatestLaunch(){
    const latestLaunch =await launchesDB.findOne().sort("-flightNumber");
    if(!latestLaunch){
        return DEFAULT_LAUNCH_NUMBER;
    }
    return latestLaunch.flightNumber;
}
module.exports = {
    getLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    isLaunchExists,
    abortLaunchById,
}