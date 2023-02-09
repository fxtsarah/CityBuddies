// import composables
import { use_submit_query } from './use_submit_query.js'

// extract functions from composables
let { submit_query } = use_submit_query()

export function use_id_to_label() {
    // get the name of a city given its ID
    async function id_to_label(target_id) {
        let query = `SELECT DISTINCT ?cityLabel {
                    VALUES ?city { wd:${target_id}} 
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
        try {
            let result = await submit_query(query)
            return result[0]["cityLabel"]
        }
        catch(error) {
            throw new Error(error)
        }
        
    }
    return { id_to_label }
}