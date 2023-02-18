// Import API.
import Api from '../Api'

export function useSubmitQuery() {
    // Takes in SPARQL code as a parameter and sends the code to query.wikidata.org.
    // Simplifies the response from wikidata before returning it.
    async function submitQuery(sparql) {
        return (await Api().post('submitQuery', {'sparql': sparql})).data
        // const wdk = wbk({
        //     instance: 'https://www.wikidata.org',
        //     sparqlEndpoint: 'https://query.wikidata.org/sparql'
        // })
    
        // const url = wdk.sparqlQuery(sparql)
        // console.log(`url generated: ${url}`)
        // try {
        //     const results = await axios.get(url)
        //     let simplifiedResults = wbk.simplify.sparqlResults(results.data)
        //     return simplifiedResults
        // }
        // catch(error) {
        //     throw new Error(`(from submit query) ${error.message}` )
        // }
    }
    return { submitQuery }
}
