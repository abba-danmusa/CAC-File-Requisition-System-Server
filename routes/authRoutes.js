const express = require('express')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/signup', catchErrors(authController.signup))

module.exports = router