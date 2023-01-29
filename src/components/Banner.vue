<template>
    <div id = "banner">
    <div id="banner_text">
      <h1>City Buddies</h1>
      <p style="font-size: 20px;">See which city is nearest in population to your city</p>
    </div>

    <div id="banner_form">
      <input @keydown.enter="input_submit" placeholder="City name" class="form-control" :class="{ disabled_input: props.list_loading }" id="input_form" v-model="input_value" :tabindex=input_tab_index>
      <button class="btn btn-light" :class="{ disabled_button: props.list_loading }" id="input_button" @keydown.enter="input_submit" @click="input_submit" :tabindex=submit_tab_index>Search For Buddy</button>
      <p v-if="props.list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'

const emit = defineEmits(['input_submit'])
const props = defineProps(['list_loading'])

let input_value = ref("")
let input = ref(null)

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
