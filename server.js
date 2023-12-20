const app = require('./app');
const cors = require('cors');
const cloudinary = require("cloudinary");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database");


//Handeling Uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

//config

dotenv.config({path:"./config/config.env"});

//connecting to database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// Enable CORS for all routes
app.use(cors());
const port = process.env.PORT;


const server = app.listen(port,()=>{
    console.log(`server is working on http://localhost:${port}`)
})

//Unhandeled Promise Rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(()=>{
        process.exit(1); 
    })
})