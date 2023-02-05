<template>
  <Banner :list_loading="list_loading" @input_submit="input_submit"/>
  <router-view :list_loading = "list_loading" :cities_list = "cities_list" :last_submitted_value="last_submitted_value"/>
</template>

<script setup>
// vue imports
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';

// import components
import Banner from "./components/Banner.vue"

// import composables
import { use_submit_query } from './composables/use_submit_query.js'
import { use_remove_euro_format } from './composables/use_remove_euro_format.js'
import { use_delete_dupes } from './composables/use_delete_dupes.js'

// extract functions from composables and router
let { submit_query } = use_submit_query()
let { remove_euro_format } = use_remove_euro_format()
let { delete_dupes } = use_delete_dupes()
const router = useRouter()

// the list of all the cities and their poplation, sorted by population
let cities_list = ref([])

// true if the cities list had not yet been generated 
let list_loading = ref(true)

// contains the last value that the user submitted
let last_submitted_value = ref("")

// When the app is mounted, calculate the cities list.
// After the list is calculated, set list_loading to false.
onMounted(async () => {
  cities_list.value = await get_cities_list()
  list_loading.value = false
})

// when an input_event event is emitted, first direct the user to the home page,
// then update the last submitted value with the new input.
async function input_submit(input) {
  await router.push("/")
  last_submitted_value.value = input
}

// get the list of all the cities. Each entry includes the ID and population.
async function get_cities_list() {
  var cities_dupes = await get_cities_dupes()
  var cities_no_dupes = await delete_dupes(cities_dupes)
  var cities_pop_sorted = await sort_by_pop(cities_no_dupes)
  return cities_pop_sorted
}

// get a list of all the cities from wikidata, without removing duplicate entries.
// cities without a population, without a point in time associated with that population, 
// or with a point in time earlier that 2000 are excluded.
// Sort these cities by the date at which their population was recorded so that when we remove duplicates,
// we keep the most recent population from every city.
async function get_cities_dupes() {
  var query = `SELECT DISTINCT ?city ?cityPopulation WHERE { 
                ?city wdt:P31/wdt:P279* wd:Q515 . 
                ?city p:P1082 ?populationStatement . 
                ?populationStatement ps:P1082 ?cityPopulation.
                ?populationStatement pq:P585 ?date
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
                FILTER("2000-01-01"^^xsd:dateTime <= ?date)
              } 
              ORDER BY DESC(?date)`
              // this code excludes cities that don't have a label, although it makes the program run more slowly.
                // filter exists {                          
                //   ?city rdfs:label ?enLabel .                    
                //   filter(langMatches(lang(?enLabel),"en"))   
                // }
  var result = await submit_query(query)
  return result
}

// sorts a list of all the cities by population
async function sort_by_pop(list) {
  list.sort(
    (first, second) => { 
      return remove_euro_format(first.population) - remove_euro_format(second.population) }
  );
return list
}

</script>



