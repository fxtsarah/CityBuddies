// import composables
import { use_submit_query } from './use_submit_query.js'

// extract functions from composables
let { submit_query } = use_submit_query()

export function use_id_to_country() {
    // get the country a city is located in given the city's ID
    async function id_to_country(target_id) {
        var query = `SELECT DISTINCT ?countryLabel {
                    wd:${target_id} wdt:P17 ?country .
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
        var result = await submit_query(query)
        return result[0]["countryLabel"]
  }
return { id_to_country }
}