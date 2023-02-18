<template>

</template>

<script setup>

// Vue imports.
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// Import composables.
import { useIsCityId } from '../../composables/useIsCityId.js'

// Extract functions from composables.
let { isCityId } = useIsCityId()

// Extract router info.
const router = useRouter()
const route = useRoute()

// If the targetId is a valid city, then generate the other-buddies page for that ID.
// If not, go to the 404 page.
onMounted(() => {
    let isCity = isCityId(route.params.targetId)
    isCity ? router.push(( { name:'other-buddies', params: { targetId: route.params.targetId } } )) : router.push(({ name: '404' }))
})

</script>
