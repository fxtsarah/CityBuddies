<template>
    <h3 id="city_not_found">Sorry, we couldn't find a city with the name {{ route.params.target_label }}.</h3>
</template>
  
<script setup>

// vue imports
import { state } from '../stores/store.js'
import { useRoute } from 'vue-router'

const route = useRoute()

</script>

<style>

#city_not_found {
    margin-top: 20px;
}

</style>
  