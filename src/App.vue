<template>
  <Banner :listLoading="listLoading"/>
  <router-view v-if="!listLoading"/>
</template>

<script setup>

// vue imports
import { ref, onMounted } from 'vue'

// import state
import { state } from './stores/store.js'

// import components
import Banner from "./components/Banner.vue"

// import composables
import { useSubmitQuery } from './composables/useSubmitQuery.js'
import { useRemoveEuroFormat } from './composables/useRemoveEuroFormat.js'
import { useDeleteDupes } from './composables/useDeleteDupes.js'

// extract functions from composables and router
let { submitQuery } = useSubmitQuery()
let { removeEuroFormat } = useRemoveEuroFormat()
let { deleteDupes } = useDeleteDupes()

let listLoading = ref(true)

// When the app is mounted, calculate the cities list.
// After the list is calculated, set list_loading to false.
onMounted(async () => {
    state.citiesList = await getCitiesList()
    listLoading.value = false
})

// get the list of all the cities. Each entry includes the ID and population.
async function getCitiesList() {
    let citiesDupes = await getCitiesDupes()
    let citiesNoDupes = await deleteDupes(citiesDupes)
    let citiesPopSorted = await sortByPop(citiesNoDupes)
    return citiesPopSorted
}

// get a list of all the cities from wikidata, without removing duplicate entries.
// cities without a population, without a point in time associated with that population, 
// or with a point in time earlier that 2000 are excluded.
// Sort these cities by the date at which their population was recorded so that when we remove duplicates,
// we keep the most recent population from every city.
async function getCitiesDupes() {
    let query = `SELECT DISTINCT ?city ?cityPopulation WHERE { 
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
    let result = await submitQuery(query)
    return result
}

// sorts a list of all the cities by population
async function sortByPop(list) {
    list.sort(
        (first, second) => { 
        return removeEuroFormat(first.population) - removeEuroFormat(second.population) }
    );
return list
}

</script>