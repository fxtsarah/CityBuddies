<template>
    
</template>

<script setup>
// import state
import { onMounted } from 'vue'
import { state } from '../stores/store.js'
import { useRouter, useRoute } from 'vue-router';

// import composables
import { use_find_buddy } from '../composables/use_find_buddy'
import {use_submit_query} from '../composables/use_submit_query.js'
import {use_delete_dupes} from '../composables/use_delete_dupes.js'
import {use_remove_euro_format} from '../composables/use_remove_euro_format.js'

// extract functions from composables
let { submit_query } = use_submit_query()
let { delete_dupes } = use_delete_dupes()
let { find_buddy } = use_find_buddy()
let { remove_euro_format } = use_remove_euro_format()
const router = useRouter()
const route = useRoute()


onMounted(async () => {
    await input_submit(route.params.target_label)
})

// // get the list of all the cities. Each entry includes the ID and population.
// async function get_cities_list() {
//   var cities_dupes = await get_cities_dupes()
//   var cities_no_dupes = await delete_dupes(cities_dupes)
//   var cities_pop_sorted = await sort_by_pop(cities_no_dupes)
//   return cities_pop_sorted
// }

// // get a list of all the cities from wikidata, without removing duplicate entries.
// // cities without a population, without a point in time associated with that population, 
// // or with a point in time earlier that 2000 are excluded.
// // Sort these cities by the date at which their population was recorded so that when we remove duplicates,
// // we keep the most recent population from every city.
// async function get_cities_dupes() {
//   var query = `SELECT DISTINCT ?city ?cityPopulation WHERE { 
//                 ?city wdt:P31/wdt:P279* wd:Q515 . 
//                 ?city p:P1082 ?populationStatement . 
//                 ?populationStatement ps:P1082 ?cityPopulation.
//                 ?populationStatement pq:P585 ?date
//                 SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
//                 FILTER("2000-01-01"^^xsd:dateTime <= ?date)
//               } 
//               ORDER BY DESC(?date)`
//               // this code excludes cities that don't have a label, although it makes the program run more slowly.
//                 // filter exists {                          
//                 //   ?city rdfs:label ?enLabel .                    
//                 //   filter(langMatches(lang(?enLabel),"en"))   
//                 // }
//   var result = await submit_query(query)
//   return result
// }

// // sorts a list of all the cities by population
// async function sort_by_pop(list) {
//   list.sort(
//     (first, second) => { 
//       return remove_euro_format(first.population) - remove_euro_format(second.population) }
//   );
// return list
// }



// method called when the user clicks the 'search for buddy' button
async function input_submit(input)  {
  
  //look for any cities that share a name with the inputted value.
  state.possible_target_cities = await find_possible_matches(input)

  // if there were no cities found with the same name, show a message stating that the city couldn't be found
  if (state.possible_target_cities.length == 0) {
    let label = route.params.target_label
    router.push({ name: 'city-not-found', params: { target_label: label } })
  }

  // if there is only one city found with the same name, automatically choose that city as the target and search for its buddy
  else if (state.possible_target_cities.length == 1) {
    chosen_target(state.possible_target_cities[0]["value"])
    // router.push({ name: 'match', params: { target_id: state.target_city_entry.value } })
  }

  // if there are multiple cities found with the same name, allow the user to select which one they want before searching for a buddy
  else {
    let label = route.params.target_label
    router.push({ name: 'disambiguation', params: { target_label: label } })
  }
}

// Given a string, output all the cities with a label or alternate label that matches the input
async function find_possible_matches(target_label) {

// escape any quotes present in the input so the query doesn't break
var no_quotes = target_label.replace("\'", "\\'");
    
var query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
              WHERE
              { 
              ?city wdt:P31/wdt:P279* wd:Q515 .
              { ?city skos:altLabel \'${no_quotes}\'@en }
              UNION
              { ?city rdfs:label \'${no_quotes}\'@en }
              ?city wdt:P1082 ?population .
                                  
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
              } ORDER BY DESC (?population)`
    
var result = await submit_query(query)

// remove duplicate cities from the result
var no_dupes = await delete_dupes(result)
return no_dupes
}

// TODO chosen target as composable????? also in disamb.
// or not?

// method called when a target city is chosen, 
// either automatically because there was only one city that matched the inputted name,
// or manually because the user selected the city from the disambiguation page
function chosen_target(target_id) {
  state.target_city_entry = Object.values(state.cities_list).filter(entry => String(entry["value"]) == String(target_id))[0]
  state.buddy_city_entry = find_buddy(state.cities_list)
  router.push({ name: 'match', params: { target_id: target_id, buddy_id: state.buddy_city_entry.value } })
}

</script>
