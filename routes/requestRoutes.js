const express = require('express')
const { catchErrors } = require('../handlers/errorHandlers')
const requestController = require('../controllers/requestController')
const { requireAuth } = require('../controllers/authController')
const router = express.Router()

router.use(requireAuth)

// POST routes
router.post(
  '/authorization/request',
  catchErrors(requestController.authorizeRequest)
)
router.post('/request', catchErrors(requestController.request))

// GET routes
router.get('/request', catchErrors(requestController.getRequest))
router.get(
  '/request/status',
  catchErrors(requestController.getLatestRequestStatus)
)
router.get(
  '/authorization/request',
  catchErrors(requestController.getUnauthorizedRequests)
)
router.get(
  '/authorization/requests',
  (requestController.getAuthorizationRequests)
)

module.exports = router