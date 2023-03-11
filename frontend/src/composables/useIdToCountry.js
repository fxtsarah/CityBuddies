// Import API.
import Api from '../Api'

export function useIdToCountry() {
    // Get the country a city is located in given the city's ID
    async function idToCountry(id) {
        return (await Api().get(`id/${id}/country`)).data
    }
    return { idToCountry }
}
