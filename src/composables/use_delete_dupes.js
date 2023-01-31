export function use_delete_dupes() {
    // deletes duplicates from the list that get_cities_dupes() returns
    // by only taking the first instance of every id in the list, only the most recent population record is saved,
    // since the list is sorted by population date.
    async function delete_dupes(list_with_dupes) {
        var list_no_dupes = []
        var cities_added = []
        for (let i = 0; i < list_with_dupes.length; i++) {
            var entry = list_with_dupes[i]
            if (!cities_added.includes(entry["city"]["value"])) {
                cities_added.push(entry["city"]["value"])
                list_no_dupes.push(entry["city"])
            } 
        }
    return list_no_dupes    
    }

    return { delete_dupes }
}