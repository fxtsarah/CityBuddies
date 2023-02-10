// Import state.
import { state } from '../stores/store.js'

export function useIdToPop() {
    // Get the population of a city given the city's ID.
    function idToPop(targetId) {
        let entry = Object.values(state.citiesList).filter(entry => String(entry["value"]) == String(targetId))[0]
        return entry.population
    }
return { idToPop }
}