const HttpError = require("../models/http-error");
const { default: mongoose } = require("mongoose");
const Product = require("../models/products");
const Store = require("../models/stores");
const { validationResult } = require("express-validator");

// Products
const getProductsForSeller = async (req, res, next) => {
  const storeName = req.params.store;

  let store;
  try {
    store = await Store.findOne({ name: storeName }).populate("products");
  } catch (err) {
    const error = new HttpError(
      "Fetching products failed, please try again later.",
      500
    );
    return next(error);
  }

  const products = store.products;
  console.log("Response:", products);
  res.json(products.toObject({ getters: true }));
};

const getSellerStore = async (req, res, next) => {
  const paramsStoreName = req.params.store;
  const loggedStore = req.userData.storeName;

  if (loggedStore !== paramsStoreName) {
    const error = new HttpError("BAD URL", 500);
    return next(error);
  }

  let store;
  try {
    store = await Store.findOne(
      { name: loggedStore },
      "name cnpj ie corporateName category logoImage"
    );
  } catch (err) {
    const error = new HttpError(
      "Fetching store failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json(store);
};

const updateSellerStore = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data, please check.", 422));
  }

  const paramsStoreName = req.params.store;
  const loggedStore = req.userData.storeName;
  const { cnpj, ie, corporateName, category, logoImage } = req.body;

  if (loggedStore !== paramsStoreName) {
    const error = new HttpError("BAD URL", 500);
    return next(error);
  }

  let store;
  try {
    store = await Store.findOne({ name: loggedStore });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update store",
      500
    );
    return next(error);
  }

  store.cnpj = cnpj;
  store.ie = ie;
  store.corporateName = corporateName;
  store.category = category;
  store.logoImage = logoImage;

  try {
    await store.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update store",
      500
    );
    return next(error);
  }

  console.log("store updated");
  res.status(200).json({ message: "store updated" });
};

const getActiveProduts = async (req, res, next) => {
  const storeName = req.params.store;

  let store;
  try {
    store = await Store.findOne({ name: storeName });
  } catch (err) {
    const error = new HttpError(
      "Fetching products failed, please try again later.",
      500
    );
    return next(error);
  }

  let count;
  if (store === null) {
    return res.json(0);
  }
  if (store.products === null) {
    return res.json(0);
  }
  count = store.products.length;

  console.log("Response:", count);
  res.json(count);
};

const createProduct = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data, please check.", 422));
  }
  const storeName = req.params.store;
  const { name, image, category, description, amount, value } = req.body;

  const store = await getStore(storeName);

  const createdProduct = new Product({
    store,
    name,
    image,
    category,
    description,
    amount,
    value,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdProduct.save({ session: sess });
    store.products.push(createdProduct);
    await store.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating product failed, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ message: "Product Created" });
};

const getProductById = async (req, res, next) => {
  const storeName = req.params.store;
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId).populate({
      path: "store",
      select: "name",
    });
    if (product.store.toObject().name !== storeName) {
      const error = new HttpError("You are not allowed to see this page.", 401);
      return next(error);
    }
    // product.store = null;
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find product",
      500
    );
    console.log(err);
    return next(error);
  }

  console.log("Status Code:", 200, "Response:", product);
  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const updateProduct = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data, please check.", 422));
  }

  const storeName = req.params.store;
  const { name, image, category, description, amount, value } = req.body;
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId).populate({
      path: "store",
      select: "name",
    });
    if (product.store.toObject().name !== storeName) {
      const error = new HttpError("You are not allowed to see this page.", 401);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update product",
      500
    );
    return next(error);
  }

  product.name = name;
  product.image = image;
  product.category = category;
  product.description = description;
  product.amount = amount;
  product.value = value;

  try {
    await product.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update product",
      500
    );
    return next(error);
  }

  console.log(200, product);
  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const deleteProduct = async (req, res, next) => {
  const storeName = req.params.store;
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId).populate("store");
    if (product.store.toObject().name !== storeName) {
      const error = new HttpError("You are not allowed to see this page.", 401);
      return next(error);
    }
  } catch (err) {
    console.log("269", err);
    const error = new HttpError(
      "Something went wrong, could not delete product",
      500
    );
    return next(error);
  }

  if (!product) {
    const error = new HttpError("Could not find product for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await product.remove({ session: sess });
    product.store.products.pull(product);
    await product.store.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete product",
      500
    );
    return next(error);
  }

  console.log("Status Code:", 200, "Response: Deleted product.");
  res.status(200).json({ message: "Deleted product." });
};

const getStore = async (storeName) => {
  let store;

  try {
    store = await Store.findOne({ name: storeName });
  } catch (err) {
    const error = new HttpError(
      "Fetching store failed, please try again later.",
      500
    );
    return error;
  }

  return store;
};

exports.getProductsForSeller = getProductsForSeller;
exports.getActiveProduts = getActiveProduts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getSellerStore = getSellerStore;
exports.updateSellerStore = updateSellerStore;
