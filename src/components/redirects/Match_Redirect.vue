<template>

</template>

<script setup>
// vue imports
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// import composables
import { use_chosen_target } from '../../composables/use_chosen_target.js'
import { use_is_city_id } from '../../composables/use_is_city_id.js'

// extract functions from composables
let { chosen_target } = use_chosen_target()
let { is_city_id } = use_is_city_id()

const router = useRouter()
const route = useRoute()

// As soon as the search route is mounted, act as if the the target id has just been chosen
onMounted(async () => {
    var is_city = await is_city_id(route.params.target_id)
    is_city ? chosen_target(route.params.target_id, router) : router.push(({ name: '404' }))
})

</script>
