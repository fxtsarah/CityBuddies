<template>
    <h3 id="cityNotFound">Sorry, we couldn't find a city with the name {{ route.params.targetLabel }}.</h3>
</template>
  
<script setup>

// Vue imports.
import { useRoute } from 'vue-router'

// Extract router info.
const route = useRoute()

</script>

<style>

#cityNotFound {
    margin-top: 20px;
}

</style>
  