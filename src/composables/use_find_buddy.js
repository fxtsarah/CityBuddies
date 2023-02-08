export function use_find_buddy() {
    // method called when the exact target city id is known and the program wants to find that city's buddy.
    function find_buddy(list, target_id) {

        let buddy_entry = null
        let target_entry = Object.values(list).filter(entry => String(entry["value"]) == String(target_id))[0]

        // find the index of the target city entry in the list of all the city entries
        var target_city_index = list.indexOf(target_entry)

        // edge cases for when the city is at the from or back of the list and only has one neighbor.
        if (target_city_index == 0) {
            buddy_entry = list[1]
        }

        else if (target_city_index == list.length - 1) {
            buddy_entry = list[list.length - 2]
        }

        else {
            // if the city is not at the very front or very back of the list, then it has two possible buddies:
            // the two city entries adjacent to it. Find which of these two neighbors is closest in population
            // to the target city -> that is the buddy.
            var bigger_neighbor_index = target_city_index + 1
            var smaller_neighbor_index = target_city_index - 1

            var bigger_neighbor_entry = list[bigger_neighbor_index]
            var smaller_neighbor_entry = list[smaller_neighbor_index]

            var target_city_pop = parseInt(target_entry["population"])
            var bigger_neighbor_pop = parseInt(bigger_neighbor_entry["population"])
            var smaller_neighbor_pop = parseInt(smaller_neighbor_entry["population"])

            var bigger_neighbor_diff = bigger_neighbor_pop - target_city_pop
            var smaller_neighbor_diff = target_city_pop - smaller_neighbor_pop

            if (bigger_neighbor_diff < smaller_neighbor_diff) {
                buddy_entry = bigger_neighbor_entry
            }
            else {
                buddy_entry = smaller_neighbor_entry
            }
        }
        return buddy_entry
    }
    return { find_buddy }
}