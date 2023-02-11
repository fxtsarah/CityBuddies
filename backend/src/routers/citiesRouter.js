const express = require("express")
const router = express.Router()

const citiesController = require('../controllers/citiesController.js')

router.route('/getCitiesList')
    .get(citiesController.getCitiesList)

router.route('/findPossibleMatches/:targetLabel')
    .get(citiesController.findPossibleMatches)

module.exports = router