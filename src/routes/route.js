const express = require("express");
const router = express.Router();
const { createUser, login, getUser, update } = require("../controllers/UserController");
const { postProducts, getProduct, getIdproducts, putIdProducts, deleteById } = require("../controllers/productController");
const { createCart, updateCart, getCart, delCart } = require("../controllers/cartController");
const { postOrder, putOrder } = require("../controllers/orderController");
const auth = require('../middleware/auth');
const valid = require("../middleware/validation");



// FEATURE-1 User APIs
router.post("/register", createUser);
router.post("/login", login);
router.get("/user/:userId/profile", auth.authentication, getUser);
router.put("/user/:userId/profile", auth.authentication, update);


// FEATURE-2 Products API
router.post("/products", valid.validProduct, postProducts);
router.get("/products", getProduct);
router.get("/products/:productId", getIdproducts);
router.put("/products/:productId", putIdProducts);
router.delete("/products/:productId", deleteById);


// FEATURE-3 Cart APIs
router.post("/users/:userId/cart", auth.authentication, createCart);
router.put("/users/:userId/cart", auth.authentication, updateCart);
router.get("/users/:userId/cart", auth.authentication, getCart);
router.delete("/users/:userId/cart", auth.authentication, delCart);


// FEATURE-4 Checkout/Order APIs
router.post("/users/:userId/orders", auth.authentication, postOrder);
router.put("/users/:userId/orders", auth.authentication, putOrder);



module.exports = router;