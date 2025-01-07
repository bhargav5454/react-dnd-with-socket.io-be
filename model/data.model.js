// data.model.js
const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
});

const DataModel = mongoose.model("Data", dataSchema);
module.exports = DataModel;
