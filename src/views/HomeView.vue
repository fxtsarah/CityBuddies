<template>
   <router-view @chosen_target="chosen_target" :buddy_entry="buddy_city_entry"/>
</template>

<script setup>
// vue imports
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { use_find_buddy } from '../composables/use_find_buddy'

// import state
import { state } from '../stores/store.js'

// import composables
import { use_submit_query } from '../composables/use_submit_query.js'
import { use_delete_dupes } from '../composables/use_delete_dupes.js'

// extract functions from composables
let { submit_query } = use_submit_query()
let { delete_dupes } = use_delete_dupes()
let { find_buddy } = use_find_buddy()
const router = useRouter()

// entries include the id and population
// let target_city_entry = ref({"value":"", "population":0})
let buddy_city_entry = ref({"value":"", "population":0})

// // method called when the user clicks the 'search for buddy' button
// async function input_submit(input)  {
  
//   //look for any cities that share a name with the inputted value.
//   state.possible_target_cities = await find_possible_matches(input)

//   // if there were no cities found with the same name, show a message stating that the city couldn't be found
//   if (state.possible_target_cities.length == 0) {
//     let label = state.last_submitted_value
//     router.push({ name: 'city-not-found', params: { target_label: label } })
//   }

//   // if there is only one city found with the same name, automatically choose that city as the target and search for its buddy
//   else if (state.possible_target_cities.length == 1) {
//     await chosen_target(state.possible_target_cities[0]["value"])
//     router.push({ name: 'match', params: { target_id: state.target_city_entry.value } })
//   }

//   // if there are multiple cities found with the same name, allow the user to select which one they want before searching for a buddy
//   else {
//     let label = state.last_submitted_value
//     router.push({ name: 'disambiguation', params: { target_label: label } })
//   }
// }

// // Given a string, output all the cities with a label or alternate label that matches the input
// async function find_possible_matches(target_label) {

//   // escape any quotes present in the input so the query doesn't break
//   var no_quotes = target_label.replace("\'", "\\'");
      
//   var query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
//                 WHERE
//                 { 
//                 ?city wdt:P31/wdt:P279* wd:Q515 .
//                 { ?city skos:altLabel \'${no_quotes}\'@en }
//                 UNION
//                 { ?city rdfs:label \'${no_quotes}\'@en }
//                 ?city wdt:P1082 ?population .
                                    
//                 SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
//                 } ORDER BY DESC (?population)`
      
//   var result = await submit_query(query)

//   // remove duplicate cities from the result
//   var no_dupes = await delete_dupes(result)
//   return no_dupes
// }

// method called when a target city is chosen, 
// either automatically because there was only one city that matched the inputted name,
// or manually because the user selected the city from the disambiguation page
function chosen_target(target_id) {
  // state.target_city_entry = Object.values(state.cities_list).filter(entry => String(entry["value"]) == String(target_id))[0]
  // buddy_city_entry.value = find_buddy(state.cities_list)
  console.log("chosen_target in HomeView called!")
  router.push({ name: 'match', params: { target_id: target_id, buddy_id: find_buddy(state.cities_list) } })
}


// // whenever the last_submitted_value changes, assume the new value was just submitted and process it.
// watch(()=>state.last_submitted_value, async (new_input) => {
//   await input_submit(new_input)
// })

</script>