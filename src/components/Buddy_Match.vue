<template>
  <div>
    <div id="buddy_match_info" v-if="info_loaded">
      <h3 class="above_divider"><strong>{{ target_label }}</strong> is buddies with <strong>{{ buddy_label }}</strong></h3>
      <div class="divider"></div>
      <div class="below_divider">
        <h4>Population of {{ target_label }}, {{ target_country }}: <strong>{{ target_pop }}</strong></h4>
        <h4>Population of {{ buddy_label }}, {{ buddy_country }}: <strong>{{ buddy_pop }}</strong></h4>
      </div>
      <router-link :to="{ name: 'other-buddies', params: { target_id: route.params.target_id } }" id="to_other_buddies">See other cities with a similar population to {{ target_label }}</router-link>
    </div>
    <Map :active="info_loaded" :target_id="route.params.target_id" :target_label="target_label" :buddies="buddy_dict" />
  </div>
</template>

<script setup>

// vue imports
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// import components
import Map from "./Map.vue"

// import composables
import { use_format_population } from '../composables/use_format_population.js'
import { use_id_to_label } from '../composables/use_id_to_label.js'
import { use_id_to_country } from '../composables/use_id_to_country.js'
import { use_id_to_pop } from '../composables/use_id_to_pop.js'

// extract functions from composables
let { format_population } = use_format_population()
let { id_to_label } = use_id_to_label()
let { id_to_country } = use_id_to_country()
let { id_to_pop } = use_id_to_pop()
const route = useRoute()

let target_label = ref("")
let target_country = ref("")
let target_pop = ref("")

let buddy_label = ref("")
let buddy_country = ref("")
let buddy_pop = ref("")

// true if the target and buddy information has not been loaded yet
let info_loaded = ref(false)

// formats the buddy as in id, label dictionary
const buddy_dict = computed(() => {
  return [{"id": route.params.buddy_id, "label": buddy_label.value }]
})

onMounted(async () => {
  target_label.value = await id_to_label(route.params.target_id)
  target_country.value = await id_to_country(route.params.target_id)
  target_pop.value = format_population( await id_to_pop(route.params.target_id))

  buddy_label.value = await id_to_label(route.params.buddy_id)
  buddy_country.value = await id_to_country(route.params.buddy_id)
  buddy_pop.value = format_population( await id_to_pop(route.params.buddy_id))

  info_loaded.value = true
})

</script>

<style>

#buddy_match_info {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}

#to_other_buddies {
  font-size: 16px;
}

</style>