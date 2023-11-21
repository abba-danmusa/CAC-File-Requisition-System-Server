const mongoose = require('mongoose')
const Notification = mongoose.model('Notification')
const Request = mongoose.model('Request')

exports.authorization = async (req, res) => {
  const notification = await Notification.findOne({
    department: req.user.department
  }).sort({_id: -1})
  if (!notification) {
    return res.status(404).json({
      status: 'success',
      message: 'No any notification found at the moment'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Notifications found',
    notification
  })
}

exports.returnFiles = async (req, res) => {
  const fiveMinutesInMillis = 5 * 60 * 1000 // 5 minutes in milliseconds
  // Calculate the timestamps for the current time and 5 minutes from now
  const currentTime = new Date()
  const fiveMinutesFromNow = new Date(currentTime.getUTCMilliseconds() + fiveMinutesInMillis)
  const requests = await Request.find({
    'requestStatus.fileReturn.timeElapse.time': {
      $lte: fiveMinutesFromNow,
      $lte: currentTime, // Documents with timeElapse greater than or equal to the current time
    },
    $or: [
      { moreTimeRequest: { $exists: false } },
      { 'moreTimeRequest.status': {$ne: 'pending'} }
    ],
    'requestStatus.fileReturn.status': 'pending',
  })
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.fileReturnNotification = async (req, res) => {
  const requests = await Request.find({
    'requestStatus.fileReturn.status': 'return',
    'requestStatus.fileRelease.releasedBy': req.user._id
  }).populate('from')
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.approvalAccountNotifications = async (req, res) => {
  const requests = await Request.find({
    'moreTimeRequest.status': 'pending'
  })
  res.status(200).json({
    status: 'success',
    message: 'Requests Found',
    requests
  })
}