const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notificationController')
const { catchErrors } = require('../handlers/errorHandlers')

router.get('/notification/authorization', catchErrors(notificationController.authorization))
router.get('/notification/return/requests', catchErrors(notificationController.returnFiles))

module.exports = router