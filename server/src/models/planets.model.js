const {parse} = require('csv-parse');
const fs = require('fs');
const path = require("path")

const planets = require("./planets.mongo");

const habitablePlanets = [];

function getPlanetData(){
    const promise = new Promise((res, rej)=>{
      const parser = parse({
        comment: '#',
        columns: true,
      });
      function isHabitablePlanet(planet) {
        return planet['koi_disposition'] === 'CONFIRMED'
          && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
          && planet['koi_prad'] < 1.6;
      }
      fs.createReadStream(path.join(__dirname,"..","data","kepler_data.csv"))
      .pipe(parser)
      .on("data",async (data)=>{
        if(isHabitablePlanet(data)){
          savePlanet(data)
        }
      })
      .on("error",(err)=>{
        console.log(err.message);
        rej();
      })
      .on("end",async()=>{
        const countPlanetsFound = (await getAllPlanets()).length
        console.log(`Found ${countPlanetsFound} Habitable Planets`)
        res();
      })
    })
}
const getAllPlanets = async()=>{
  return await planets.find({},{
    "_id":0,"__v":0
  });
}

const savePlanet = async(planet) =>{
  try{
    await planets.updateOne({
      keplerName: planet.kepler_name
    }, {
      keplerName: planet.kepler_name,
    },{
      upsert: true
    });
  } catch(error){
    console.error(error);
  }
}

  module.exports = {
    getPlanetData,
    getAllPlanets,
  }
