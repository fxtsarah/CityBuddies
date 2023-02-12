// Import services.
const submitQueryService = require('./submitQueryService.js')

// Extract functions from services.
const { submitQuery } = submitQueryService

// Get the latitude and longitude of a city given its ID.
exports.idToLatlong = async id => {
    let query = `SELECT ?city ?long ?lat
                WHERE
                {
                VALUES ?city { wd:${id} } 
                ?city p:P625 ?coordinate.
                ?coordinate psv:P625 ?coordinate_node.
                ?coordinate_node wikibase:geoLongitude ?long.
                ?coordinate_node wikibase:geoLatitude ?lat.  
                }`
    let result = await submitQuery(query)
    return {lat: result[0].lat, long: result[0].long}
}

// Get the name of a city given its ID.
exports.idToLabel = async id => {
    let query = `SELECT DISTINCT ?cityLabel {
                VALUES ?city { wd:${id} } 
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                }`
    try {
        let result = await submitQuery(query)
        return result[0].cityLabel
    }
    catch(error) {
        throw new Error(error)
    }
}

// Get the country a city is located in given the city's ID.
exports.idToCountry = async id => {
    let query = `SELECT DISTINCT ?countryLabel {
                wd:${id} wdt:P17 ?country .
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                }`
    try {
        let result = await submitQuery(query)
        return result[0].countryLabel
    }
    catch(error) {
        throw new Error(error)
    }
}
