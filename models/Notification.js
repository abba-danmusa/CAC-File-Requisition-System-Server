const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: 'please provide the recipient',
  },
  department: {
    type: String,
    required: 'Please provide the recipient department'
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  type: {
    type: String,
    enum: ['Complaint', 'Message']
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Add other fields as needed
});

mongoose.model('Notification', notificationSchema)