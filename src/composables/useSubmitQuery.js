// Import API.
import Api from '../Api'

export function useSubmitQuery() {
    // Takes in SPARQL code as a parameter and sends the code to query.wikidata.org.
    // Simplifies the response from wikidata before returning it.
    async function submitQuery(sparql) {
        return (await Api().post('submitQuery', {'sparql': sparql})).data
    }
    return { submitQuery }
}
