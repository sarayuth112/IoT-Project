const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
  watertimer: String,
  fertilizer: String,
  light: String,
  time:String,
  type:String
});

const ConfigModel = mongoose.model('configDevices', ConfigSchema);

module.exports = ConfigModel;