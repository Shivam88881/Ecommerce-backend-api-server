const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Plese enter your name"],
        maxLength:[30,"name can not exceed 30 character"],
        minLength:[2,"name should have atlease 2 character"]
    },
    email:{
        type:String,
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"],
        required:[true,"Please enter your email"]
    },
    username:{
        type:String,
        required:[true,"Plese enter username"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Plese set your password"],
        minLength:[8,"Password should greater than 8 character"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    cart:[
        {
            productId:{
                type:mongoose.Schema.ObjectId,
                ref: "Product",
                required:true,
            },
            quantity:{
                type:Number,
                required:true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },

    resetPasswordToken:String,

    resetPasswordExpire:Date,

});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//JWT TOKEN

userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//Compare password

userSchema.methods.comparePassword = async function (enterdPassword){
    return await bcrypt.compare(enterdPassword,this.password); 
}

//Generating password Reset Token

userSchema.methods.getResetPasswordToken = async function(){
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and add to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now()+ 15*60*1000;

    return resetToken; //return token which is not hashed-- for security 
}

module.exports = mongoose.model("User",userSchema);