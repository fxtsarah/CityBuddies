const axios = require("axios")
const wbk = require("wikibase-sdk")

export function use_submit_query() {
  // takes in SPARQL code as a parameter and sends the code to query.wikidata.org.
  // simplifies the resonse from wikidata before returning it.
  async function submit_query(sparql) {
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
            throw new Error(`Error from Wikidata: ${error}` )
        }
        
    }

  return { submit_query }
}