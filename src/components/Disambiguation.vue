<template>
    <div id="disambiguationInfo">
        <h3 class="aboveDivider">Choose which <strong>{{ route.params.targetLabel }}</strong> you want to search for:</h3>
        <div class="divider"></div>
        <ul class="belowDivider" id="disambiguationList">
            <li v-for="entry in possibleTargetCities" :key="entry" @keydown.enter="chosenTarget(entry.value, router)" @click="chosenTarget(entry.value, router)" class ="cityChoice" tabindex="0" >
                <h4>{{ entry.description }}</h4>
            </li>
        </ul>
    </div>
</template>

<script setup>

// vue imports
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// import composables
import { useFindPossibleMatches }  from '../composables/useFindPossibleMatches.js'
import { useChosenTarget }  from '../composables/useChosenTarget.js'

// extract functions from composables
let { findPossibleMatches } = useFindPossibleMatches()
let { chosenTarget } = useChosenTarget()

// extract router info
const route = useRoute()
const router = useRouter()

// The list of city ID's and descriptions that match the target label
let possibleTargetCities = ref([])

// updateC with the target label's matches when the component is mounted
onMounted(async () => {
    possibleTargetCities.value = await findPossibleMatches(route.params.targetLabel)
})

</script>

<style>

.cityChoice {
    cursor: pointer;
}

.cityChoice:hover, .city_choice:focus {
    color: #519872;
    outline: none;
}

@media screen and (max-width: 900px) {
    .cityChoice {
        margin: auto;
        width: 90%;
        margin-bottom: 25px;
    }

}
</style>
