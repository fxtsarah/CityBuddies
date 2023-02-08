// import state
import { state } from '../stores/store.js'

// import composables
import { use_find_buddy } from './use_find_buddy.js'

// extract functions from composables
let { find_buddy } = use_find_buddy()

export function use_chosen_target() {
  // method called when a target city is chosen, 
  // either automatically because there was only one city that matched the inputted name,
  // or manually because the user selected the city from the disambiguation page
  function chosen_target(target_id, router) {
    router.push({ name: 'match', params: { target_id: target_id, buddy_id: find_buddy(state.cities_list, target_id).value } })
  }
  
return { chosen_target }
}