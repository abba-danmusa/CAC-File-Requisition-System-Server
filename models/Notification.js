const mongoose = require('mongoose');

const expirationTime = new Date()
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  createdAt: {
    type: Date,
    expires: expirationTime.setMinutes(expirationTime.getMinutes() + 5),
    default: Date.now,
  },
  department: {
    type: String,
    required: 'Please provide the recipients department'
  },
  type: {
    type: String,
    enum: ['Complaint', 'Message']
  },
  subject: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
  sent: {
    type: Boolean,
    default: false
  }
})

mongoose.model('Notification', notificationSchema)