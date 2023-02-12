// Node imports.
const express = require('express')
const router = express.Router()

// Import controllers.
const submitQueryController = require('../controllers/submitQueryController.js')

// Handle default route.
router.route('/')
    .post(submitQueryController.submitQuery)

// Export router to allow use in app.js.
module.exports = router