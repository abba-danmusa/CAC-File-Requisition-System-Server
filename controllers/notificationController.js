const mongoose = require('mongoose')
const Notification = mongoose.model('Notification')

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