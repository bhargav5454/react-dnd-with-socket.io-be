const express = require("express");
const route = express.Router();
const dataRoute = require("./data.routes");
route.use("/data", dataRoute);

module.exports = route;
