// import composables
import { useSubmitQuery } from './useSubmitQuery.js'

// extract functions from composables
let { submitQuery } = useSubmitQuery()

export function useIdToCountry() {
    // get the country a city is located in given the city's ID
    async function idToCountry(target_id) {
        let query = `SELECT DISTINCT ?countryLabel {
                    wd:${target_id} wdt:P17 ?country .
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
                    
        try {
            let result = await submitQuery(query)
            return result[0]["countryLabel"]
        }
        catch(error) {
            throw new Error(error)
        }
  }
  return { idToCountry }
}