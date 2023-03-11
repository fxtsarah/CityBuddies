// Import services.
const submitQueryService = require('../services/submitQueryService.js')

// Extract functions from services.
const { submitQuery } = submitQueryService

// Takes in SPARQL code as a parameter and sends the code to query.wikidata.org.
// Simplifies the response from wikidata before returning it.
exports.submitQuery = async (req, res) => {
    let sparql = req.body.sparql
    let wikiReponse = await submitQuery(sparql)
    res.send(wikiReponse)
}
