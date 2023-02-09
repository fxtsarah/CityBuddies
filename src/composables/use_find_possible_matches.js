// import composables
import { use_submit_query } from './use_submit_query.js'
import { use_delete_dupes } from './use_delete_dupes.js'

// extract functions from composables
let { submit_query } = use_submit_query()
let { delete_dupes } = use_delete_dupes()

export function use_find_possible_matches() {
    // Given a string, output all the cities with a label or alternate label that matches the input
    async function find_possible_matches(target_label) {

        // escape any quotes present in the input so the query doesn't break
        let no_quotes = target_label.replace("\'", "\\'");
            
        let query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
                    WHERE
                    { 
                    ?city wdt:P31/wdt:P279* wd:Q515 .
                    { ?city skos:altLabel \'${no_quotes}\'@en }
                    UNION
                    { ?city rdfs:label \'${no_quotes}\'@en }
                    ?city wdt:P1082 ?population .
                                        
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    } ORDER BY DESC (?population)`
            
        let result = await submit_query(query)
    
        // remove duplicate cities from the result
        let no_dupes = await delete_dupes(result)
        return no_dupes
    }
    return { find_possible_matches }
}