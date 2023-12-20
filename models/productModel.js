const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please Enter product description"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter product price"],
        maxLength: [8,"Price cannot exceed 9 character"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[{
        public_id:{
            type:String,
            requireed:true
        },
        url:{
            type:String,
            requireed:true
        }
    }],
    category:{
        type:String,
        required:[true,"Please enter category"],
    },
    stock:{
        type:Number,
        required:[true,"Please enter product Stock"],
        maxLength:[5,"Stock can not excedd 5 character"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {   user:{
                type:mongoose.Schema.ObjectId,
                ref: "User",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref: "User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("Product",productSchema);