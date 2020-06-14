const auth = require('../../middleware/auth')
const express = require('express')
const router = express.Router()

const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
// const User = require('../../models/User')

const responses = {
  noProfileForThisUser: {
    status: '404 Not Found',
    msg: 'Profile not found'
  }
}

/**
 * @route GET api/profile/me
 *
 * @see about page
 *
 * @desc get current user's profile
 * @access public
 */
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])

    if (!profile) {
      return res.status(404).json(responses.noProfileForThisUser)
    }

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ status: '500 Internal Server Errror', msg: 'Getting profile task failed successfully' })
  }
})

/**
 * @route POST api/profile
 *
 * @desc create or update user profile
 * @access private
 */
const createOrUpdateUserProfileValidation = [
  auth,
  check('bio', 'Bio is required').not().isEmpty()
]
router.post('/', createOrUpdateUserProfileValidation, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { bio } = req.body
  const user = req.user.id

  // build profile object (this may evolve over time)
  const profileFields = {
    user,
    bio
  }

  try {
    let profile = await Profile.findOne({ user })

    // update
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user },
        { $set: profileFields },
        { new: true }
      )

      return res.json(profile)
    }

    // create
    profile = new Profile(profileFields)
    await profile.save()

    res.json(profile)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ status: '500 Internal Server Errror', msg: 'Creating/updating profile task failed successfully' })
  }
})

/**
 * @route GET api/profile
 *
 * @see currently unused, could be useful if ever
 * there is more than one author
 *
 * @desc get all profiles
 * @access public
 */

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])

    res.json(profiles)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ status: '500 Internal Server Errror', msg: 'Getting profile task failed successfully' })
  }
})

/**
 * @route GET api/profile/user/:user_id
 *
 * @see currenltly unused, could be useful if ever
 * there is more than one author
 *
 * @desc get profile by user id
 * @access publicfd
 */

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

    if (!profile) {
      return res.status(404).json(responses.noProfileForThisUser)
    }

    res.json(profile)
  } catch (error) {
    console.error(error.message)
    if (error.kind === 'ObjectId') {
      return res.status(404).json(responses.noProfileForThisUser)
    }
    res.status(500).json({ status: '500 Internal Server Errror', msg: 'Getting profile task failed successfully' })
  }
})

module.exports = router
