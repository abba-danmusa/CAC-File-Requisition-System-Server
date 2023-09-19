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
router.post('/approval/request', catchErrors(requestController.approveRequest))

// Release
router.post('/release/request', catchErrors(requestController.sendFile))

// Receive
router.post('/receive/request', catchErrors(requestController.confirmReceipt))

// Return
router.post('/return/request', catchErrors(requestController.returnFile))
router.post('/return/acknowledged', catchErrors(requestController.acknowledgeFileReturn))

// *********** //
// GET Routes //
// ********* //

router.get('/requests/:page', catchErrors(requestController.getRequests))
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
  '/authorization/request/pending/count',
  catchErrors(requestController.unAuthorizedRequestCount)
)
router.get(
  '/authorization/request',
  (requestController.getAuthorizationRequests)
)
router.get(
  '/authorization/requests/pending',
  catchErrors(requestController.awaitAuthorization)
)
router.get(
  '/authorization/request/accepted/:page',
  catchErrors(requestController.authorizedRequests)
)
router.get(
  '/authorization/department/accepted/request',
  catchErrors(requestController.allAuthorizedRequests)
)
router.get(
  '/authorization/department/declined/request',
  catchErrors(requestController.allDeclinedRequests)
)
router.get(
'/authorization/department/request',
  catchErrors(requestController.allAuthorizationRequests)
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
router.get(
  '/approval/requests/pending',
  catchErrors(requestController.awaitApproval)
)
router.get(
  '/approval/request/accepted/:page',
  catchErrors(requestController.approvedRequests)
)
router.get(
  '/approval/account/approved/request',
  catchErrors(requestController.approvalRequests)
)
router.get(
  '/approval/account/disapproved/request',
  catchErrors(requestController.disapprovedRequests)
)
router.get(
  '/approval/account/request',
  catchErrors(requestController.allApprovalRequests)
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
router.get(
  '/release/section/release/request',
  catchErrors(requestController.releasedRequests)
)
router.get(
  '/release/section/return/request',
  catchErrors(requestController.returnedRequests)
)
router.get(
  '/release/section/request',
  catchErrors(requestController.allReleaseRequests)
)

// Receive
router.get(
  '/receive/request/accepted/:page',
  catchErrors(requestController.filesReceived)
)

// Return
router.get(
  '/return/section/returned/request/:page',
  catchErrors(requestController.returnedFiles)
)

// *********** //
// Search Routes //
// ********* //
router.get(
  '/request/account/search',
  catchErrors(requestController.requestAccountSearch)
)
router.get(
  '/authorization/account/search',
  catchErrors(requestController.authorizationAccountSearch)
)
router.get(
  '/approval/account/search',
  catchErrors(requestController.approvalAccountSearch)
)
router.get(
  '/manage/account/search',
  catchErrors(requestController.manageAccountSearch)
)
router.get(
  '/manage/account/return/search',
  catchErrors(requestController.returnedFilesSearch)
)

module.exports = router