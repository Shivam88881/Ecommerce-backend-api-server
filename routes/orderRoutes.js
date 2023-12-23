const express = require("express");
const { isAuthenticateUser, authorizeRole } = require("../middleware/auth");
const { newOrder, getOrderDetails, getAllOrderDetails, getAllOrders, updateOrder, deleteOrder, getMyOrderDetails } = require("../controllers/orderController");

const router = express.Router();


router.route("/order/new").post(isAuthenticateUser,newOrder);
router.route("/admin/order/:id").get(isAuthenticateUser,authorizeRole("admin"),getOrderDetails).put(isAuthenticateUser,authorizeRole("admin"),updateOrder).delete(isAuthenticateUser,authorizeRole("admin"),deleteOrder);;
router.route("/orders/all").get(isAuthenticateUser,getAllOrderDetails);
router.route("/admin/orders/all").get(isAuthenticateUser,authorizeRole("admin"),getAllOrders);
router.route("/order/:id").get(isAuthenticateUser,getMyOrderDetails);

module.exports = router;