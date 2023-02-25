// Import composables.
import { useSubmitQuery } from './useSubmitQuery.js'

// Extract functions from composables.
let { submitQuery } = useSubmitQuery()

export function useIdToLabel() {
    // Get the name of a city given its ID.
    async function idToLabel(targetId) {
        let query = `SELECT DISTINCT ?cityLabel {
                        VALUES ?city { wd:${targetId}} 
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
        try {
            let result = await submitQuery(query)
            return result[0].cityLabel
        }
        catch(error) {
            throw new Error(error)
        }
    }
    return { idToLabel }
}
