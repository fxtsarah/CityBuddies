<template>

</template>

<script setup>
// vue imports
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// import composables
import { use_is_city_id } from '../../composables/use_is_city_id.js'

// extract functions from composables
let { is_city_id } = use_is_city_id()

const router = useRouter()
const route = useRoute()

onMounted(async () => {
    let is_city = await is_city_id(route.params.target_id)
    is_city ? router.push(( { name:'other-buddies', params: { target_id: route.params.target_id } } )) : router.push(({ name: '404' }))
})

</script>