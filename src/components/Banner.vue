<template>
    <div id = "banner">
        <div id="nav">
            <h1 id="title">City Buddies</h1>
            <div id="pages" >
                <router-link :to="{ name: 'home' }" class="btn btn-light banner_button page" :class="{ disabled_item: props.list_loading }" :tabindex=banner_tab_index>Home</router-link> 
                <router-link :to="{ name: 'about' }" class="btn btn-light banner_button page" :class="{ disabled_item: props.list_loading }" :tabindex=banner_tab_index >About</router-link>
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

// import the list of city names that don't follow normal capitalization rules
import exceptions_list from '../../public/exceptions.json'

// vue imports
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

// define props
const props = defineProps(['list_loading'])

// the current value of the input box
let input_value = ref("")

// determines whether or not the banner elements should be tabbale. 
// elemnts should only be tabbale if the cities list is not currently loading.
const banner_tab_index = computed(() => {
    return props.list_loading ? "-1" : "0"
})

async function input_submit() {
    await router.push({ name: 'search', params: { target_label: format_city_name(input_value.value) } })
    input_value.value = ""
}

// correctly format the name of a city according to capitalization rules
function format_city_name(str) {
    // if these words appear in a city name, they are always uncapitalized, unless they are the lsit of last word of the city name.
    var uncapped = ['dem', 'auf', 'pod', 'u', 'i', 'dos', 'das', 'da', 'do', 'the', 'on', 'or', 'din', 'cu', 'sub', 'lui', 'cel', 'adh', 'lu\'', 'du', 'vor', 'den', 'aan', 'bei', 'unter', 'and', 'der', 'y', 'upon', 'e', 'in', 'im', 'dei', 'op', 'los', 'del', 'nad', 'di', 'of', 'es', 'de', 'na', 'v', 'ob', 'am', 'las', 'el', 'la']

    // if a word begins with any of these prefixes, then the prefix is uncapitalized, and the first character after the prefix is capitalized.
    // Unless the word in question is the first word of the city name - then the first character of the prexif is also capitalized
    var prefixes_2char = ['d\'', 'l\'', "mc", "o\'"]
    var prefixes_3char = ['al-','el-', 'ez-']
    var prefixes_4char = ['ash-']

    // if any of these words appear after a hyphen, they are uncapitalized.
    var uncapped_hypen = ['sur', 'real', 'sous', 'à', 'de', 'en', 'e', 'i', 'on', 'ye', 'au', 'o', 'a', 'the', 'by', 'les', '-']

    var str_lower = String(str).toLowerCase()
    var str_array = str_lower.split(/(\s+)/)
    var new_string = ""

    // if the inputted string matches any of the cities that don't follow the capitalization rules, output the excpetion that it matched
    var filtered_list = Object.values(exceptions_list).filter(entry => String(entry["cityLabel"]).localeCompare(String(str), undefined, { sensitivity: 'base' }) == 0)

    if (filtered_list.length == 1) {
        return filtered_list[0]["cityLabel"]
    }

    // go through each word (seperated by spaces) and capitalize it according to capitalization rules
    for (let i = 0; i < str_array.length; i++) {
        var word = str_array[i]

        // handles words that are always uncapitalized unless they are the first or last word
        if (i != 0 && i != str_array.length - 1 && uncapped.includes(word) ) {
            new_string = new_string + String(word)
        } 

        // handles prefixes
        else if ( word.length >= 4 && (prefixes_2char.includes(String(word).substring(0, 2)))) {
            var addition = String(word).substring(0, 2) + String(word).charAt(2).toUpperCase() + String(word).slice(3)
            if (i == 0) { addition = String(addition).charAt(0).toUpperCase() + String(addition).slice(1)}
            new_string = new_string + addition
        } 

        else if (word.length >= 5 && (prefixes_3char.includes(String(word).substring(0, 3)))) {
            var addition = new_string + String(word).substring(0, 3) + String(word).charAt(3).toUpperCase() + String(word).slice(4)
            if (i == 0) { addition = String(addition).charAt(0).toUpperCase() + String(addition).slice(1)}
            new_string = new_string + addition
        } 

        else if (word.length >= 6 && (prefixes_4char.includes(String(word).substring(0, 4)))) {
            var addition = new_string + String(word).substring(0, 4) + String(word).charAt(4).toUpperCase() + String(word).slice(5)
            if (i == 0) { addition = String(addition).charAt(0).toUpperCase() + String(addition).slice(1)}
            new_string = new_string + addition
        }

        // handles hyphens. Each chunk that the hypen seperates should have its first character capitalized,
        // unless that chunk is in the uncapped_hyphen list
        else if (word.includes("-")){
            var word_array = word.split(/(-)/g)
            var addition = ""
            for (let j = 0; j < word_array.length; j++) {
                var hyphen_chunk = word_array[j]
                if (uncapped_hypen.includes(hyphen_chunk)) {
                    addition = addition + hyphen_chunk
                }
                else {
                    addition = addition + String(hyphen_chunk).charAt(0).toUpperCase() + String(hyphen_chunk).slice(1)
                }
            }
            new_string = new_string + addition
        }

        // If a word starts with an open parenthesis, capitalize the second character.
        else if(String(word).charAt(0) == "(") {
            new_string = new_string + "(" + String(word).charAt(1).toUpperCase() + String(word).slice(2)
        }

        // If a word has a slash in the middle, capitalize the first character of the chunks of either side of the slash.
        else if(String(word).includes("/")) {
            var word_array = word.split("/")
            var first_chunk = String(word_array[0]).charAt(0).toUpperCase() + String(word_array[0]).slice(1)
            var second_chunk = String(word_array[1]).charAt(0).toUpperCase() + String(word_array[1]).slice(1)
            new_string = new_string + first_chunk + "/" + second_chunk
        }

        // dots work the same as hypens, but there are no exceptions for the chunk to remain uncapitalized.
        else if (word.includes(".")) {
            var word_array = word.split(/(.)/g)
            var addition = ""
            for (let j = 0; j < word_array.length; j++) {
                var dot_chunk = word_array[j]
                addition = addition + String(dot_chunk).charAt(0).toUpperCase() + String(dot_chunk).slice(1)
            }
            new_string = new_string + addition
        }

        // if none of the above are true, then each word has its first letter capitalized with the rest uncapitalized.
        else {
            new_string = new_string + (String(word).charAt(0).toUpperCase() + String(word).slice(1))
        } 
    }
    return new_string
}

</script>

<style>

#banner {
    background-color: #E16036;
    color: #F6F6F6;
    height: 9rem;
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
