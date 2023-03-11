// Import services.
const citiesService = require('../services/citiesService.js')

// Extract functions from services.
const { findPossibleMatches, getCitiesList } = citiesService

// Given a string, output all the cities with a label or alternate label that matches the input.
exports.findPossibleMatches = async (req, res) => {
    let targetLabel = req.params.label
    let possibleMatches = await findPossibleMatches(targetLabel)
    res.send(possibleMatches)
}

// Get the list of all the cities. Each entry includes the ID and population.
exports.getCitiesList = async (req, res) => {
    let citiesList = await getCitiesList()
    res.send(citiesList)
}
