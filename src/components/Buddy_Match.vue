<template>
  <div>
    <div id="buddy_match_info" v-if="info_loaded">
      <h3 class="above_divider"><strong>{{ target_label }}</strong> is buddies with <strong>{{ buddy_label }}</strong></h3>
      <div class="divider"></div>
      <div class="below_divider">
        <h4>Population of {{ target_label }}, {{ target_country }}: <strong>{{ target_pop }}</strong></h4>
        <h4>Population of {{ buddy_label }}, {{ buddy_country }}: <strong>{{ buddy_pop }}</strong></h4>
      </div>
      <router-link :to="{ name: 'other-buddies', params: { target_id: route.params.target_id } }" id="to_other_buddies">See other cities with a similar population to {{ target_label }}</router-link>
    </div>
    <Map :active="info_loaded" :target_id="route.params.target_id" :target_label="target_label" :buddies="buddy_dict" />
  </div>
</template>

<script setup>

// vue imports
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { state } from "../stores/store.js"

// import components
import Map from "./Map.vue"
import Other_Buddies from "./Other_Buddies.vue"

// import composables
import {use_submit_query} from '../composables/use_submit_query.js'
import {use_remove_euro_format} from '../composables/use_remove_euro_format.js'

// extract functions from composables
let { submit_query } = use_submit_query()
let { remove_euro_format } = use_remove_euro_format()
const route = useRoute()

// define props
const props = defineProps(['buddy_entry'])

let target_label = ref("")
let target_country = ref("")
let target_pop = ref("")

let buddy_label = ref("")
let buddy_country = ref("")
let buddy_pop = ref("")

let info_loaded = ref(false)

// formats the buddy as in id, label dictionary
const buddy_dict = computed(() => {
  return [{"id": route.params.buddy_id, "label": buddy_label.value }]
})

// TODO maybe make composable
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

onMounted(async () => {
  target_label.value = await id_to_label(route.params.target_id)
  target_country.value = await id_to_country(route.params.target_id)
  // target_pop.value = Number(remove_euro_format(state.target_city_entry.population)).toLocaleString("en-US")
  target_pop.value = "population!"
  console.log("target stuff loaded")

  buddy_label.value = await id_to_label(route.params.buddy_id)
  buddy_country.value = await id_to_country(route.params.buddy_id)
  // buddy_pop.value = Number(remove_euro_format(props.buddy_entry.population)).toLocaleString("en-US")
  buddy_pop.value = "population!"
  console.log("buddy stuff loaded")

  info_loaded.value = true
})

</script>

<style>

#buddy_match_info {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}

#to_other_buddies {
  font-size: 16px;
}

</style>