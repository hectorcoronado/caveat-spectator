const bcrypt = require('bcryptjs')
const config = require('config')
const express = require('express')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')

/**
 * @route POST api/users
 *
 * @desc register user
 * @access public
 */
const userRegistrationValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
]

const registerUser = async (req, res) => {
  const errors = validationResult(req)
  const { email, name, password } = req.body

  // request doesn't pass validation
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  try {
    // check that user does not exist
    let user = await User.findOne({ email })

    if (user) {
      return res.status(422).json({ errors: [{ msg: 'User already exists' }] })
    }

    // get user gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    // create instance of user
    user = new User({
      avatar,
      email,
      name,
      password
    })

    // encrypt password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

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

router.post('/', userRegistrationValidation, registerUser)

module.exports = router
