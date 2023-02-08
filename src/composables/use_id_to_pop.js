// import composables
import { use_submit_query } from './use_submit_query.js'

// extract functions from composables
let { submit_query } = use_submit_query()

export function use_id_to_pop() {
    // get the population of a city given the city's ID
    async function id_to_pop(target_id) {
        var query = `SELECT DISTINCT ?population {
                    wd:${target_id} wdt:P1082 ?population.
                    }`
        var result = await submit_query(query)
        return result[0]["population"]
  }
return { id_to_pop }
}