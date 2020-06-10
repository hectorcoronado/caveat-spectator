const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

const Profile = require('../../models/Profile')
// const User = require('../../models/User')

/**
 * @route GET api/profile/me
 *
 * @desc get current users profile
 * @access public
 */
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])

    if (!profile) {
      return res.status(404).json({ status: '404 Not Found', msg: 'There is no profile for this user' })
    }

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ status: '500 Internal Server Errror', msg: 'Getting profile task failed successfully' })
  }
})

module.exports = router
