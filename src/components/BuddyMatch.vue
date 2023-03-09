<template>
    <div>
        <router-view />
        <div id='buddy-match-info' v-if='!infoLoading'>
            <h3 class='above-divider'><strong>{{ targetLabel }}</strong> is buddies with <strong>{{ buddyDict[0].label }}</strong></h3>
            <div class='divider'></div>
            <div class='below-divider'>
                
                <BuddyTable v-if='numCities < 8' :tableDict='tableDict' />

                <div v-if='numCities >= 8' class="d-flex">
                    <BuddyTable :tableDict='getFirstHalf(tableDict)' />
                    <BuddyTable :tableDict='getSecondHalf(tableDict)' />
                </div>

                <div id='other-buddies' class='d-block'>
                    <div class='d-flex' style='flex-direction: column;'>
                        <div class='mt-2 d-flex' style='margin: auto;'>
                            <h4 class='mb-0'>See</h4> 
                            <div class='dropdown'>
                                <!--  -->
                                <button class='btn dropdown-toggle mt-1 mx-1' type='button' id='dropdown-menu-button' @keydown.enter='dropdownActive = !dropdownActive' @click='dropdownActive = !dropdownActive' aria-haspopup='true' aria-expanded='false' tabindex='0'>
                                    {{ numCities }}
                                </button>
                                <!-- aria-labelledby='dropdown-menu-button' -->
                                <div class='dropdown-menu is-active' :class="{ 'is-active': dropdownActive}">
                                    <p class='dropdown-item' @keydown.enter='changeNumCities(2)' @click='changeNumCities(2)' tabindex='0'>2</p>
                                    <p class='dropdown-item' @keydown.enter='changeNumCities(5)' @click='changeNumCities(5)' tabindex='0'>5</p>
                                    <p class='dropdown-item' @keydown.enter='changeNumCities(10)' @click='changeNumCities(10)' tabindex='0'>10</p>
                                    <p class='dropdown-item' @keydown.enter='changeNumCities(15)' @click='changeNumCities(15)' tabindex='0'>15</p>
                                </div>
                            </div>
                            <h4 class='mb-0'>{{ numCities == 1 ? 'city' : 'cities' }}</h4>
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
import BuddyTable from './BuddyTable.vue'

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

// Number of cities to show
let numCities = ref(2)

// Target and buddy city info.
let targetLabel = ref('')
let targetCountry = ref('')
let targetPop = ref('')

let buddyDict = ref([])

// True if the target and buddy information has not loaded yet.
let infoLoading = ref(true)

// True if num buddies has been changes and the new infomration has not loaded yet.
let buddiesLoading = ref(false)

let dropdownActive = ref(false)

// On mount, calculate the target and buddy city info with the ID's in the params.
onMounted(async () => {
    window.addEventListener('keydown.esc', () => {alert("hi")})

    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPop.value = formatPopulation(idToPop(route.params.targetId))

    await changeNumCities(2)

    infoLoading.value = false
})

// Determines if the screen is small enough that the "see more cities" need to be on separate lines.
const isSmallScreen = computed(() => {
    return window.innerWidth < 1000
})

// Determines if the screen is small enough that the "see more cities" need to be on separate lines.
const tableDict = computed(() => {
    let targetInfo = {id: route.params.targetId, label: targetLabel.value, country: targetCountry.value, population: targetPop.value}
    return [targetInfo, ...buddyDict.value]
})

async function changeNumCities(newNumCities) {

    buddiesLoading.value = true

    numCities.value = newNumCities
    buddyDict.value = await findBuddies(newNumCities - 1)

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

function getFirstHalf(list) {
    let returnList = []
    for (let i = 0; i < Math.floor((list.length / 2)); i++){
        returnList.push(list[i])
        console.log(`push to first half, index ${i}: ${JSON.stringify(list[i])}`)
    }
    return returnList
}

function getSecondHalf(list) {
    let returnList = []
    for (let i = Math.floor((list.length / 2)); i < list.length; i++){
        returnList.push(list[i])
        console.log(`push to second half, index ${i}: ${JSON.stringify(list[i])}`)
    }
    return returnList
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

#buddies-loading {
    color: $secondary;
    font-style: italic;
}

#dropdown-menu-button {
    width: 5rem;
    // margin-right: 1rem;
    // margin-left: 1rem;
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
