const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const envSchema = new Schema({
  temperature: String,
  humidity: String,
  EC:String,
  PH:String,
  time:String,
  n: String,
  p: String,
  k: String,
  type:String
});


const EnvModel = mongoose.model('current_envs', envSchema);


module.exports = EnvModel;