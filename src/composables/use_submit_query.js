const axios = require("axios")
const wbk = require("wikibase-sdk")
import Api from "../Api"

// export function use_submit_query() {
//     async function submit_query(sparql) {
//         const wdk = wbk({
//           instance: 'https://www.wikidata.org',
//           sparqlEndpoint: 'https://query.wikidata.org/sparql'
//           })
      
//         const url = wdk.sparqlQuery(sparql)
//         const results = await axios.get(url)
//         let simplifiedResults = wbk.simplify.sparqlResults(results.data)
//         return simplifiedResults
//       }

//     return { submit_query }
// }

export function use_submit_query() {
    async function submit_query(sparql) {
      console.log("use_submit_query called on sparql: " + sparql)
      var ret = await Api().post('submit_query', {"sparql": sparql})
      console.log("api returned: " + JSON.stringify(ret.data))
      return ret.data
  }

    return { submit_query }
}