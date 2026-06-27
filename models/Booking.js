const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  className: { type: String, required: true },
  trainerName: { type: String, required: true },
  price: { type: Number, required: true },
  schedule: { type: String, required: true },
  paidAt: { type: Date, default: Date.now },
  transactionId: { type: String, required: true }
});

module.exports = mongoose.model('Booking', BookingSchema);
