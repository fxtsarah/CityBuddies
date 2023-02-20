<template>
  <Banner :listLoading='listLoading'/>
  <router-view v-if='!listLoading'/>
</template>

<script setup>

// Vue imports.
import { ref, onMounted } from 'vue'

// Import state.
import { state } from './stores/store.js'

// Import API.
import Api from './Api'

// Import components.
import Banner from './components/Banner.vue'

// True if the citiesList has not finished generating yet.
let listLoading = ref(true)

// When the app is mounted, calculate the cities list.
// After the list is calculated, set list_loading to false.
onMounted(async () => {
    state.citiesList = await getCitiesList()
    listLoading.value = false
})

// Get the list of all the cities. Each entry includes the ID and population.
async function getCitiesList() {
    let list = (await Api().get('cities/getCitiesList')).data
    return list
}

</script>