// Import requirements to get a Sparql query.
const axios = require('axios')
const wbk = require('wikibase-sdk')
const https = require('https')

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Takes in SPARQL code as a parameter and sends the code to query.wikidata.org.
// Simplifies the response from wikidata before returning it.
exports.submitQuery = async (sparql) => {
    const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
    })

    const url = wdk.sparqlQuery(sparql)
    try {
        const results = await axios.get(url, {httpsAgent})
        let simplifiedResults = wbk.simplify.sparqlResults(results.data)
        return simplifiedResults
    }
    catch(error) {
        throw new Error(`(from submit query) ${error.message}` )
    }
}
