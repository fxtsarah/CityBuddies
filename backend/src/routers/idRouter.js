// Node imports.
const express = require('express')
const router = express.Router()

// Import controllers.
const idController = require('../controllers/idController.js')

// Handle label route.
router.route('/:id/label')
    .get(idController.idToLabel)

// Handle country route.
router.route('/:id/country')
    .get(idController.idToCountry)

// Handle latlong route.
router.route('/:id/latlong')
    .get(idController.idToLatlong)

// Export router to allow use in app.js.
module.exports = router
