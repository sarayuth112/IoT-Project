const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  watertimer: String,
  time:String,
  type:String
});

const StatusModel = mongoose.model('watertimer', statusSchema);

module.exports = StatusModel;