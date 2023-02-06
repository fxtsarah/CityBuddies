<template>
    <div id = "banner">

        <div id="nav">
            <h1 id="title">City Buddies</h1>
            <div id="pages" >
                <router-link to="/" class="btn btn-light banner_button page" :class="{ disabled_item: props.list_loading }" :tabindex=banner_tab_index>Home</router-link> 

                <router-link to="/about" class="btn btn-light banner_button page" :class="{ disabled_item: props.list_loading }" :tabindex=banner_tab_index >About</router-link>
            </div>
        </div>

        <div id="banner_form">
            <div id="banner_input_and_button">
                <input @keydown.enter="input_submit" placeholder="City name" class="form-control" :class="{ disabled_item: props.list_loading }" id="input_form" v-model="input_value" :tabindex=banner_tab_index>

                <button class="btn btn-light banner_button" :class="{ disabled_item: props.list_loading }" id="input_button" @keydown.enter="input_submit" @click="input_submit" :tabindex=banner_tab_index><strong>Search For Buddy</strong></button>
            </div>
            <p v-if="props.list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
        </div>
        
  </div>
</template>

<script setup>

// vue imports
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';

import { state } from '../stores/store.js'

const router = useRouter()

// define props
const props = defineProps(['list_loading'])

// the current value of the input box
let input_value = ref("")

// determines whether or not the banner elements should be tabbale. 
// elemnts should only be tabbale if the cities list is not currently loading.
const banner_tab_index = computed(() => {
  return props.list_loading.value ? "-1" : "0"
})

async function input_submit() {
  await router.push("/")
  state.last_submitted_value = input_value.value
  input_value.value = ""
}

</script>

<style>

#banner {
    background-color: #E16036;
    color: #F6F6F6;
    height: 10rem;
    padding: 2.5rem;
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
}

#banner_input_and_button {
    display: flex;
}

#input_form {
    margin-right: 20px;
    max-width: 300px; 
    min-width: 60px;
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

.banner_button:hover, .banner_button:focus {
    background-color: #dbdbdb;
}

#list_loading {
    font-size: 1.2rem;
    margin-top: .25rem;
}

.disabled_item {
    pointer-events: none;
    opacity: .6;
}

#nav {
    background-color: #E16036;
    color: #F6F6F6;
    display: flex;
}

.page {
    background-color: #F6F6F6;
    font-size: 16px;
    margin: 5px;
    width: 70px;
}

.page.router-link-exact-active {
    color:#E16036;
    font-weight: bold;
}

#pages {
    margin-left: 15px;
    justify-content: space-between;
}

#title {
    margin-right: 10px;
    margin-top: 0;
}

@media screen and (max-width: 900px) {
    #banner {
        padding: 3vw;
        display: block;
    }

    #input_form {
        margin-right: 10px;
    }

    #banner_form {
        width: auto;
    }

    #banner_input_and_button,  #nav {
        justify-content: space-between;
    }

    #title {
        font-size: min(7.5vw, 40px);
        margin-top: 5px;
    }

    .page {
        color:#F6F6F6;
        background-color: #E16036;
        border: transparent;
        font-size: 2vm;
        transition: none;
        --bs-btn-active-color: #dbdbdb;
        --bs-btn-active-bg: transparent;
    }

    .page:hover, .page:focus {
        background-color: transparent;
        color:#F6F6F6;
    }

    .page.router-link-exact-active {
        color:#F6F6F6;
        text-decoration: underline;
    }

}
</style>
