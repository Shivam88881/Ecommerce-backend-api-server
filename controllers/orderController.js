const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandeler");
const tryCatchAsync = require("../middleware/catchAsyncErrors");

//Create new Order

exports.newOrder = tryCatchAsync(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  

  const orderItemsModel = orderItems.map((item)=>{
    return {
      product:item.id,
      name: item.name,
      price: item.price,
      image: item.image.url,
      quantity: item.quantity
    }
  })

  const order = await Order.create({
    shippingInfo:shippingInfo,
    orderItems:orderItemsModel,
    paymentInfo:paymentInfo,
    itemsPrice:itemsPrice,
    taxPrice:taxPrice,
    shippingPrice:shippingPrice,
    totalPrice:totalPrice,
    paidAt:Date.now(),
    user: req.user.id,
  })

  res.status(201).json({
    success:true,
    order
  })
});

//Get Order Details

exports.getOrderDetails = tryCatchAsync(async(req,res,next)=>{
  const order = await Order.findById(req.params.id).populate("user","name email");
  /* here .populate() will do following....
  in schema od order we have given user=userId, so from populate it will go to user collection and will get name and email from there
  */

  if(!order){
    return next(new ErrorHandler(`No product with id=${req.params.id}`,400))
  }

  res.status(200).json({
    success:true,
    order
  })
});


//Get My Order Details

exports.getMyOrderDetails = tryCatchAsync(async(req,res,next)=>{
  const order = await Order.findById(req.params.id);

  if(!order){
    return next(new ErrorHandler(`No product with id=${req.params.id}`,400))
  }

  if(order.user.toString() !== req.user.id){
    return next(new ErrorHandler(`You are not authorise to see this order`,400))
  }

  res.status(200).json({
    success:true,
    order
  })
});

// Get order details --(logged in user)

exports.getAllOrderDetails = tryCatchAsync(async(req,res,next)=>{
  const orders = await Order.find({user:req.user.id});

  res.status(200).json({
    success:true,
    orders
  })
});


// Get all order --(admin)

exports.getAllOrders = tryCatchAsync(async(req,res,next)=>{
  const orders = await Order.find();

  var totalAmount =0;
  orders.forEach((order)=>{
    totalAmount+=order.totalPrice;
  })

  res.status(200).json({
    success:true,
    orders,
    totalAmount
  })
});


// Update order --(admin)

exports.updateOrder = tryCatchAsync(async(req,res,next)=>{
  const order = await Order.findById(req.params.id);

  if(!order){
    return next(new ErrorHandler(`No product with id=${req.params.id}`,400))
  }

  if(order.orderStatus === "Delivered"){
    return next(new ErrorHandler(`This order is already delivered`,400))
  }
  
  order.orderStatus = req.body.status;
  if(req.body.status === "Delivered"){
    order.deliveredAt = Date.now();
    order.orderItems.forEach(async (item)=>{
      await updateStock(item.product.toString(),item.quantity);

    })
  }

  await order.save({validateBeforeSave: false});

  res.status(200).json({
    success:true,
    message:"Order updated"
  })
});

//Function to update product stock

async function updateStock(id,quantity){
  const product = await Product.findById(id);

  if(!product){
    return new ErrorHandler(`No product with id=${id}`,400)
  }

  product.stock -= quantity;

  await product.save({validateBeforeSave: false})

}


// Delete order --(admin)

exports.deleteOrder = tryCatchAsync(async(req,res,next)=>{
  const order = await Order.findById({_id:req.params.id});

  if(!order){
    return next(new ErrorHandler(`No product with id=${req.params.id}`,400))
  }

  console.log(order);

  await Order.findByIdAndDelete({_id:req.params.id});

  res.status(200).json({
    success:true,
    message:"Order Deleted"
  })
});



