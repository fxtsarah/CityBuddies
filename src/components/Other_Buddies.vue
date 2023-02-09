<template>
    <div v-if="!info_loading">
        <h3 class="above_divider"><strong>{{ target_label }}, {{ target_country }}: {{ target_population }}</strong></h3>
        <div class="divider"></div>
        <ul class="below_divider" id="other_buddies">
            <li v-for="entry in buddies_list" :key="entry" tabindex="0" class="other-buddy">
                <h4>{{ entry.label }}, {{ entry.country }}: {{ format_population(entry.population)}}</h4>
            </li>
        </ul>
    </div>
    <Map :active="!info_loading" :target_id="route.params.target_id" :target_label="target_label" :buddies="buddies_list"/>
</template>

<script setup>

// vue imports
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// import state
import { state } from '../stores/store.js'

// import composables
import { use_find_buddy } from '../composables/use_find_buddy.js'
import { use_format_population } from '../composables/use_format_population.js'
import { use_id_to_label } from '../composables/use_id_to_label.js'
import { use_id_to_country } from '../composables/use_id_to_country.js'
import { use_id_to_pop } from '../composables/use_id_to_pop.js'

// import components
import Map from "./Map.vue"

// extract functions from composables
let { find_buddy } = use_find_buddy()
let { format_population } = use_format_population()
let { id_to_label } = use_id_to_label()
let { id_to_country } = use_id_to_country()
let { id_to_pop } = use_id_to_pop()

// extract router info
const route = useRoute()

// the list of all the buddies to be shown on the map
// each buddy entry contains an id, label, country, and population
let buddies_list = ref([])

// target city info
let target_label = ref("")
let target_country = ref("")
let target_population = ref("")

// true if the target and buddy information has not loaded yet
let info_loading = ref(true)

onMounted( async () => {
    buddies_list.value = await find_buddies_label(5)

    target_label.value = await id_to_label(route.params.target_id)
    target_country.value = await id_to_country(route.params.target_id)
    target_population.value = format_population(id_to_pop(route.params.target_id))

    info_loading.value = false
})

// return of list of the 'amt' cities closest in population to the target city
// the list contains the labels of the buddies
async function find_buddies_label(amt) {
    let buddies_id = find_buddies_id(amt)
    let buddies_label = []
    for (let i = 0; i < buddies_id.length; i++) {
        buddies_label.push({id: buddies_id[i].value,  label: await id_to_label(buddies_id[i].value), country: await id_to_country(buddies_id[i].value),  population: buddies_id[i].population})
    }
    return buddies_label
}

// return of list of the 'amt' cities closest in population to the target city
// the list contains the id's of the buddies
function find_buddies_id(amt) {
    let list = state.cities_list.slice()
    let buddies = []
    for (let i = 0; i < amt; i++) {
        let buddy = find_buddy(list, route.params.target_id)
        buddies.push(buddy)
        list = remove(list, buddy)
    }
    return buddies
}

// removes an item from the list wihtout modifying the original list
function remove(list, item) {
    let index = list.indexOf(item);
    if (index > -1) {
        list.splice(index, 1);
    }
    return list;
}

</script>

<style>

/* #other_buddies {
    padding-left: 0;
} */

@media screen and (max-width: 900px) {
    .other-buddy {
        width: 90%;
        margin-bottom: 25px;
    }
}

</style>