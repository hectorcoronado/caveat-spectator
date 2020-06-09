const express = require('express')
const router = express.Router()

// middleware
const auth = require('../../middleware/auth')

// models
const User = require('../../models/User')

/**
 * @route GET api/auth
 *
 * @desc test route
 * @access public
 */
router.get('/', auth, async (req, res) => {
  try {
    // retrieve user, but don't send back password
    const user = await User.findById(req.user.id).select('-password')

    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Auth middlewware is not functioning properly')
  }
})

module.exports = router
