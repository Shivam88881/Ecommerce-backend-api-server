const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandeler");
const tryCatchAsync = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require('cloudinary');

//create Product ---Admin

exports.createProduct = tryCatchAsync(async (req, res, next) => {
  let images=[];
  if(typeof(req.body.images)==="string"){
    images.push(req.body.images)
  }else if(typeof(req.body.images)!=="undefined"){
    images = req.body.images;
  }
  const imagesLink=[];

  for(let i=0;i<images.length;i++){
    const result = await cloudinary.v2.uploader.upload(images[i],{
      folder: "products",
    });
    imagesLink.push({
      public_id:result.public_id,
      url:result.secure_url
    })
  }

  req.body.images = imagesLink;
  req.body.user = req.user.id // in ProductRoute before calling createProduct we are calling isAuthenticateUser where we are storing user detail while logging in into req.user

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//GET All Products

exports.getAllProducts = tryCatchAsync(async (req, res) => {
  const resultPerPage =12;
  const apifeatures = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
  const products = await apifeatures.query;
  const productCount = await Product.find(apifeatures.query._conditions).countDocuments();
  res.status(200).json({
    success: true,
    products,
    productCount,
    resultPerPage
  });

});

//Get All Products --Admin

exports.getAllProductsAdmin = tryCatchAsync(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products
  });

});

//Get Product Detail

exports.getProductDetail = tryCatchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  res.status(200).json({
    success: true,
    product,
  });
});

//Update Product --Admin

exports.updateProduct = tryCatchAsync(async (req, res, next) => {
  let images=[];
  if(typeof(req.body.images)==="string"){
    images.push(req.body.images)
  }else if(typeof(req.body.images)!=="undefined"){
    images = req.body.images;
  }
  const imagesLink=[];
  for(let i=0;i<images.length;i++){
    const result = await cloudinary.v2.uploader.upload(images[i],{
      folder: "products",
    });
    imagesLink.push({
      public_id:result.public_id,
      url:result.secure_url
    })
  }
  let productDetails = {
    name:req.body.name,
    price:req.body.price,
    description:req.body.description,
    category:req.body.category,
    stock:req.body.stock
  }
  let product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  
  if(imagesLink.length !==0){
    productDetails = {...productDetails,images:imagesLink}
  }else{
    productDetails = {...productDetails,images:product.images}
  }
  // console.log(productDetails)
  product.images.map(async(image)=>{
    await cloudinary.v2.uploader.destroy(image.public_id);
  })
  product = await Product.findByIdAndUpdate(req.params.id, productDetails, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

//Delete Product --Admin

exports.deleteProduct = tryCatchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product deled successfully",
  });
});

// Create new review or update review

exports.reviewProduct = tryCatchAsync(async(req,res,next) =>{
  const product = await Product.findById(req.body.productId);
  var isReviewed = 0;
  var oldRating =0;
  product.reviews.forEach((rev)=>{
    if(rev.user.toString()===req.user.id){
      rev.name = req.user.name,
      oldRating = rev.rating;
      rev.rating = Number(req.body.rating),
      rev.comment =req.body.comment
      isReviewed = 1;
    }
  })

  if(isReviewed===0){
    const review = {
      user:req.user.id,
      name:req.user.name,
      rating: Number(req.body.rating),
      comment:req.body.comment
    };
    product.reviews.push(review);
    product.numOfReviews = product.numOfReviews+1;
  }

  
  product.ratings = isReviewed === 0 ? ((product.numOfReviews-1)*product.ratings+Number(req.body.rating))/product.numOfReviews : (product.numOfReviews*product.ratings+Number(req.body.rating)-oldRating)/product.numOfReviews;

  await product.save({validateBeforeSave:false});

  res.status(200).json({
    success:true,
    message:"review saved"
  });
});

// Get product review

exports.getProductReview = tryCatchAsync(async(req,res,next) =>{
  const product = await Product.findById(req.params.id);

  if(!product){
    return next(new ErrorHandler(`No product found with id=${req.query.id}`,400));
  }

  res.status(200).json({
    success:true,
    reviews: product.reviews
  });
});


// Delete Review

exports.deleteReview = tryCatchAsync(async(req,res,next) =>{
  const productId = req.query.productId;
  const reviewId = req.params.id;

  const product = await Product.findById(productId);
  
  if(!product){
    return next(new ErrorHandler(`No product found with id=${productId}`,400))
  }

  var deletedRating =0;
  const reviews = product.reviews.filter((rev) => {
    if (rev._id.toString() === reviewId.toString()) {
      deletedRating = rev.rating;
      return false;
    }
    return true;
  });
  const ratings =0;
  if(product.numOfReviews !==1){
    ratings = (product.ratings*product.numOfReviews-deletedRating)/(product.numOfReviews-1);
  }

  product.ratings = ratings;
  product.reviews = reviews;
  product.numOfReviews = product.numOfReviews-1;
  await product.save({validateBeforeSave:false});

  res.status(200).json({
    success:true,
    message:"review deleted"
  });
});