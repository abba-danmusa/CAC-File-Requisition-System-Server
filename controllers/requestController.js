const mongoose = require('mongoose')
const Request = mongoose.model('Request')

exports.request = async (req, res) => {
  req.body.from = req.user._id
  const request = new Request(req.body)
  await request.save()
  res.status(200)
    .json({
      status: 'success',
      message: 'Your request has been sent successfully and is now awaiting authorization'
    })
}

exports.getRequest = async (req, res) => {
  const requests = await Request.find({ from: req.user }).sort({_id: -1})
  if (!requests) {
    res.status(404).
      json({
        status: 'success',
        message: 'You have no recent request! The requests you make shows here.'
      })
    return
  }
  res.status(200).
    json({
      status: 'success',
      message: 'Requests gotten successfully',
      requests
    })
}