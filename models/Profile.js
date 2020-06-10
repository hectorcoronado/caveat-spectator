const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  user: {
    // connect Profile to an Id in the User model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  bio: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const Profile = mongoose.model('profile', ProfileSchema)

module.exports = Profile
