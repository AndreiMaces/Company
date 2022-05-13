require('dotenv').config();
const express = require("express");
const productModel = require('../models/productModel.js');
const FB = require("fb");
const { isLoggedIn, catchAsync } = require("../middleware.js");
const router = express.Router();
const { getProducts, productForm, productFormPost, getProduct, deleteProduct, updateForm, updateProduct } = require("../controllers/productController.js");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.get("/product/all", getProducts);

router.get("/product/post", productForm);

router.post("/product/post", isLoggedIn, upload.single('newImage'), catchAsync(productFormPost));

router.get("/product/:id/update", catchAsync(updateForm));

router.get("/product/:id", catchAsync(getProduct));

router.put("/product/:id/update", isLoggedIn, upload.single('newImage'), catchAsync(updateProduct));

router.delete("/product/:id", isLoggedIn, catchAsync(deleteProduct));

module.exports = router