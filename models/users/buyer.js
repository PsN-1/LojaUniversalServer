const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const buyerSchema = new Schema({
  creationDate: { type: Date, required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  cpf: { type: String, required: true },
  email: { type: String, required: true },
  postalCode: { type: String, required: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  paymentsMethods: { type: String, required: false },
  store: { type: mongoose.Types.ObjectId, required: true, ref: "Store" },
});

module.exports = mongoose.model("Buyer", buyerSchema);
