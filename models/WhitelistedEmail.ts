import mongoose from 'mongoose';

const WhitelistedEmail = mongoose.model('WhitelistedEmail', new mongoose.Schema({
  domain: String,
  fullEmail: String,
  regex: String
}));

export default WhitelistedEmail;