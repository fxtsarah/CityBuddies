// Import requirements to get a Sparql query.
const axios = require('axios')
const wbk = require('wikibase-sdk')

export function useSubmitQuery() {
    // Takes in SPARQL code as a parameter and sends the code to query.wikidata.org.
    // Simplifies the response from wikidata before returning it.
    async function submitQuery(sparql) {
        const wdk = wbk({
            instance: 'https://www.wikidata.org',
            sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

        const url = wdk.sparqlQuery(sparql)
        try {
            const results = await axios.get(url)
            let simplifiedResults = wbk.simplify.sparqlResults(results.data)
            return simplifiedResults
        }
        catch(error) {
            throw new Error(`(from submit query) ${error.message}` )
        }
    }
    return { submitQuery }
}
