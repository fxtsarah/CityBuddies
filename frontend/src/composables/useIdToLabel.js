// Import API.
import Api from '../Api'

export function useIdToLabel() {
    // Get the name of a city given its ID.
    async function idToLabel(id) {
        return (await Api().get(`id/${id}/label`)).data
    }
    return { idToLabel }
}
