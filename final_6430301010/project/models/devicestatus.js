const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  status:String,
  time:String,
  type:String,
});

const StatusModel = mongoose.model('deviceStatus', statusSchema);

module.exports = StatusModel;