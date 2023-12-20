
const ErrorHandler = require("../utils/errorhandeler");
const tryCatchAsync = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticateUser = tryCatchAsync(async(req,res,next)=>{
    const {token} = req.cookies;
    
    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401));
    }
    const decodedData = jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decodedData.id); //storing user detail{_id,name,email,username,role...etc.} into req.user

    next();
})

exports.authorizeRole = (...role)=>{
    return (req,res,next)=>{
        if(!role.includes(req.user.role)){ //req.user is here from stored user details in isAuthenticateUser. while authenticating user we are storing user details
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403));
        }

        next();
    }
}