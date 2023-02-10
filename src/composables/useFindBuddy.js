export function useFindBuddy() {
    // Method called when the exact target city ID is known and the program wants to find that city's buddy.
    function findBuddy(list, targetId) {

        let buddyEntry = null
        let targetEntry = Object.values(list).filter(entry => String(entry.value) == String(targetId))[0]

        // Find the index of the target city entry in the list of all the city entries.
        let targetCityIndex = list.indexOf(targetEntry)

        // Edge cases for when the city is at the from or back of the list and only has one neighbor.
        if (targetCityIndex == 0) {
            buddyEntry = list[1]
        }

        else if (targetCityIndex == list.length - 1) {
            buddyEntry = list[list.length - 2]
        }

        else {
            // If the city is not at the very front or very back of the list, then it has two possible buddies:
            // the two city entries adjacent to it. 
            // Find which of these two neighbors is closest in population to the target city -> that is the buddy.
            let biggerNeighborIndex = targetCityIndex + 1
            let smallerNeighborIndex = targetCityIndex - 1

            let biggerNeighborEntry = list[biggerNeighborIndex]
            let smallerNeighborEntry = list[smallerNeighborIndex]

            let targetCityPop = parseInt(targetEntry.population)
            let biggerNeighborPop = parseInt(biggerNeighborEntry.population)
            let smallerNeighborPop = parseInt(smallerNeighborEntry.population)

            let biggerNeighborDiff = biggerNeighborPop - targetCityPop
            let smallerNeighborDiff = targetCityPop - smallerNeighborPop

            if (biggerNeighborDiff < smallerNeighborDiff) {
                buddyEntry = biggerNeighborEntry
            }
            else {
                buddyEntry = smallerNeighborEntry
            }
        }
        return buddyEntry
    }
    return { findBuddy }
}