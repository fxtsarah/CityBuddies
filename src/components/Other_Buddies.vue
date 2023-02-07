<template>
    <div v-if="info_loaded">
        <h3 class="above_divider"><strong>{{ state.last_submitted_value }}, {{ target_country }}: {{ Number(remove_euro_format(state.target_city_entry.population)).toLocaleString("en-US") }}</strong></h3>
        <div class="divider"></div>
        <ul class="below_divider" id="other_buddies">
            <li v-for="entry in buddies_list" :key="entry" tabindex="0" >
                <h4>{{ entry.label }}, {{ entry.country }}: {{ Number(remove_euro_format(entry.population)).toLocaleString("en-US") }}</h4>
            </li>
        </ul>
    </div>
    <Map :active="info_loaded" :target_id="state.target_city_entry.value" :target_label="state.last_submitted_value" :buddies="buddies_list"/>
</template>

<script setup>

import { onMounted, ref } from 'vue'
import { use_find_buddy } from '../composables/use_find_buddy'
import {use_submit_query} from '../composables/use_submit_query.js'
import { use_remove_euro_format } from '../composables/use_remove_euro_format.js'

// import components
import Map from "./Map.vue"

// import state
import { state } from '../stores/store.js'


let { find_buddy } = use_find_buddy()
let { submit_query } = use_submit_query()
let { remove_euro_format } = use_remove_euro_format()

let buddies_list = ref([])
let target_country = ref("")
let info_loaded = ref(false)

onMounted( async () => {
  buddies_list.value = await find_buddies_label(5)
  target_country.value = await id_to_country(state.target_city_entry.value)

  info_loaded.value = true
})

async function find_buddies_label(amt) {
    let buddies_id = find_buddies_id(amt)
    let buddies_label = []
    for (let i = 0; i < buddies_id.length; i++) {
        buddies_label.push({id: buddies_id[i].value,  label: await id_to_label(buddies_id[i].value), country: await id_to_country(buddies_id[i].value),  population: buddies_id[i].population})
    }
    return buddies_label
}

// get the name of a city given its ID
async function id_to_label(target_id) {
  var query = `SELECT DISTINCT ?cityLabel {
                VALUES ?city { wd:${target_id}} 
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                }`
  var result = await submit_query(query)
  return result[0]["cityLabel"]
}

// get the country a city is located in given the city's ID
async function id_to_country(target_id) {
  var query = `SELECT DISTINCT ?countryLabel {
              VALUES ?city { wd:${target_id}} 
              ?city wdt:P17 ?country .
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
              }`
  var result = await submit_query(query)
  return result[0]["countryLabel"]
}

// return of list of the 'amt' cities closet in population to the target city entry
function find_buddies_id(amt) {
  let list = state.cities_list.slice()
  let buddies = []
  for (let i = 0; i < amt; i++){
    let buddy = find_buddy(list)
    buddies.push(buddy)
    list = remove(list, buddy)
  }
  return buddies
}

function remove(list, item) {
  let index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  }
  return list;
}

</script>

<style>



</style>