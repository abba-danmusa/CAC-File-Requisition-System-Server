const mongoose = require('mongoose')

const authorizationStep = 0
const approvalStep = 1
const fileReleaseStep = 2
const fileReceiveStep = 3
const statusSchema = new mongoose.Schema({
  currentStep: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0
  },
  authorization: {
    step: {
      type: Number,
      enum: [0],
      default: authorizationStep
    },
    status: {
      type: String,
      enum: ['pending', 'rejected', 'accepted'],
      default: 'pending'
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateReceived: {
      type: Date,
      default: Date.now()
    },
    dateViewed: Date,
    dateTreated: Date
  },
  approval: {
    step: {
      type: Number,
      enum: [1],
      default: approvalStep
    },
    status: {
      type: String,
      enum: ['pending', 'rejected', 'accepted'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateReceived: Date,
    dateViewed: Date,
    dateTreated: Date
  },
  fileRelease: {
    step: {
      type: Number,
      enum: [2],
      default: fileReleaseStep
    },
    status: {
      type: String,
      enum: ['pending', 'rejected', 'accepted'],
      default: 'pending'
    },
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateReceived: Date,
    dateViewed: Date,
    dateTreated: Date
  },
  fileReceive: {
    step: {
      type: Number,
      enum: [3],
      default: fileReceiveStep
    },
    status: {
      type: String,
      enum: ['pending', 'rejected', 'accepted'],
      default: 'pending'
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateReceived: Date,
    dateViewed: Date,
    dateTreated: Date
  }
})

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
  },
  fileStatus: {
    isReturned: Boolean,
    isReceived: Boolean
  },
  requestStatus: {
    currentStep: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0
    },
    authorization: {
      step: {
        type: Number,
        enum: [0],
        default: authorizationStep
      },
      status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: 'pending'
      },
      authorizedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dateReceived: {
        type: Date,
        default: Date.now()
      },
      dateViewed: Date,
      dateTreated: Date
    },
    approval: {
      step: {
        type: Number,
        enum: [1],
        default: approvalStep
      },
      status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: 'pending'
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dateReceived: Date,
      dateViewed: Date,
      dateTreated: Date
    },
    fileRelease: {
      step: {
        type: Number,
        enum: [2],
        default: fileReleaseStep
      },
      status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: 'pending'
      },
      releasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dateReceived: Date,
      dateViewed: Date,
      dateTreated: Date
    },
    fileReceive: {
      step: {
        type: Number,
        enum: [3],
        default: fileReceiveStep
      },
      status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: 'pending'
      },
      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dateReceived: Date,
      dateViewed: Date,
      dateTreated: Date
    }
  },
})

mongoose.model('Request', requestSchema)