export function useDeleteDupes() {
    // deletes duplicates from the list that get_cities_dupes() returns
    // by only taking the first instance of every id in the list, only the most recent population record is saved,
    // since the list is sorted by population date.
    async function deleteDupes(listWithDupes) {
        let listNoDupes = []
        let citiesAdded = []
        for (let i = 0; i < listWithDupes.length; i++) {
            let entry = listWithDupes[i]
            if (!citiesAdded.includes(entry.city.value)) {
                citiesAdded.push(entry.city.value)
                listNoDupes.push(entry.city)
            } 
        }
        return listNoDupes    
    }
    return { deleteDupes }
}