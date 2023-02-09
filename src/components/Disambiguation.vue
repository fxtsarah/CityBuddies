<template>
    <div id="disambiguation_info">
        <h3 class="above_divider">Choose which <strong>{{ route.params.target_label }}</strong> you want to search for:</h3>
        <div class="divider"></div>
        <ul class="below_divider" id="disambiguation_list">
            <li v-for="entry in possible_target_cities" :key="entry" @keydown.enter="chosen_target(entry.value, router)" @click="chosen_target(entry.value, router)" class ="city_choice" tabindex="0" >
                <h4>{{ entry.description }}</h4>
            </li>
        </ul>
    </div>
</template>

<script setup>

// vue imports
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// import composables
import { use_find_possible_matches }  from '../composables/use_find_possible_matches.js'
import { use_chosen_target }  from '../composables/use_chosen_target.js'

// extract functions from composables
let { find_possible_matches } = use_find_possible_matches()
let { chosen_target } = use_chosen_target()

// extract router info
const route = useRoute()
const router = useRouter()

// The list of city ID's and descriptions that match the target label
let possible_target_cities = ref([])

// update possible_target_cities with the target label's matches when the component is mounted
onMounted(async () => {
    possible_target_cities.value = await find_possible_matches(route.params.target_label)
})

</script>

<style>

/* #disambiguation-list {
    padding-left: 0
} */

.city_choice {
    cursor: pointer;
}

.city_choice:hover, .city_choice:focus {
    color: #519872;
    outline: none;
}

@media screen and (max-width: 900px) {
    .city_choice {
        margin: auto;
        width: 90%;
        margin-bottom: 25px;
    }

}
</style>
