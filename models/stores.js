const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const storeSchema = new Schema({
  owner: { type: mongoose.Types.ObjectId, required: true, ref: "Seller" },
  name: { type: String, required: true },
  cnpj: { type: String, required: true },
  ie: { type: String, required: true },
  corporateName: { type: String, required: true },
  category: { type: String, required: true },
  logoImage: { type: String, require: false },
  products: [{ type: mongoose.Types.ObjectId, required: true, ref: "Product" }],
  balanceAvailable: { type: String, required: true },
  clients: [{ type: mongoose.Types.ObjectId, required: true, ref: "Buyer" }],
});

module.exports = mongoose.model("Store", storeSchema);
