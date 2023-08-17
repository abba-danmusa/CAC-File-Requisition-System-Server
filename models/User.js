const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now()
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: 'User with the give username already exist. choose a different username'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rank: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  staffId: {
    type: String,
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    required: true
  }
})

userSchema.pre('save', function(next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = function(candidatePassword) {
  const user = this

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        console.log(error)
        return reject(err)
      }

      if (!isMatch) {
        return reject({status: 401, message: 'Incorrect Password'})
      }

      resolve(true)
    })
  })
}

mongoose.model('User', userSchema)