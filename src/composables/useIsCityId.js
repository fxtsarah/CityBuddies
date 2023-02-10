// Import state
import { state } from '../stores/store.js'

export function useIsCityId() {
    // Determines if the given city ID is present in the list of cities.
    function isCityId(targetId) {
        let matches = Object.values(state.citiesList).filter(entry => String(entry.value) == String(targetId))
        return matches.length > 0
  }
  return { isCityId }
}