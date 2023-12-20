const ErrorHandler = require("../utils/errorhandeler"); 

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong request error
    if(err.name === "CastError"){
        const message =`Resource not found. Invalid: ${err.path}`;
        err= new ErrorHandler(message,400);
    }

    //Mongoose duplecate key error

    if(err.code === 11000){
        const message =`Duplicate ${Object.keys(err.keyValue)} Entered`;
        err= new ErrorHandler(message,400);
    }

    //Wrong JWT error

    if(err.name === "JsonwebTokenError"){
        const message =`Json web Token is invalid, try again`;
        err= new ErrorHandler(message,400);
    }

    //JWT EXPIRE ERROR

    if(err.name === "TokenExpiredError"){
        const message =`Json web Token has been expired, try again`;
        err= new ErrorHandler(message,400);
    }


    res.status(err.statusCode).json({
        success:false,
        message:err.message
    });
}