const express = require('express')
const router = express.Router()

/**
 * @route GET api/reviews
 *
 * @desc test route
 * @access public
 */
router.get('/', (req, res) => res.send('reviews route'))

module.exports = router
