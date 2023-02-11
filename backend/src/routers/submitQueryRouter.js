const express = require("express")
const router = express.Router()

const submitQueryController = require('../controllers/submitQueryController.js')

router.route('/')
    .post(submitQueryController.submitQuery)

module.exports = router