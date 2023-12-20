const tryCatchAsync = require('../middleware/catchAsyncErrors');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.processPayment = tryCatchAsync(async(req,res,next)=>{
    console.log("req body: ",req.body);
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            company: "Ecommerce"
        },
    });

    res.status(200).json({
        success:true,
        client_secret: myPayment.client_secret
    });
});

exports.sendStripeApiKey = tryCatchAsync(async(req,res,next)=>{
    res.status(200).json({stripeApiKey: process.env.STRIPE_API_KEY});
});

