<template>

</template>

<script setup>

// Vue imports.
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// Import composables.
import { useChosenTarget } from '../../composables/useChosenTarget.js'
import { useIsCityId } from '../../composables/useIsCityId.js'

// Extract functions from composables.
let { chosenTarget } = useChosenTarget()
let { isCityId } = useIsCityId()

// Extract router info.
const router = useRouter()
const route = useRoute()

// If the targetId is a valid city, then generate the match page for that ID.
// Act as if the ID has just been chosen.
// If not, go to the 404 page.
onMounted(() => {
    let isCity = isCityId(route.params.targetId)
    isCity ? chosenTarget(route.params.targetId, router) : router.push(({ name: '404' }))
})

</script>
