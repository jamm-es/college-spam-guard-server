import mongoose from 'mongoose';

const BlockedEmail = mongoose.model('BlockedEmail', new mongoose.Schema({
  'emailAddress': { type: String, required: true },
  'isEdu': { type: Boolean, required: true, default: true},
  'school': String,
  'name': String,
}));

export default BlockedEmail;