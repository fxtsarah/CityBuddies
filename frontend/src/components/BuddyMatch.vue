<template>
    <div>
        <router-view />
        <div id='buddy-match-info' v-if='!infoLoading'>
            <h3 class='above-divider'><strong>{{ targetLabel }}</strong> is buddies with <strong>{{ buddyDict[0].label }}</strong></h3>
            
            <div class='divider'></div>
            
            <div class='below-divider'>

                <div class='show-small-screen'>
                    <BuddyTable :tableDict='tableDict' />
                </div>

                <div class='show-big-screen'>
                    <BuddyTable v-if='numBuddies < 5' :tableDict='tableDict' />

                    <div v-if='numBuddies >= 5' class='d-flex'>
                        <BuddyTable :tableDict='getFirstHalf(tableDict)' />
                        <BuddyTable :tableDict='getSecondHalf(tableDict)' />
                    </div>
                </div>
                
                <div id='num-buddies-choice'>
                    <div class='mt-2 d-flex' style='margin: auto;'>
                        <h4 class='mb-0'>See</h4> 
                        <div class='dropdown'>
                            <button class='btn dropdown-toggle mt-1 mx-1 ' type='button' id='dropdown-menu-button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' tabindex='0'>
                                {{ numBuddies }}
                            </button>
                            <div class='dropdown-menu' aria-labelledby='dropdown-menu-button'>
                                <p class='dropdown-item' @keydown.enter='changeNumBuddies(1)' @click='changeNumBuddies(1)' tabindex='0'>1</p>
                                <p class='dropdown-item' @keydown.enter='changeNumBuddies(5)' @click='changeNumBuddies(5)' tabindex='0'>5</p>
                                <p class='dropdown-item' @keydown.enter='changeNumBuddies(10)' @click='changeNumBuddies(10)' tabindex='0'>10</p>
                                <p class='dropdown-item' @keydown.enter='changeNumBuddies(15)' @click='changeNumBuddies(15)' tabindex='0'>15</p>
                            </div>
                        </div>
                        <h4 class='mb-0'>{{ numBuddies == 1 ? 'city' : 'cities' }} similar to {{ targetLabel }}</h4>
                    </div>
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
let numBuddies = ref(1)

// Target and buddy city info.
let targetLabel = ref('')
let targetCountry = ref('')
let targetPop = ref('')

// List of dictionaries containing information about each of the city buddies.
let buddyDict = ref([])

// True if the target and buddy information has not loaded yet.
let infoLoading = ref(true)

// True if num buddies has been changed and the new infomration has not loaded yet.
let buddiesLoading = ref(false)

// On mount, calculate the target and buddy city info with the ID's in the params.
onMounted(async () => {
    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPop.value = formatPopulation(idToPop(route.params.targetId))
    await changeNumBuddies(1)
    infoLoading.value = false
})

// Determines if the screen is small enough that the "see more cities" need to be on separate lines.
const tableDict = computed(() => {
    let targetInfo = {id: route.params.targetId, label: targetLabel.value, country: targetCountry.value, population: targetPop.value}
    return [targetInfo, ...buddyDict.value]
})

// Edit the number of buddies currently being shown.
async function changeNumBuddies(newNumBuddies) {
    $('#dropdown-menu-button').click();
    buddiesLoading.value = true
    buddyDict.value = await findBuddies(newNumBuddies)
    numBuddies.value = newNumBuddies
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

// Get the first half of an array.
function getFirstHalf(list) {
    let returnList = []
    for (let i = 0; i < Math.floor((list.length / 2)); i++){
        returnList.push(list[i])
    }
    return returnList
}

// Get the second half of an array.
function getSecondHalf(list) {
    let returnList = []
    for (let i = Math.floor((list.length / 2)); i < list.length; i++){
        returnList.push(list[i])
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

#num-buddies-choice {
    color: $secondary;
    display: flex;
    flex-direction: column;
}

#buddies-loading {
    color: $secondary;
    font-style: italic;
}

#dropdown-menu-button {
    width: 5rem;
}

#dropdown-menu-button:focus {
    border: 1px solid $secondary;
}

.show-small-screen {
    display: none;
}

@media screen and (max-width: 1000px) {
    .show-small-screen {
        display: unset;
    }

    .show-big-screen {
        display: none;
    }
    
}
</style>
