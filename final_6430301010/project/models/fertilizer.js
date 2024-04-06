const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
  fertilizer: String,
  time:String,
  type:String
});

const ConfigModel = mongoose.model('fertilizer', ConfigSchema);

module.exports = ConfigModel;