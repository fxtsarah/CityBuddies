<template>
    <div id = "banner">
    <Nav />
    <div v-show="props.include_form" id="banner_form">
      <div id="banner_input_and_button">
        <input @keydown.enter="input_submit" placeholder="City name" class="form-control" :class="{ disabled_item: props.list_loading }" id="input_form" v-model="input_value" :tabindex=form_tab_index>
        <button class="btn btn-light banner_button" :class="{ disabled_item: props.list_loading }" id="input_button" @keydown.enter="input_submit" @click="input_submit" :tabindex=form_tab_index><strong>Search For Buddy</strong></button>
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

const form_tab_index = computed(() => {
  return props.list_loading.value ? "-1" : "0"
})

function input_submit() {
  emit('input_submit', input_value.value)
  input_value.value = ""
}

</script>

<style>
#banner {
    background-color: #E16036;
    color: #F6F6F6;
    min-height: 10rem;
    padding: 2.5rem;
    padding-bottom: .5rem;
    overflow: auto; 
    display: flex;
    justify-content: space-between;
}

#banner_text {
    text-align: left;
    caret-color: transparent;
    width: 40%;    
}
  
#banner_form {
    margin-top: 5px;
    display: block;
    width: 55%;
    max-width: 450px;
}

#banner_input_and_button {
    display: flex;
}

#input_form {
    margin-right: 20px;
    max-width: 300px; 
    caret-color: black;
}
#input_form:focus {
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px 2px #519872;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px 2px #519872;
}
#input_button {

    color:#E16036;
    width: 250px;
    margin-left: 20px;
}
.banner_button {
    background-color: #F6F6F6; 
    white-space: nowrap;   

}
.banner_button:hover {
    background-color: #dbdbdb;
}
.banner_button:focus {
    background-color: #dbdbdb;
}
#list_loading {
    font-size: 1.2rem;
    margin-top: .5rem;
}
.disabled_item {
    pointer-events: none;
    opacity: .6;
}
@media screen and (max-width: 1000px) {
    #banner {
        padding: 3vw;
    }
    #banner_input_and_button {
    display: flex;
    }
}
</style>
