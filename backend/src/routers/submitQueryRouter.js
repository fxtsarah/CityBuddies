const express = require("express")
const router = express.Router()

router.post('/submit_query', async (req, res) => {
    const wdk = wbk({
                  instance: 'https://www.wikidata.org',
                  sparqlEndpoint: 'https://query.wikidata.org/sparql'
                  })
              
    const url = wdk.sparqlQuery(req.body.sparql)
    const results = await axios.get(url)
    let simplifiedResults = wbk.simplify.sparqlResults(results.data)
    res.send(simplifiedResults)
})