const axios = require("axios");
const wbk = require("wikibase-sdk")

async function submit_query(spaqrl) {
    const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

      const url = wdk.sparqlQuery(sparql)
      const results = await axios.get(url)
      let simplifiedResults = wbk.simplify.sparqlResults(results.data)
      console.log("submit query called. returned: " + JSON.stringify(simplifiedResults))
      return simplifiedResults

      
  }

  export default {
    submit_query
}