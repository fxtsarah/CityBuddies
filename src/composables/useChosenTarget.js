// import state
import { state } from '../stores/store.js'

// import composables
import { useFindBuddy } from './useFindBuddy.js'

// extract functions from composables
let { findBuddy } = useFindBuddy()

export function useChosenTarget() {
    // method called when a target city is chosen, 
    // either automatically because there was only one city that matched the inputted name,
    // or manually because the user selected the city from the disambiguation page
    function chosenTarget(targetId, router) {
        let buddyId = findBuddy(state.citiesList, targetId).value
        router.push({ name: 'match', params: { targetId: targetId, buddyId: buddyId } })
    }
    return { chosenTarget }
}