const mongoose = require('mongoose')
const { assignFileToSection } = require('./modules/fileAssignment')
const Request = mongoose.model('Request')
const ObjectId = require('mongodb').ObjectId

exports.request = async (req, res) => {
  req.body.from = req.user._id
  if (req.body.companyType !== 'BN' || req.body.companyType !== 'IT') {
    req.body.section = assignFileToSection(req.body.rcNumber)
  }
  if (req.body.companyType === 'BN') req.body.section = 'Business Names'
  if (req.body.companyType === 'IT') req.body.section = 'Incorporated Trustees'
  const request = new Request(req.body)
  await request.save()
  res.status(200)
    .json({
      status: 'success',
      message: 'Your request has been sent successfully and is now awaiting authorization'
    })
}

exports.getRequests = async (req, res) => {
  const page = req.params.page || 1
  const limit = 20
  const skip = (page * limit) - limit
  const total = await Request.countDocuments({ from: req.user._id })
  const pages = Math.ceil(total / limit)

  const requests = await Request.aggregate([
    {
      $match: {from: req.user._id}
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: skip
    },
    {
      $limit: limit,
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
    requests,
    pages,
    total
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
      message: 'No any request awaiting Authorization!'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found successfully',
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
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
        _id: 1
      }
    },
    {
      $limit: 1
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

exports.unAuthorizedRequestCount = async (req,res) => {
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
      $count: 'count'
    }
  ])
  res.status(200).json({
    status: 'success',
    message: 'Unauthorized Request(s) found',
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
      'requestStatus.authorization.remarks': req.body.remarks,
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

exports.pendingApproval = async (req, res) => {
  const request = await Request.find({
    'requestStatus.authorization.status': 'accepted',
    'requestStatus.approval.status': 'pending'
  }).limit(1)

  if (!request.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No Any New Request'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'New Request Found',
    request
  })
}

exports.pendingApprovals = async (req, res) => {
  const requests = await Request.find({
    'requestStatus.authorization.status': 'accepted',
    'requestStatus.approval.status': 'pending',
  })

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No Any New Request'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'New Request Found',
    requests
  })
}
const releaseElapseTime = async () => {
  // Calculate 1 hour from now in UTC
  const currentDate = new Date();
  currentDate.setUTCHours(currentDate.getUTCHours() + 1);
  return currentDate;
}
exports.approveRequest = async (req, res) => {
  const timeElapse = await releaseElapseTime()
  await Request.findOneAndUpdate(
    { _id: req.body.id },
    {
      'requestStatus.currentStep': req.body.status == 'rejected' ? 1 : 2,
      'requestStatus.approval.status': req.body.status,
      'requestStatus.approval.remarks': req.body.remarks,
      'requestStatus.approval.approvedBy': req.user._id,
      'requestStatus.approval.dateTreated': Date.now(),
      'requestStatus.fileRelease.dateReceived':
        req.body.status == 'accepted' ? Date.now() : undefined,
      'requestStatus.fileRelease.timeElapse.time': timeElapse
    },
    { runValidators: true, new: true }
  ).exec()
  const message = req.body.status === 'accepted' ? 'Approved' : 'Disapproved'
  res.status(200).json({
    status: 'success',
    message: `Request ${message} Successfully`
  })
}

exports.pendingApprovalCount = async (req, res) => {
 const count = await Request.countDocuments({
   'requestStatus.authorization.status': 'accepted',
   'requestStatus.approval.status': 'pending'
 })
  res.status(200).json({
    status: 'success',
    pendingApprovalCount: count
  })
}

exports.getAwaitingFileRelease = async (req, res) => {
  const request = await Request.find({
    section: req.user.section,
    'requestStatus.authorization.status': 'accepted',
    'requestStatus.approval.status': 'accepted',
    'requestStatus.fileRelease.status': 'pending'
  }).limit(1)
  if (!request.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No New Request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'New Request Found Successfully',
    request
  })
}

exports.pendingReleaseCount = async (req, res) => {
  const count = await Request.countDocuments({
    'requestStatus.authorization.status': 'accepted',
    'requestStatus.approval.status': 'accepted',
    'requestStatus.fileRelease.status': 'pending',
  })
  res.status(200).json({
    status: 'success',
    pendingReleaseCount: count
  })
}

