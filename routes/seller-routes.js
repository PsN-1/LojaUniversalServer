const express = require("express");
const checkAuth = require("../middleware/check-auth");
const { check } = require('express-validator')

const sellerControllers = require("../controllers/seller-controllers");
const storeControllers = require("../controllers/store-controllers");

const router = express.Router();

// Login
router.post("/login", sellerControllers.login);

// Store
router.post("/stores/newSeller", [
  check('name').not().isEmpty(),
  check('lastname').not().isEmpty(),
  check('cpf').not().isEmpty(),
  check('email').isEmail(),
  check('postalCode').not().isEmpty(),
  check('number').not().isEmpty(),
  check('password').not().isEmpty(),
],sellerControllers.createSeller);

router.post("/stores/newStore", [
  check('email').isEmail,
  check('name').not().isEmpty(),
  check('cnpj').not().isEmpty(),
  check('ie').not().isEmpty(),
  check('corporateName').not().isEmpty(),
  check('category').not().isEmpty(),
], sellerControllers.createStore);

// Products
router.use(checkAuth);

router.get("/:store/store", storeControllers.getSellerStore);
router.get("/:store/seller", sellerControllers.getSeller);

router.patch("/:store/store", [
  check('cnpj').not().isEmpty(),
  check('ie').not().isEmpty(),
  check('corporateName').not().isEmpty(),
  check('category').not().isEmpty(),
  check('logoImage').not().isEmpty(),

], storeControllers.updateSellerStore);

router.patch("/:store/seller", [
  check('name').not().isEmpty(),
  check('lastname').not().isEmpty(),
  check('postalCode').not().isEmpty(),
  check('number').not().isEmpty(),
], sellerControllers.updateSeller);

router.get("/:store/products", storeControllers.getProductsForSeller);
router.get("/:store/products/count", storeControllers.getActiveProduts);
router.get("/:store/products/:pid", storeControllers.getProductById);

router.post("/:store/products", [
  check('name').not().isEmpty(),
  check('image').not().isEmpty(),
  check('category').not().isEmpty(),
  check('description').not().isEmpty(),
  check('amount').not().isEmpty(),
  check('value').not().isEmpty(),
], storeControllers.createProduct);

router.patch("/:store/products/:pid", [
  check('name').not().isEmpty(),
  check('image').not().isEmpty(),
  check('category').not().isEmpty(),
  check('description').not().isEmpty(),
  check('amount').not().isEmpty(),
  check('value').not().isEmpty(),
], storeControllers.updateProduct);

router.delete("/:store/products/:pid", storeControllers.deleteProduct);

module.exports = router;
