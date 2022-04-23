import mongoose from 'mongoose';

const CollegeURL = mongoose.model('CollegeURL', new mongoose.Schema({
  'url': { type: String, required: true },
  'isEdu': { type: Boolean, required: true, default: true },
  'name': { type: String, String, required: true }
}));

export default CollegeURL;