exports.pendingReleases = async (req, res) => {
  const requests = await Request.find({
    'requestStatus.authorization.status': 'accepted',
    'requestStatus.approval.status': 'accepted',
    'requestStatus.fileRelease.status': 'pending',
  })

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No Any New Request'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'New Requests Found',
    requests
  })
}

exports.sendFile = async (req, res) => {
  await Request.findOneAndUpdate(
    { _id: req.body.id },
    {
      'requestStatus.currentStep': req.body.status == 'rejected' ? 2 : 3,
      'requestStatus.fileRelease.status': req.body.status,
      'requestStatus.fileRelease.remarks': req.body.remarks,
      'requestStatus.fileRelease.approvedBy': req.user._id,
      'requestStatus.fileRelease.dateTreated': Date.now(),
      'requestStatus.fileReceive.dateReceived': Date.now()
    },
    { runValidators: true, new: true }
  ).exec()
  res.status(200).json({
    status: 'success',
    message: `File Send Successfully and Awaiting confirmation receipt from the receiving party`
  })
}

exports.confirmReceipt = async (req, res) => {
  const _id = req.body.id
  const request = await Request.findOne({ _id }, 'requestStatus')
  const elapsed = Date.now() <= new Date(request.timeElapse?.time) ? true : false
  await Request.findOneAndUpdate(
    { _id },
    {
      'requestStatus.currentStep': 4,
      'requestStatus.fileReceive.status': 'accepted',
      'requestStatus.fileReceive.receivedBy': req.user._id,
      'requestStatus.fileReceive.dateTreated': Date.now(),
      'requestStatus.fileRelease.timeElapse.elapsed': elapsed,
      'requestStatus.fileRelease.timeElapse.time': Date.now()
    },
    {runValidators: true, new: true}
  ).exec()
  res.status(200).json({
    status: 'success',
    message: 'Confirmed'
  })
}

exports.awaitAuthorization = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        from: req.user._id,
        'requestStatus.authorization.status': 'pending'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any request is awaiting authorization'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.awaitApproval = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        from: req.user._id,
        'requestStatus.authorization.status': 'accepted',
        'requestStatus.approval.status': 'pending'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any request is awaiting approval'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.authorizedRequests = async (req, res) => {
  const page = req.params.page || 1
  const limit = 20
  const skip = (page * limit) - limit
  const total = await Request.countDocuments({
    from: req.user._id,
    $or: [
      { 'requestStatus.authorization.status': 'accepted' },
      { 'requestStatus.authorization.status': 'rejected' }
    ]
  })
  const pages = Math.ceil(total / limit)
  const requests = await Request.aggregate([
    {
      $match: {
        from: req.user._id,
        $or: [{ 'requestStatus.authorization.status': 'accepted' }, { 'requestStatus.authorization.status': 'rejected' }]
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {$sort: {_id: -1}},
    {$skip: skip},
    {$limit: limit}
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any authorized request'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests,
    pages
  })
}

exports.approvedRequests = async (req, res) => {
  const page = req.params.page || 1
  const limit = 20
  const skip = (page * limit) - limit
  const total = await Request.countDocuments({
    from: req.user._id,
    $or: [
      { 'requestStatus.approval.status': 'accepted' },
      { 'requestStatus.approval.status': 'rejected' }
    ]
  })
  const pages = Math.ceil(total / limit)
  const requests = await Request.aggregate([
    {
      $match: {
        from: req.user._id,
        $or: [
          { 'requestStatus.approval.status': 'accepted' },
          { 'requestStatus.approval.status': 'rejected' }
        ]
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limit }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any approved request'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests,
    pages
  })
}

exports.filesReceived = async (req, res) => {
  const page = req.params.page || 1
  const limit = 20
  const skip = (page * limit) - limit
  const total = await Request.countDocuments({
    from: req.user._id,
    'requestStatus.fileReceive.status': 'accepted'
  })
  const pages = Math.ceil(total / limit)

  const requests = await Request.aggregate([
    {
      $match: {
        from: req.user._id,
        'requestStatus.fileReceive.status': 'accepted'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limit }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any received file'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests,
    pages
  })
}

exports.allAuthorizedRequests = async (req, res) => {
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
        'requestStatus.authorization.status': 'accepted'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: {_id: -1}
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any accepted request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Accepted requests found',
    requests
  })
}

exports.allDeclinedRequests = async (req, res) => {
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
        'requestStatus.authorization.status': 'rejected'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any declined request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Declined requests found',
    requests
  })
}

