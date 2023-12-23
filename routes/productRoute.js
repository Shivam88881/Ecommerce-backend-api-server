const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetail, reviewProduct, getAllProductsAdmin, getProductReview, deleteReview } = require("../controllers/productController");
const {isAuthenticateUser,authorizeRole} = require("../middleware/auth");

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/admin/products").get(isAuthenticateUser,authorizeRole("admin"),getAllProductsAdmin);
router.route("/admin/product/new").post(isAuthenticateUser,authorizeRole("admin"),createProduct);
router.route("/product/review").put(isAuthenticateUser,reviewProduct);
router.route("/product/:id").get(getProductDetail);
router.route("/admin/product/:id").put(isAuthenticateUser,authorizeRole("admin"),updateProduct).delete(isAuthenticateUser,authorizeRole("admin"),deleteProduct);
router.route("/admin/reviews/:id").get(isAuthenticateUser,authorizeRole("admin"),getProductReview).delete(isAuthenticateUser,authorizeRole("admin"),deleteReview);
module.exports = router;