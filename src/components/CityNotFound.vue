<template>
    <h3 class='mt-3 mx-3'>Sorry, we couldn't find a city with the name {{ route.params.targetLabel }}.</h3>
    <h4 class="mx-3">Make sure you only search for the name of the city (e.g. Berlin instead of Berlin, Germany).</h4>
</template>
  
<script setup>

// Vue imports.
import { useRoute } from 'vue-router'

// Extract router info.
const route = useRoute()

</script>