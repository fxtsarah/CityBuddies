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

// Vue imports.
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

// Import state.
import { state } from '../stores/store.js'

// Import composables.
import { useFindBuddy } from '../composables/useFindBuddy.js'
import { useFormatPopulation } from '../composables/useFormatPopulation.js'
import { useIdToLabel } from '../composables/useIdToLabel.js'
import { useIdToCountry } from '../composables/useIdToCountry.js'
import { useIdToPop } from '../composables/useIdToPop.js'

// Import components.
import Map from "./Map.vue"

// Extract functions from composables.
let { findBuddy } = useFindBuddy()
let { formatPopulation } = useFormatPopulation()
let { idToLabel } = useIdToLabel()
let { idToCountry } = useIdToCountry()
let { idToPop } = useIdToPop()

// Extract router info.
const route = useRoute()

// The list of all the buddies to be shown on the map.
// Each buddy entry contains an id, label, country, and population.
let buddiesList = ref([])

// Target city info.
let targetLabel = ref("")
let targetCountry = ref("")
let targetPopulation = ref("")

// True if the target and buddy information has not loaded yet.
let infoLoading = ref(true)

// Updates the target city info and generates the buddies lest when the component is mounted.
onMounted(async () => {
    buddiesList.value = await findBuddies(5)

    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPopulation.value = formatPopulation(idToPop(route.params.targetId))

    infoLoading.value = false
})

// Return of list of the 'amt' cities closest in population to the target city.
async function findBuddies(amt) {
    let list = state.citiesList.slice()
    let buddies = []
    for (let i = 0; i < amt; i++) {
        // Get the city that is closest in population to the target city that has not yet been chosen.
        let buddy = findBuddy(list, route.params.targetId)

        // Add the ID, Label, country, and population information to the list of buddies
        let buddyId = buddy.value
        let buddyLabel = await idToLabel(buddyId)
        let buddyCountry = await idToCountry(buddyId)
        let buddyPop = buddy.population
        let buddyInfo = {id: buddyId, label: buddyLabel, country: buddyCountry,  population: buddyPop}
        buddies.push(buddyInfo)

        // Remove the city that was just added from the list so we don't add it again
        list = remove(list, buddy)
    }
    return buddies
}

// Removes an item from the list wihtout modifying the original list.
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