<template>
    <div>
        <h3 class='above-divider'>Choose which <strong>{{ route.params.targetLabel }}</strong> you want to search for:</h3>
        
        <div class='divider'></div>
        
        <ul class='below-divider'>
            <li v-for='entry in possibleTargetCities' :key='entry' @keydown.enter='chosenTarget(entry.value, router)' @click='chosenTarget(entry.value, router)' class ='city-choice' tabindex='0' >
                <h4>{{ entry.description }}</h4>
            </li>
        </ul>
    </div>
</template>

<script setup>

// Vue imports.
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Import composables.
import { useFindPossibleMatches }  from '../composables/useFindPossibleMatches.js'
import { useChosenTarget }  from '../composables/useChosenTarget.js'

// Extract functions from composables.
let { findPossibleMatches } = useFindPossibleMatches()
let { chosenTarget } = useChosenTarget()

// Extract router info.
const route = useRoute()
const router = useRouter()

// The list of city ID's and descriptions that match the target label.
let possibleTargetCities = ref([])

// Updates the list of possible cities when the component is mounted.
onMounted(async () => {
    possibleTargetCities.value = await findPossibleMatches(route.params.targetLabel)
})

</script>

<style lang='scss' scoped>
@import '../../public/constants.scss';

.city-choice {
    cursor: pointer;
}

.city-choice:hover, .city-choice:focus {
    color: $secondary;
    outline: none;
}

@media screen and (max-width: 1000px) {
    .city-choice {
        margin-left: auto;
        margin-right: auto;
        width: 90%;
    }
}
</style>

