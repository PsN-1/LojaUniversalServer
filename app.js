require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const sellerRoutes = require("./routes/seller-routes");
const userRoutes = require("./routes/user-routes");
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,  X-requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  
  next();
});

app.use(async (req, res, next)   => {
  // await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("IP:", req.ip, ", Method:", req.method, ", Endpoint:", req.url);
  if (req.body) {
    console.log("Body:", req.body);
  }

  if (req.headers) {
    console.log("Headers:", req.headers)
  }
  next();
});

app.use("/api/seller", sellerRoutes);
app.use("/api/user", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    console.log(error);
    return next(error);
  }

  console.log("Error:", error.message || "an unknown error occurred");
  res.status(error.code || 500);
  res.json({ message: error.message || "an unknown error occurred" });
});

const url = process.env.MONGOURL
const port = process.env.PORT || 4000

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to database!");
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });