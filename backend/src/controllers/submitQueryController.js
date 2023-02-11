const submitQueryService = require('../services/submitQueryService.js')
const { submitQuery } = submitQueryService

exports.submitQuery = async (req, res) => {
    let sparql = req.body.sparql
    let wikiReponse = await submitQuery(sparql)
    res.send(wikiReponse)
}