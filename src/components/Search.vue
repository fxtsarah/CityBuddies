<template>
    
</template>

<script setup>

// Vue imports.
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// Import composables.
import { useFindPossibleMatches } from '../composables/useFindPossibleMatches.js'
import { useChosenTarget } from '../composables/useChosenTarget.js'

// Extract functions from composables.
let { findPossibleMatches } = useFindPossibleMatches()
let { chosenTarget } = useChosenTarget()

// Extract router info.
const router = useRouter()
const route = useRoute()

// As soon as the search route is mounted, act as if the targetLabel has just been submitted.
onMounted(async () => {
    await inputSubmit(route.params.targetLabel)
})

// Method called when the user clicks the 'search for buddy' button.
async function inputSubmit(input)  {

    // Look for any cities that share a name with the inputted value.
    let possibleTargetCities = await findPossibleMatches(input)

    // If there were no cities found with the same name, show a message stating that the city couldn't be found.
    if (possibleTargetCities.length == 0) {
        let label = route.params.targetLabel
        router.push({ name: 'city-not-found', params: { targetLabel: label } })
    }

    // If there is only one city found with the same name, automatically choose that city as the target and search for its buddy.
    else if (possibleTargetCities.length == 1) {
        chosenTarget(possibleTargetCities[0]["value"], router)
    }

    // If there are multiple cities found with the same name, allow the user to select which one they want before searching for a buddy.
    else {
        let label = route.params.targetLabel
        router.push({ name: 'disambiguation', params: { targetLabel: label } })
    }
}

</script>