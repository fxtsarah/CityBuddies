// import composables
import { use_submit_query } from './use_submit_query.js'
import { state } from '../stores/store.js'

// extract functions from composables
let { submit_query } = use_submit_query()

export function use_id_to_pop() {
    // get the population of a city given the city's ID
    function id_to_pop(target_id) {
      let entry = Object.values(state.cities_list).filter(entry => String(entry["value"]) == String(target_id))[0]
      return entry.population
  }
return { id_to_pop }
}