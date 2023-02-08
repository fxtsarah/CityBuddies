import { state } from '../stores/store.js'

export function use_is_city_id() {
    // determines if the given city ID is present in the list of cities
    async function is_city_id(target_id) {
        let matches = Object.values(state.cities_list).filter(entry => String(entry["value"]) == String(target_id))
        return matches.length > 0
  }
  return { is_city_id }
}