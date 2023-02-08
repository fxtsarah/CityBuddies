<template>
    
</template>

<script setup>
// vue imports
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// import state
import { state } from '../stores/store.js'

// import composables
// import { use_find_buddy } from '../composables/use_find_buddy.js'
import { use_find_possible_matches } from '../composables/use_find_possible_matches.js'
import { use_chosen_target } from '../composables/use_chosen_target.js'

// extract functions from composables
// let { find_buddy } = use_find_buddy()
let { find_possible_matches } = use_find_possible_matches()
let { chosen_target } = use_chosen_target()
const router = useRouter()
const route = useRoute()

// As soon as the search route is mounted, act as if the target_label has just been submitted.
onMounted(async () => {
    await input_submit(route.params.target_label)
})

// method called when the user clicks the 'search for buddy' button
async function input_submit(input)  {
  
  // look for any cities that share a name with the inputted value.
  var possible_target_cities = await find_possible_matches(input)

  // if there were no cities found with the same name, show a message stating that the city couldn't be found
  if (possible_target_cities.length == 0) {
    let label = route.params.target_label
    router.push({ name: 'city-not-found', params: { target_label: label } })
  }

  // if there is only one city found with the same name, automatically choose that city as the target and search for its buddy
  else if (possible_target_cities.length == 1) {
    chosen_target(possible_target_cities[0]["value"], router)
    // router.push({ name: 'match', params: { target_id: state.target_city_entry.value } })
  }

  // if there are multiple cities found with the same name, allow the user to select which one they want before searching for a buddy
  else {
    let label = route.params.target_label
    router.push({ name: 'disambiguation', params: { target_label: label } })
  }
}

</script>
