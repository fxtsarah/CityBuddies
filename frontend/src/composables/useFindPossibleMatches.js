// Import API.
import Api from '../Api'

export function useFindPossibleMatches() {
    // Given a string, output all the cities with a label or alternate label that matches the input.
    async function findPossibleMatches(label) {
        return (await Api().get(`cities/findPossibleMatches/${label}`)).data
    }
    return { findPossibleMatches }
}
