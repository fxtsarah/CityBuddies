// Vue imports.
import { reactive } from 'vue'

export let state = reactive({
    // The list of all the cities. Each entry includes the ID and population.
    // Cities without a population, without a point in time associated with that population, 
    // or with a point in time earlier that 2000 are excluded.
    // citiesList is null before it is generated as App.vue mounts.
    citiesList: null
})