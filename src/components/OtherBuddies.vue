<template>
    <div v-if="!infoLoading">
        <h3 class="aboveDivider"><strong>{{ targetLabel }}, {{ targetCountry }}: {{ targetPopulation }}</strong></h3>
        <div class="divider"></div>
        <ul class="belowDivider" id="otherBuddies">
            <li v-for="entry in buddiesList" :key="entry" tabindex="0" class="other-buddy">
                <h4>{{ entry.label }}, {{ entry.country }}: {{ formatPopulation(entry.population)}}</h4>
            </li>
        </ul>
    </div>
    <Map :active="!infoLoading" :targetId="route.params.targetId" :targetLabel="targetLabel" :buddies="buddiesList"/>
</template>

<script setup>

// vue imports
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// import state
import { state } from '../stores/store.js'

// import composables
import { useFindBuddy } from '../composables/useFindBuddy.js'
import { useFormatPopulation } from '../composables/useFormatPopulation.js'
import { useIdToLabel } from '../composables/useIdToLabel.js'
import { useIdToCountry } from '../composables/useIdToCountry.js'
import { useIdToPop } from '../composables/useIdToPop.js'

// import components
import Map from "./Map.vue"

// extract functions from composables
let { findBuddy } = useFindBuddy()
let { formatPopulation } = useFormatPopulation()
let { idToLabel } = useIdToLabel()
let { idToCountry } = useIdToCountry()
let { idToPop } = useIdToPop()

// extract router info
const route = useRoute()

// the list of all the buddies to be shown on the map
// each buddy entry contains an id, label, country, and population
let buddiesList = ref([])

// target city info
let targetLabel = ref("")
let targetCountry = ref("")
let targetPopulation = ref("")

// true if the target and buddy information has not loaded yet
let infoLoading = ref(true)

onMounted( async () => {
    buddiesList.value = await findBuddiesLabel(5)

    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPopulation.value = formatPopulation(idToPop(route.params.targetId))

    infoLoading.value = false
})

// return of list of the 'amt' cities closest in population to the target city
// the list contains the labels of the buddies
async function findBuddiesLabel(amt) {
    let buddiesId = findBuddiesId(amt)
    let buddiesLabel = []
    for (let i = 0; i < buddiesId.length; i++) {
        buddiesLabel.push({id: buddiesId[i].value,  label: await idToLabel(buddiesId[i].value), country: await idToCountry(buddiesId[i].value),  population: buddiesId[i].population})
    }
    return buddiesLabel
}

// return of list of the 'amt' cities closest in population to the target city
// the list contains the id's of the buddies
function findBuddiesId(amt) {
    let list = state.citiesList.slice()
    let buddies = []
    for (let i = 0; i < amt; i++) {
        let buddy = findBuddy(list, route.params.targetId)
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

@media screen and (max-width: 900px) {
    .otherBuddy {
        width: 90%;
        margin-bottom: 25px;
    }
}

</style>