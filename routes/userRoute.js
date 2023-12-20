const express = require("express");
const {registerUser,loginUser, logout, forgotPassword, resetPassword, updateProfile, getProfileDetails, changePassword, updateUserDetails, getAllUser, getUser, deleteUser, addToCart, addMultipleToCart, getAllCartItems, cartQuantityIncOrDecByOne, cartRemove, clearCart } = require("../controllers/userContoller");
const { isAuthenticateUser, authorizeRole } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticateUser,getProfileDetails);
router.route("/password/update").put(isAuthenticateUser,changePassword);
router.route("/profile/update").put(isAuthenticateUser,updateProfile);
router.route("/add-to-cart").put(isAuthenticateUser,addToCart);
router.route("/add-to-cart/multiple").put(isAuthenticateUser,addMultipleToCart);
router.route("/cart").get(isAuthenticateUser,getAllCartItems);
router.route("/cart/remove").put(isAuthenticateUser,cartRemove);
router.route("/cart/clear").put(isAuthenticateUser,clearCart);
router.route("/cart/inc-or-dec").put(isAuthenticateUser,cartQuantityIncOrDecByOne);
router.route("/admin/all-users").get(isAuthenticateUser, authorizeRole("admin"), getAllUser);
router.route("/admin/user/:id")
.get(isAuthenticateUser, authorizeRole("admin"), getUser)
.put(isAuthenticateUser, authorizeRole("admin"), updateUserDetails)
.delete(isAuthenticateUser, authorizeRole("admin"), deleteUser);


module.exports = router;