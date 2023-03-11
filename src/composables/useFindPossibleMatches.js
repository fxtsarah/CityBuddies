// import composables
import { useSubmitQuery } from './useSubmitQuery.js'
import { useDeleteDupes } from './useDeleteDupes.js'

// Extract functions from composables.
let { submitQuery } = useSubmitQuery()
let { deleteDupes } = useDeleteDupes()

export function useFindPossibleMatches() {
    // Given a string, output all the cities with a label or alternate label that matches the input.
    async function findPossibleMatches(targetLabel) {

        // Escape any quotes present in the input so the query doesn't break.
        let noQuotes = targetLabel.replace("\'", "\\'");
            
        let query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
                    WHERE { 
                        ?city wdt:P31/wdt:P279* wd:Q515 .
                        { ?city skos:altLabel \'${noQuotes}\'@en }
                        UNION
                        { ?city rdfs:label \'${noQuotes}\'@en }
                        ?city wdt:P1082 ?population .
                                            
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    } ORDER BY DESC (?population)`
        
        try {
            let result = await submitQuery(query)
            // Remove duplicate cities from the result.
            let noDupes = await deleteDupes(result)
            return noDupes
        }
        catch(error) {
            throw new Error(error)
        }
    }
    return { findPossibleMatches }
}
