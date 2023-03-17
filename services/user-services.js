const Buyer = require("../models/users/buyer")
const HttpError = require("../models/http-error");

async function getBuyer(email) {
  let existingBuyer
  try {
    existingBuyer = await Buyer.findOne({ email: email })
  } catch {
    throw HttpError("Failed to retrieve the user, please try again later", 500)
  }

  return existingBuyer
}

exports.getBuyer = getBuyer
