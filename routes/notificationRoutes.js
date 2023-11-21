const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notificationController')
const { catchErrors } = require('../handlers/errorHandlers')

router.get('/notification/authorization', catchErrors(notificationController.authorization))
router.get('/notification/return/requests', catchErrors(notificationController.returnFiles))

// notify the user that releases the file
router.get('/notification/account/managing',
  catchErrors(notificationController.fileReturnNotification)
)

// approval account notifications
router.get('/notification/account/approval',
  catchErrors(notificationController.approvalAccountNotifications)
)

module.exports = router