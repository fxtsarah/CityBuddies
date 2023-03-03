<template>
    <div>
        <router-view />
        <div id='buddy-match-info' v-if='!infoLoading'>
            <h3 class='above-divider'><strong>{{ targetLabel }}</strong> is buddies with <strong>{{ buddyDict[0].label }}</strong></h3>
            <div class='divider'></div>
            <div class='below-divider'>
                <table class='pop-table'>
                    <tr class='table-header'>
                        <th>City</th>
                        <th>Population</th>
                    </tr>
                    <tr>
                        <td class='city-cell'>{{ targetLabel }}, {{ targetCountry }}</td>
                        <td>{{ targetPop }}</td>
                    </tr>
                    <tr v-for='entry in buddyDict' :key='entry'>
                        <td class='city-cell'><router-link :to="{ name: 'match-redirect', params: { targetId: entry.id } }">{{ entry.label }}, {{ entry.country }}</router-link></td>
                        <td>{{ entry.population }}</td>
                    </tr>
                </table>

                <div id='other-buddies' class='d-block'>
                    <div class='d-flex' style='flex-direction: column;'>
                        <div class='mt-2 d-flex' style='margin: auto;'>
                            <h4 class='mb-0'>See</h4> 
                            <div class='dropdown'>
                                <button class='btn dropdown-toggle mt-1' type='button' id='dropdown-menu-button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' tabindex='0'>
                                    {{ numBuddies }}
                                </button>
                                <div class='dropdown-menu' aria-labelledby='dropdown-menu-button'>
                                    <p class='dropdown-item' @keydown.enter='changeNumBuddies(1)' @click='changeNumBuddies(1)' tabindex='0'>1</p>
                                    <p class='dropdown-item' @keydown.enter='changeNumBuddies(3)' @click='changeNumBuddies(3)' tabindex='0'>3</p>
                                    <p class='dropdown-item' @keydown.enter='changeNumBuddies(5)' @click='changeNumBuddies(5)' tabindex='0'>5</p>
                                    <p class='dropdown-item' @keydown.enter='changeNumBuddies(10)' @click='changeNumBuddies(10)' tabindex='0'>10</p>
                                </div>
                            </div>
                            <h4 class='mb-0 text-nowrap'>{{ numBuddies == 1 ? 'city' : 'cities' }} with a similar population to</h4>
                            <h4 class='showBigScreen ms-2'>{{ targetLabel }}</h4>
                        </div>
                    </div>
                    <h4 class='showSmallScreen'>{{ targetLabel }}</h4>
                </div>
            </div>
        </div>
        <h4 v-if='!infoLoading && buddiesLoading' id='buddies-loading'>Buddies are loading, please wait...</h4>
        <Map :active='!infoLoading' :targetId='route.params.targetId' :targetLabel='targetLabel' :buddies='buddyDict' />
    </div>  
</template>

<script setup>

// Vue imports.
import { ref, onMounted, computed } from 'vue'
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

// True if num buddies has been changes and the new infomration has not loaded yet.
let buddiesLoading = ref(false)

// On mount, calculate the target and buddy city info with the ID's in the params.
onMounted(async () => {
    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPop.value = formatPopulation(idToPop(route.params.targetId))

    await changeNumBuddies(1)

    infoLoading.value = false
})

// Determines if the screen is small enough  that the "see more cities" need to be on separate lines.
const isSmallScreen = computed(() => {
    return window.innerWidth < 1000
})

async function changeNumBuddies(newNumBuddies) {

    buddiesLoading.value = true

    numBuddies.value = newNumBuddies
    buddyDict.value = await findBuddies(newNumBuddies)

    buddiesLoading.value = false
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

.showSmallScreen {
    display: none;
}

.pop-table {
    margin-left: auto;
    margin-right: auto;
    text-align: left;
    border-collapse: collapse; 
    font-size: 1.75rem;
}
.table-header {
    // border-bottom: 2px solid $primary;
    font-weight: 800;
}

td, th {
    padding: .5rem;
}

.city-cell {
    padding-right: 3rem;
}

.city-cell a {
    color: $primary;
}

.city-cell a:hover, .city-cell a:focus {
    color: $secondary;
    text-decoration: none;
}

#buddies-loading {
    color: $secondary;
    font-style: italic;
}

#dropdown-menu-button:focus {
    border: 1px solid $secondary;
}

@media screen and (max-width: 1000px) {
    .showSmallScreen {
        display: unset;
    }

    .showBigScreen {
        display: none;
    }
}

</style>
