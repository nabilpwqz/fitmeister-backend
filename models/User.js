const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
  appStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'None'], default: 'None' },
  appFeedback: { type: String, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
