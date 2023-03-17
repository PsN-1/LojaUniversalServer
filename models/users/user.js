const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    creationDate: { type: Date, required: true},
    name: { type: String, required: true },
    cpf: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
})
