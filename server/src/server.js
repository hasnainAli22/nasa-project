const http = require("http");
const path = require("path");
const mongoose = require("mongoose")
require('dotenv').config()

const app = require("./app");
const {getPlanetData} = require("./models/planets.model.js");
const {getLaunchesData} = require('./models/launches.model.js');

const PORT = process.env.PORT || 8000
const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once("open",()=>{
    console.log("MongoDB connection is Ready!");
});
mongoose.connection.on("error",(err)=>{
    console.error(err);
})
const server = http.createServer(app);

const startServer = async()=>{
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    await getPlanetData();
    await getLaunchesData();
    server.listen(PORT , ()=>{
        console.log(`Server is listenin on Port ${PORT}`)
    });
}
startServer();


 