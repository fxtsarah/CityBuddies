<template>
    <div>
        <router-view />
        <div id='buddy-match-info' v-if='!infoLoading'>
            <h3 class='above-divider'><strong>{{ targetLabel }}</strong> is buddies with <strong>{{ buddyDict[0].label }}</strong></h3>
            <div class='divider'></div>
            <div class='below-divider'>
                <h4>Population of {{ targetLabel }}, {{ targetCountry }}: <strong>{{ targetPop }}</strong></h4>
                <div v-for='entry in buddyDict' :key='entry'>
                    <h4>Population of {{ entry.label }}, {{ entry.country }}: <strong>{{ entry.population }}</strong></h4>
                </div>
                <div class='d-flex' style='flex-direction: column;'>
                    <div id='other-buddies' class='mt-2 d-flex' style='margin: auto;'>
                        <h4>See</h4> 
                        <div class='dropdown'>
                            <button class='btn dropdown-toggle mt-1' type='button' id='dropdown-menu-button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                {{ numBuddies }}
                            </button>
                            <div class='dropdown-menu' aria-labelledby='dropdown-menu-button'>
                                <p class='dropdown-item' @click='changeNumBuddies(1)'>1</p>
                                <p class='dropdown-item' @click='changeNumBuddies(3)'>3</p>
                                <p class='dropdown-item' @click='changeNumBuddies(5)'>5</p>
                                <p class='dropdown-item' @click='changeNumBuddies(10)'>10</p>
                            </div>
                        </div>
                        <h4>{{ numBuddies == 1 ? 'city' : 'cities' }} with a similar population to {{ targetLabel }}</h4>
                    </div>  
                </div>
            </div>
        </div>
        <Map :active='!infoLoading' :targetId='route.params.targetId' :targetLabel='targetLabel' :buddies='buddyDict' />
    </div>
</template>

<script setup>

// Vue imports.
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Import components.
import Map from './Map.vue'

// Import state.
import { state } from '../stores/store.js'

// Import composables.
import { useFindBuddy } from '../composables/useFindBuddy.js'
import { useFormatPopulation } from '../composables/useFormatPopulation.js'
import { useIdToLabel } from '../composables/useIdToLabel.js'
import { useIdToCountry } from '../composables/useIdToCountry.js'
import { useIdToPop } from '../composables/useIdToPop.js'

// Extract functions from composables.
let { findBuddy } = useFindBuddy()
let { formatPopulation } = useFormatPopulation()
let { idToLabel } = useIdToLabel()
let { idToCountry } = useIdToCountry()
let { idToPop } = useIdToPop()

// Extract route info.
const route = useRoute()

// Number of buddies to show
let numBuddies = ref(1)

// Target and buddy city info.
let targetLabel = ref('')
let targetCountry = ref('')
let targetPop = ref('')

let buddyDict = ref([])

// True if the target and buddy information has not loaded yet.
let infoLoading = ref(true)

// On mount, calculate the target and buddy city info with the ID's in the params.
onMounted(async () => {
    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPop.value = formatPopulation(idToPop(route.params.targetId))

    await changeNumBuddies(1)

    infoLoading.value = false
})

async function changeNumBuddies(newNumBuddies) {
    numBuddies.value = newNumBuddies
    buddyDict.value = await findBuddies(newNumBuddies)
}

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
        let buddyPop = formatPopulation(buddy.population)
        let buddyInfo = {id: buddyId, label: buddyLabel, country: buddyCountry, population: buddyPop}
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

<style lang='scss' scoped>
@import '../../public/constants.scss';

#buddy-match-info {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}

#other-buddies {
    color: $secondary;
}

</style>
