<template>
  <div id="disambiguation_info">
    <h3 class="above_divider">Choose which <strong>{{ target_label }}</strong> you want to search for:</h3>
    <div class="divider"></div>
    <ul class="below_divider" id="disambiguation_list">
      <li v-for="entry in props.cities" :key="entry" @keydown.enter="chosen_target(entry.value)" @click="chosen_target(entry.value)" class ="city_choice" tabindex="0" >
        <h4>{{entry.description}}</h4>
      </li>
    </ul>
  </div>
</template>

<script setup>

import { useRoute } from 'vue-router'

// vue imports
import { computed } from 'vue'

// define props and emits
const props = defineProps(['cities'])
const emit = defineEmits(['chosen_target'])

const route = useRoute()

// emit a chosen_target event with the chosen city id when a target city is chosen
function chosen_target(id) {
    emit("chosen_target", id)
}

const target_label = computed(() => {
  console.log("computing target label")
  return route.params.target_label
})

</script>

<style>
#disambiguation_list {
    list-style-type: none;
    padding-left: 0;
}

#disambiguation_info {
    margin-top: 25px;
}

.city_choice {
    width: 55%;
    margin: auto;
    margin-bottom: 20px;
}

.city_choice:hover, .city_choice:focus {
    color: #519872;
    outline: none;
}

@media screen and (max-width: 900px) {
    .city_choice {
      width: 90%;
      margin-bottom: 25px;
    }
}
</style>
