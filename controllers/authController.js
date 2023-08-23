const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')

exports.signup = async (req, res) => {
  const user = new User(req.body)
  await user.save()
  res.status(200).json({
    status: 'success',
    message: 'User registered successfully!'
  })
}

exports.signin = async (req, res) => {
  let { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) {
    res.status(401).json({
    status: 'error', 
    message: 'User with the given username does not exist!'
    })
    return
  }
  await user.comparePassword(password)
  const token = jwt.sign({ userId: user._id }, process.env.SECRET)
  res.status(200).json({
    status: 'success',
    message: 'Sign in successfully',
    user,
    token
  })
}

exports.requireAuth = async (req, res, next) => {
  const { authorization } = req.headers
  // authorization === 'Bearer laksjdflaksdjasdfklj'

  if (!authorization) {
    return res.status(401).json({ error: 'You must be logged in.' })
  }

  const token = authorization.replace('Bearer ', '')
  jwt.verify(token, process.env.SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: err.message })
    }

    const { userId } = payload

    const user = await User.findById(userId)
    req.user = user
    next()
  })
}