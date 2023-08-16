const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'Please specify from who this request is',
  },
  companyName: {
    type: String,
    required: 'Please provide the name of the company that you requesting for',
    trim: true
  },
  rcNumber: {
    type: String,
    required: 'Please provide the RC Number of the company',
    trim: true
  },
  rrrNumber: {
    type: String,
    required: 'Please provide the RRR Number of the company',
    trim: true
  },
  purpose: {
    type: String,
    required: 'Please provide the purpose of the request',
    trim: true
  }
})

mongoose.model('Request', requestSchema)