import mongoose from 'mongoose';

const CollegeURL = mongoose.model('CollegeURL', new mongoose.Schema({
  'url': { type: String, required: true },
  'isEdu': { type: Boolean, required: true, default: true },
  'name': String
}));

export default CollegeURL;