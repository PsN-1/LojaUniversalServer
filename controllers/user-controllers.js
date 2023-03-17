const HttpError = require("../models/http-error");
const Product = require("../models/products");
const Store = require("../models/stores");
const Buyer = require("../models/users/buyer");
const Services = require("../services/user-services");

const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

const getProductsForStore = async (req, res, next) => {
  const storeName = req.params.store;

  let products;
  let storeId;
  try {
    storeId = await Store.findOne({ name: storeName });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Store Name not found, please check.", 404);
    return next(error);
  }

  try {
    products = await Product.find(
      { store: storeId._id },
      "image name value category"
    );
  } catch (err) {
    const error = new HttpError(
      "Fetching products failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json(products);
};

const getProductById = async (req, res, next) => {
  const productId = req.params.pid;

  let product;

  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find product",
      500
    );
    return next(error);
  }
  res.status(200).json({ product: product });
};

const getLogoImage = async (req, res, next) => {
  const storeName = req.params.store;

  let logoImage;

  try {
    logoImage = await Store.findOne({ name: storeName }, "logoImage");
  } catch (err) {
    console.log(err);
    const error = new HttpError("Logo image for store was not found.", 404);
    return next(error);
  }
  res.json(logoImage);
};

const createBuyer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `Invalid inputs passed, please check your data.${errors.array}`,
        422
      )
    );
  }

  const { name, lastname, cpf, email, postalCode, number, password } = req.body;
  const storeName = req.params.store;

  let existingBuyer;
  try {
    existingBuyer = await Services.getBuyer(email);
  } catch (err) {
    return next(err)
  }

  if (existingBuyer) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const store = await getStore(storeName);

  const createdBuyer = new Buyer({
    creationDate: Date.now(),
    name,
    lastname,
    cpf,
    email,
    postalCode,
    number,
    password: hashedPassword,
    store,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBuyer.save();
    store.clients.push(createdBuyer);
    await store.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating user failed, please try again.", 500);
    return next(error);
  }

  res.status(201);
  res.json({ email: createdBuyer.email });
};

const getStore = async (storeName) => {
  let store;

  try {
    store = await Store.findOne({ name: storeName });
  } catch (err) {
    const error = new HttpError(
      "Fetching client store failed, please try again later",
      500
    );
    return error;
  }

  return store;
};

exports.getProductsForStore = getProductsForStore;
exports.getProductById = getProductById;
exports.getLogoImage = getLogoImage;
exports.createBuyer = createBuyer;
