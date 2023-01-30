<template>
    <div id = "banner">
    <div id="banner_text">
      <h1>City Buddies</h1>
      <h5>See which city is nearest in population to your city</h5>
    </div>

    <div id="banner_form">
      <div id="baner_input_and_button">
        <input @keydown.enter="input_submit" placeholder="City name" class="form-control" :class="{ disabled_item: props.list_loading }" id="input_form" v-model="input_value" :tabindex=input_tab_index>
        <button class="btn btn-light" :class="{ disabled_item: props.list_loading }" id="input_button" @keydown.enter="input_submit" @click="input_submit" :tabindex=submit_tab_index>Search For Buddy</button>
      </div>
      <p v-if="props.list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'

const emit = defineEmits(['input_submit'])
const props = defineProps(['list_loading'])

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
