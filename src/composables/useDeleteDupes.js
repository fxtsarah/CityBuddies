export function useDeleteDupes() {
    // Deletes duplicates from the list that get_cities_dupes() returns.
    // By only taking the first instance of every id in the list, only the most recent population record is saved,
    // since the list is sorted by population date.
    async function deleteDupes(listWithDupes) {
        // The working list of all the cities, without any cities with the same ID.
        let listNoDupes = []
        // The list of the city IDs that have already been added.
        let citiesAdded = []

        // Loop though every city one, beginning with the ones that have the most recent population record.
        for (let i = 0; i < listWithDupes.length; i++) {
            let entry = listWithDupes[i]
            // If a city with this ID, has not already been added, add this entry to the list.
            if (!citiesAdded.includes(entry.city.value)) {
                citiesAdded.push(entry.city.value)
                listNoDupes.push(entry.city)
            } 
        }
        return listNoDupes    
    }
    return { deleteDupes }
}
