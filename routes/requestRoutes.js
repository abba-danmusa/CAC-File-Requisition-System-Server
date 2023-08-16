const express = require('express')
const { catchErrors } = require('../handlers/errorHandlers')
const requestController = require('../controllers/requestController')
const { requireAuth } = require('../controllers/authController')
const router = express.Router()

router.use(requireAuth)
router.post('/request', catchErrors(requestController.request))

// Get requests
router.get('/request', catchErrors(requestController.getRequest))

module.exports = router