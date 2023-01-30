<template>
    <div id = "banner">
    <Nav />
    <div v-show="props.include_form" id="banner_form">
      <div id="baner_input_and_button">
        <input @keydown.enter="input_submit" placeholder="City name" class="form-control" :class="{ disabled_item: props.list_loading }" id="input_form" v-model="input_value" :tabindex=input_tab_index>
        <button class="btn btn-light banner_button" :class="{ disabled_item: props.list_loading }" id="input_button" @keydown.enter="input_submit" @click="input_submit" :tabindex=submit_tab_index><strong>Search For Buddy</strong></button>
      </div>
      <p v-if="props.list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'
import Nav from "./Nav.vue"

const emit = defineEmits(['input_submit'])
const props = defineProps(['list_loading', 'include_form'])

let input_value = ref("")

const input_tab_index = computed(() => {
  return props.list_loading.value ? "-1" : "0"
})

const submit_tab_index = computed(() => {
  return props.list_loading.value ? "-1" : "0"
})

function input_submit() {
  emit('input_submit', input_value.value)
  input_value.value = ""
}

</script>
