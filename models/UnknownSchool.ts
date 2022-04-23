import mongoose from 'mongoose';

const UnknownSchool = mongoose.model('UnknownSchool', new mongoose.Schema({
  url: { type: String, unique: true, required: true },
  count: { type: Number, default: 1 }
}));

export default UnknownSchool;