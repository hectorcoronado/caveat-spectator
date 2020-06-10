const bcrypt = require('bcryptjs')
const config = require('config')
const express = require('express')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

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

/**
 * @route POST api/auth
 *
 * @desc authenticate user & get token
 * @access public
 */
const userAuthenticationValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
]

const authenticateUser = async (req, res) => {
  const errors = validationResult(req)
  const { email, password } = req.body

  // request doesn't pass validation
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  try {
    // find the user
    let user = await User.findOne({ email })

    if (!user) {
      return res.status(422).json({ errors: [{ msg: 'Invalid credentials' }] })
    }

    // match email (user's identifier) w/password saved in db
    // we can compare the password entered by the user to the
    // password stored in db since we're getting user's info above
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(422).json({ errors: [{ msg: 'Invalid credentials' }] })
    }

    // return jwt/w user id to identify and auto-login after registration
    const payload = {
      user: {
        id: user.id
      }
    }
    const jwtToken = config.get('jwtSecret')
    const options = { expiresIn: 36000 }
    const jwtCallback = (err, token) => {
      if (err) throw err

      res.json({ token })
    }

    jwt.sign(payload, jwtToken, options, jwtCallback)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('user registration server error')
  }
}

router.post('/', userAuthenticationValidation, authenticateUser)

module.exports = router
