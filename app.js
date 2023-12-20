const express = require("express");
const app = express();
const ErrorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); 
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cors = require('cors');


// Enable CORS for all routes
app.use(cors());
//config

dotenv.config({path:"./config/config.env"});

app.use(express.json());
//Middleware for Authentication check
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());



//Route Imports:

//Product route
const productRoute = require("./routes/productRoute");
app.use("/api/v1",productRoute);

//User route
const userRoute = require("./routes/userRoute");
app.use("/api/v1",userRoute);

//Order Route
const orderRoute = require("./routes/orderRoutes");
app.use("/api/v1",orderRoute);

//Payment Route
const paymentRoute = require("./routes/paymentRoutes");
app.use("/api/v1",paymentRoute);

//Middleware for Error
app.use(ErrorMiddleware);





module.exports = app;