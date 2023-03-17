const express = require("express");
const { check } = require('express-validator');
const userControllers = require("../controllers/user-controllers");

const router = express.Router();

router.get("/:store", userControllers.getProductsForStore);
router.get("/:store/logo", userControllers.getLogoImage);
router.get("/:store/:pid", userControllers.getProductById);

router.post(
  "/:store/newBuyer", 
  [
    check("name").not().isEmpty(),
    check('lastname').not().isEmpty(),
    check('cpf').not().isEmpty(),
    check('email').not().isEmpty(),
    check('postalCode').not().isEmpty(),
    check('number').not().isEmpty(),
    check('password').not().isEmpty(),
  ],
  userControllers.createBuyer
)

module.exports = router;
