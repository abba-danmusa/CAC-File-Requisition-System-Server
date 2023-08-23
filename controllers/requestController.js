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
  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'You haven\'t made any request yet!'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests gotten successfully',
    requests
  })
}

exports.getAuthorizationRequests = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'from'
      }
    },
    {
      $unwind: '$from'
    },
    {
      $match: {
        'from.department': req.user.department
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'requestStatus.authorization.authorizedBy',
        foreignField: '_id',
        as: 'authorizedBy'
      }
    },
    {
      $unwind: '$authorizedBy'
    },
    {
      $sort: {
        _id: -1
      }
    }
  ])
  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'You haven\'t made any request yet!'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests gotten successfully',
    requests
  })
}

exports.getLatestRequestStatus = async (req, res) => {
  const request = await Request.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'from'
      }
    },
    {
      $unwind: '$from'
    },
    {
      $match: {
        'from.department': req.user.department
      }
    },
    {
      $sort: {
        _id: -1
      }
    },
    {
      $limit: 1
    },
    {
      $addFields: {
        step: '$requestStatus.currentStep',
        authorization: {
          status: {
            $cond: {
              if: { $eq: ['$requestStatus.authorization.status', 'pending'] },
              then: 'Awaiting Authorization',
              else: {
                $cond: {
                  if: { $eq: ['$requestStatus.authorization.status', 'rejected'] },
                  then: 'Request Declined',
                  else: 'Request Authorized'
                }
              }
            }
          },
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.authorization.status', 'pending'] },
              then: '$requestStatus.authorization.dateReceived',
              else: '$requestStatus.authorization.dateTreated'
            }
          }
        },
        approval: {
          status: {
            $cond: {
              if: { $eq: ['$requestStatus.approval.status', 'pending'] },
              then: 'Awaiting Approval',
              else: {
                $cond: {
                  if: { $eq: ['$requestStatus.approval.status', 'rejected'] },
                  then: 'Request Disapproved',
                  else: 'Request Approved'
                }
              }
            }
          },
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.approval.status', 'pending'] },
              then: '$requestStatus.approval.dateReceived',
              else: '$requestStatus.approval.dateTreated'
            }
          }
        },
        fileRelease: {
          status: {
            $cond: {
              if: { $eq: ['$requestStatus.fileRelease.status', 'pending'] },
              then: 'Awaiting File Release',
              else: {
                $cond: {
                  if: { $eq: ['$requestStatus.fileRelease.status', 'rejected'] },
                  then: 'Release Declined',
                  else: 'File Released'
                }
              }
            }
          },
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileRelease.status', 'pending'] },
              then: '$requestStatus.fileRelease.dateReceived',
              else: '$requestStatus.fileRelease.dateTreated'
            }
          }
        },
        fileReceive: {
          status: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: 'Awaiting File',
              else: {
                $cond: {
                  if: { $eq: ['$requestStatus.fileReceive.status', 'rejected'] },
                  then: 'File Not Received',
                  else: 'File Received'
                }
              }
            }
          },
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceived.status', 'pending'] },
              then: '$requestStatus.fileReceived.dateReceived',
              else: '$requestStatus.fileReceived.dateTreated'
            }
          }
        }
      }
    }
  ])

  if (!request) {
    return res.status(404).json({
      status: 'success',
      message: 'You haven\'t made any request yet'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Request Status Found',
    request
  })
}

exports.getUnauthorizedRequests = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'from'
      }
    },
    {
      $unwind: '$from'
    },
    {
      $match: {
        'from.department': req.user.department,
        'requestStatus.authorization.status': 'pending'
      }
    },
    {
      $sort: {
        _id: -1
      }
    }
  ])
  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No new request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.authorizeRequest = async(req, res) => {
  await Request.findOneAndUpdate(
    { _id: req.body.id },
    {
      'requestStatus.currentStep': req.body.status == 'rejected' ? 0 : 1,
      'requestStatus.authorization.status': req.body.status,
      'requestStatus.authorization.authorizedBy': req.user._id,
      'requestStatus.authorization.dateTreated': Date.now(),
      'requestStatus.approval.dateReceived': req.body.status == 'accepted' ? Date.now() : undefined 
    },
    {runValidators: true, new: true}
  ).exec()
  const message = req.body.status === 'accepted' ? 'Authorized' : 'Declined'
  res.status(200).json({
    status: 'success',
    message: `Request ${message} Successfully`
  })
}