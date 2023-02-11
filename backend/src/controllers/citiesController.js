const citiesService = require('../services/citiesService.js')
const { findPossibleMatches, getCitiesList } = citiesService

exports.findPossibleMatches = async (req, res) => {
    let targetLabel = req.params.targetLabel
    let possibleMatches = await findPossibleMatches(targetLabel)
    res.send(possibleMatches)
}

exports.getCitiesList = async (req, res) => {
    let citiesList = await getCitiesList()
    res.send(citiesList)
}