exports.allAuthorizationRequests = async (req, res) => {
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.approvalRequests = async(req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        'requestStatus.approval.status': 'accepted'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any approved request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Approved requests found',
    requests
  })
}

exports.disapprovedRequests = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        'requestStatus.approval.status': 'rejected'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any disapproved request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Disapproved requests found',
    requests
  })
}

exports.allApprovalRequests = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        'requestStatus.authorization.status': 'accepted'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any request found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.releasedRequests = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        'requestStatus.fileRelease.status': 'accepted'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'from'
      }
    },
    {$unwind: '$from'},

  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any released file found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

exports.allReleaseRequests = async (req, res) => {
  const requests = await Request.aggregate([
    {
      $match: {
        section: req.user.section,
        'requestStatus.authorization.status': 'accepted',
        'requestStatus.approval.status': 'accepted'
      }
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
          remarks: '$requestStatus.authorization.remarks',
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
          remarks: '$requestStatus.approval.remarks',
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
          remarks: '$requestStatus.fileRelease.remarks',
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
          remarks: '$requestStatus.fileReceive.remarks',
          date: {
            $cond: {
              if: { $eq: ['$requestStatus.fileReceive.status', 'pending'] },
              then: '$requestStatus.fileReceive.dateReceived',
              else: '$requestStatus.fileReceive.dateTreated'
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ])

  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any released file found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    requests
  })
}

// Searches
exports.requestAccountSearch = async (req, res) => {
  const searchQuery = new RegExp(req.query.query) 
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
        'from._id': req.user._id,
        $or: [
          { companyName: { $regex: searchQuery, $options: 'gi' } },
          { rcNumber: { $regex: searchQuery, $options: 'gi' } }
        ]
      }
    },
  ])
  if (!requests.length) {
    return res.status(404).json({
      status: 'success',
      message: 'No any searched result found'
    })
  }
  res.status(200).json({
    status: 'success',
    message: 'Searched results found',
    requests
  })
}

exports.authorizationAccountSearch = async (req, res) => {
  const searchQuery = new RegExp(req.query.query)
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
        $or: [
          { companyName: { $regex: searchQuery, $options: 'gi' } },
          { rcNumber: { $regex: searchQuery, $options: 'gi' } }
        ]
      }
    },
    {$limit: 20}
  ])

  if (!requests.length) return res.status(404).json({
    status: 'success',
    message: 'No any searched results'
  })
  res.status(200).json({
    status: 'success',
    message: 'Searched results found',
    requests
  })
}

exports.approvalAccountSearch = async (req, res) => {
  const searchQuery = new RegExp(req.query.query)
  const requests = await Request.aggregate([
    {
      $match: {
        'requestStatus.authorization.status': 'accepted',
        $or: [
          { companyName: { $regex: searchQuery, $options: 'gi' } },
          { rcNumber: { $regex: searchQuery, $options: 'gi' } }
        ]
      }
    },
    { $limit: 20 }
  ])

  if (!requests.length) return res.status(404).json({
    status: 'success',
    message: 'No any searched results'
  })
  res.status(200).json({
    status: 'success',
    message: 'Searched results found',
    requests
  })
}

exports.manageAccountSearch = async (req, res) => {
  const searchQuery = new RegExp(req.query.query)
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
        section: req.user.section,
        $or: [
          { companyName: { $regex: searchQuery, $options: 'gi' } },
          { rcNumber: { $regex: searchQuery, $options: 'gi' } }
        ]
      }
    },
    { $limit: 20 }
  ])

  if (!requests.length) return res.status(404).json({
    status: 'success',
    message: 'No any searched results'
  })
  res.status(200).json({
    status: 'success',
    message: 'Searched results found',
    requests
  })
}