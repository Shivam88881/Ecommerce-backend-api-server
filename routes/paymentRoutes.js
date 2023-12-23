const express = require('express');
const router = express.Router();

const {isAuthenticateUser} = require('../middleware/auth');
const { processPayment, sendStripeApiKey } = require('../controllers/paymentControllers');

router.route("/payment/process").post(isAuthenticateUser,processPayment);
router.route("/stripe-api-key").get(isAuthenticateUser,sendStripeApiKey);

module.exports = router;