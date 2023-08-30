const express = require('express')
const { catchErrors } = require('../handlers/errorHandlers')
const requestController = require('../controllers/requestController')
const { requireAuth } = require('../controllers/authController')
const router = express.Router()

router.use(requireAuth)

// ************ //
// POST Routes //
// ********** //
router.post('/request', catchErrors(requestController.request))

// Authorization
router.post(
  '/authorization/request',
  catchErrors(requestController.authorizeRequest)
)

// Approval
router.post('/approval/request', requestController.approveRequest)

// Release
router.post('/release/request', catchErrors(requestController.sendFile))

// Receive
router.post('/receive/request', catchErrors(requestController.confirmReceipt))

// *********** //
// GET Routes //
// ********* //

router.get('/requests', catchErrors(requestController.getRequests))
router.get(
  '/request/status',
  catchErrors(requestController.getLatestRequestStatus)
)

// Authorization
router.get(
  '/authorization/request/pending',
  catchErrors(requestController.getUnauthorizedRequests)
)
router.get(
  '/authorization/request',
  (requestController.getAuthorizationRequests)
)

// Approval
router.get(
  '/approval/request',
  catchErrors(requestController.pendingApproval)
)
router.get(
  '/approval/requests',
  catchErrors(requestController.pendingApprovals)
)
router.get(
  '/approval/pending',
  catchErrors(requestController.pendingApprovalCount)
)

// Release
router.get(
  '/release/request',
  catchErrors(requestController.getAwaitingFileRelease)
)
router.get(
  '/release/pending',
  catchErrors(requestController.pendingReleaseCount)
)
router.get(
  '/release/requests',
  catchErrors(requestController.pendingReleases)
)

module.exports = router