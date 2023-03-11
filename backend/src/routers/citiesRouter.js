// Node imports.
const express = require('express')
const router = express.Router()

// Import controllers.
const citiesController = require('../controllers/citiesController.js')

// Handle getCitiesList route.
router.route('/getCitiesList')
    .get(citiesController.getCitiesList)

// Handle findPossibleMatches route.
router.route('/findPossibleMatches/:label')
    .get(citiesController.findPossibleMatches)

// Export router to allow use in app.js.
module.exports = router
