<template>
    <h3 id='city-not-found'>Sorry, we couldn't find a city with the name {{ route.params.targetLabel }}.</h3>
</template>
  
<script setup>

// Vue imports.
import { useRoute } from 'vue-router'

// Extract router info.
const route = useRoute()

</script>

<style>

#city-not-found {
    margin-top: 20px;
}

</style>
  