<template>
    <div>
        <router-view />
        <div id='buddy-match-info' v-if='!infoLoading'>
            <h3 class='above-divider'><strong>{{ targetLabel }}</strong> is buddies with <strong>{{ buddyLabel }}</strong></h3>
            <div class='divider'></div>
            <div class='below-divider'>
                <h4>Population of {{ targetLabel }}, {{ targetCountry }}: <strong>{{ targetPop }}</strong></h4>
                <h4>Population of {{ buddyLabel }}, {{ buddyCountry }}: <strong>{{ buddyPop }}</strong></h4>
            </div>
            <h5><router-link :to="{ name: 'other-buddies', params: { targetId: route.params.targetId } }">See other cities with a similar population to {{ targetLabel }}</router-link></h5>
        </div>
        <Map :active='!infoLoading' :targetId='route.params.targetId' :targetLabel='targetLabel' :buddies='buddyDict' />
    </div>
</template>

<script setup>

// Vue imports.
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Import components.
import Map from './Map.vue'

// Import composables.
import { useFormatPopulation } from '../composables/useFormatPopulation.js'
import { useIdToLabel } from '../composables/useIdToLabel.js'
import { useIdToCountry } from '../composables/useIdToCountry.js'
import { useIdToPop } from '../composables/useIdToPop.js'

// Extract functions from composables.
let { formatPopulation } = useFormatPopulation()
let { idToLabel } = useIdToLabel()
let { idToCountry } = useIdToCountry()
let { idToPop } = useIdToPop()

// Extract route info.
const route = useRoute()

// Target and buddy city info.
let targetLabel = ref('')
let targetCountry = ref('')
let targetPop = ref('')

let buddyLabel = ref('')
let buddyCountry = ref('')
let buddyPop = ref('')

// True if the target and buddy information has not loaded yet.
let infoLoading = ref(true)

// Formats the buddy as a dictionary containing the ID and label.
// Used to by the Map component.
const buddyDict = computed(() => {
    return [{'id': route.params.buddyId, 'label': buddyLabel.value}]
})

// On mount, calculate the target and buddy city info with the ID's in the params.
onMounted(async () => {
    targetLabel.value = await idToLabel(route.params.targetId)
    targetCountry.value = await idToCountry(route.params.targetId)
    targetPop.value = formatPopulation(idToPop(route.params.targetId))

    buddyLabel.value = await idToLabel(route.params.buddyId)
    buddyCountry.value = await idToCountry(route.params.buddyId)
    buddyPop.value = formatPopulation(idToPop(route.params.buddyId))

    infoLoading.value = false
})

</script>

<style>

#buddy-match-info {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}

</style>