const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now()
  },
  elapseTime: {
    type: Date,
    default: function () {
      // Calculate the date 72 hours (3 days) from now
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + process.env.COMPLAINT_ELAPSE_TIME)
      return currentDate
    }
  },
  type: {
    type: String,
    enum: ['Time extension', 'Complaint', 'Authorization']
  },
  complaint: String,
})

mongoose.model('Complaint', complaintSchema)