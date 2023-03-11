// Import services.
const idService = require('../services/idService.js')

// Extract functinos from services.
const { idToLatlong, idToLabel, idToCountry } = idService

// Get the latitude and longitude of a city given its ID.
exports.idToLatlong = async (req, res) => {
    let id = req.params.id
    let latlong = await idToLatlong(id)
    res.send(latlong)
}

// Get the name of a city given its ID.
exports.idToLabel = async (req, res) => {
    let id = req.params.id
    let label = await idToLabel(id)
    res.send(label)
}

// Get the country a city is located in given the city's ID.
exports.idToCountry = async (req, res) => {
    let id = req.params.id
    let country = await idToCountry(id)
    res.send(country)
}
