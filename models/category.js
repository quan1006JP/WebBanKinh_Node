const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Category schema
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Category', CategorySchema);
