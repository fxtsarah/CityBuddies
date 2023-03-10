<template>
    <div id='banner'>

        <div id='nav'>
            <h1 class='mt-0 text-nowrap'><router-link id='title-link' :to="{ name: 'home' }" :class="{ 'disabled-title': props.listLoading }" :tabindex=bannerTabIndex>City Buddies</router-link> </h1>
            <div class='ms-3'>
                <router-link :to="{ name: 'about' }" class='btn banner-button page m-1' :class="{ 'disabled-item': props.listLoading }" :tabindex=bannerTabIndex >About</router-link>
                <a @click="random()" @kerydown.enter="random()" class='btn banner-button page m-1' :class="{ 'disabled-item': props.listLoading }" :tabindex=bannerTabIndex>Random</a> 
            </div>
        </div>

        <div id='banner-form' class='d-block mt-1'>
            <div id='banner-input-and-button' class='d-flex'>
                <input @keydown.enter='inputSubmit' placeholder='City Name' class='form-control' :class="{ 'disabled-item': props.listLoading }" id='input-form' v-model='inputValue' :tabindex=bannerTabIndex>
                <button class='btn banner-button ms-4 fw-bold' :class="{ 'disabled-item': props.listLoading }" id='input-button' @keydown.enter='inputSubmit' @click='inputSubmit' :tabindex=bannerTabIndex>Search For Buddy</button>
            </div>
            <p v-if='props.listLoading' id='list-loading'><i>The cities list is loading, please wait...</i></p>
        </div> 
        
  </div>
</template>

<script setup>

// Import the list of city names that don't follow normal capitalization rules
import exceptionsList from '../../public/exceptions.json'

// Vue imports
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';

// Import state.
import { state } from '../stores/store.js'

// Extract router info.
const router = useRouter()

// Define props.
const props = defineProps(['listLoading'])

// Rhe current value of the input box,
let inputValue = ref('')

// Determines whether or not the banner elements should be tabbale. 
// Elements should only be tabbale if the cities list is not currently loading.
const bannerTabIndex = computed(() => {
    return props.listLoading ? '-1' : '0'
})

// When a value is submitted, clear the input box and pass the value onto the Search component
async function inputSubmit() {
    if (inputValue.value != '') {
        await router.push({ name: 'search', params: { targetLabel: formatCityName(inputValue.value) } })
        inputValue.value = ''
    }
}

// Correctly format the name of a city according to capitalization rules.
function formatCityName(str) {
    // If these words appear in a city name, they are always uncapitalized, unless they are the lsit of last word of the city name.
    let uncapped = ['dem', 'auf', 'pod', 'u', 'i', 'dos', 'das', 'da', 'do', 'the', 'on', 'or', 'din', 'cu', 'sub', 'lui', 'cel', 'adh', 'lu\'', 'du', 'vor', 'den', 'aan', 'bei', 'unter', 'and', 'der', 'y', 'upon', 'e', 'in', 'im', 'dei', 'op', 'los', 'del', 'nad', 'di', 'of', 'es', 'de', 'na', 'v', 'ob', 'am', 'las', 'el', 'la']

    // If a word begins with any of these prefixes, then the prefix is uncapitalized, and the first character after the prefix is capitalized.
    // However, if the word in question is the first word of the city name, then the first character of the prefix is also capitalized.
    let prefixes_2char = ['d\'', 'l\'', 'mc', 'o\'']
    let prefixes_3char = ['al-','el-', 'ez-']
    let prefixes_4char = ['ash-']

    // If any of these words appear after a hyphen, they are uncapitalized.
    let uncappedHypen = ['sur', 'real', 'sous', 'à', 'de', 'en', 'e', 'i', 'on', 'ye', 'au', 'o', 'a', 'the', 'by', 'les', '-']

    let strLower = String(str).toLowerCase()
    let strArray = strLower.split(/(\s+)/)

    // The formatted city name.
    let formatted = ''

    // If the inputted string matches any of the cities that don't follow the capitalization rules, output the excpetion that it matched.
    let filteredList = Object.values(exceptionsList).filter(entry => String(entry.cityLabel).localeCompare(String(str), undefined, { sensitivity: 'base' }) == 0)

    if (filteredList.length == 1) {
        return filteredList[0].cityLabel
    }

    // Go through each word (seperated by spaces) and capitalize it according to capitalization rules.
    for (let i = 0; i < strArray.length; i++) {
        let word = strArray[i]

        // The current word formatted correctly.
        let formattedWord = ''

        // Handles words that are always uncapitalized unless they are the first or last word.
        if (i != 0 && i != strArray.length - 1 && uncapped.includes(word) ) {
            formattedWord = String(word)
        } 

        // Handles prefixes.

        // Handles 2-character prefixes.
        else if (word.length >= 4 && (prefixes_2char.includes(String(word).substring(0, 2)))) {
            formattedWord = String(word).substring(0, 2) + String(word).charAt(2).toUpperCase() + String(word).slice(3)
            // Only if this is the first word, capitalize the first letter.
            if (i == 0) { 
                formattedWord = capitalizeFirstLetter(formattedWord)
            }
        } 

        // Handles 3-character prefixes.
        else if (word.length >= 5 && (prefixes_3char.includes(String(word).substring(0, 3)))) {
            formattedWord = String(word).substring(0, 3) + String(word).charAt(3).toUpperCase() + String(word).slice(4)
            // Only if this is the first word, capitalize the first letter.
            if (i == 0) { 
                formattedWord = capitalizeFirstLetter(formattedWord)
            }
        } 

        // Handles 4-character prefixes.
        else if (word.length >= 6 && (prefixes_4char.includes(String(word).substring(0, 4)))) {
            formattedWord = String(word).substring(0, 4) + String(word).charAt(4).toUpperCase() + String(word).slice(5)
            // Only if this is the first word, capitalize the first letter.
            if (i == 0) { 
                formattedWord = capitalizeFirstLetter(formattedWord)
            }
        }

        // Handles hyphens. Each chunk that the hypen seperates should have its first character capitalized,
        // unless that chunk is in the uncapped_hyphen list.
        else if (word.includes('-')){
            let wordArray = word.split(/(-)/g)
            for (let j = 0; j < wordArray.length; j++) {
                let hyphenChunk = wordArray[j]
                if (uncappedHypen.includes(hyphenChunk)) {
                    formattedWord = formattedWord + hyphenChunk
                }
                else {
                    formattedWord = formattedWord + capitalizeFirstLetter(hyphenChunk)
                }
            }
        }

        // If a word starts with an open parenthesis, capitalize the second character.
        else if(String(word).charAt(0) == '(') {
            formattedWord =  '(' + String(word).charAt(1).toUpperCase() + String(word).slice(2)
        }

        // If a word has a slash in the middle, capitalize the first character of the chunks of either side of the slash.
        else if(String(word).includes('/')) {
            let wordArray = word.split('/')
            let firstChunk = capitalizeFirstLetter(wordArray[0])
            let secondChunk = capitalizeFirstLetter(wordArray[1])
            formattedWord = firstChunk + '/' + secondChunk
        }

        // Dots work the same as hypens, but there are no exceptions for the chunk to remain uncapitalized.
        else if (word.includes('.')) {
            let wordArray = word.split(/(.)/g)
            for (let j = 0; j < wordArray.length; j++) {
                let dotChunk = wordArray[j]
                formattedWord = formattedWord + capitalizeFirstLetter(dotChunk)
            }
        }

        // If none of the above are true, then each word has its first letter capitalized with the rest uncapitalized.
        else {
            formattedWord = capitalizeFirstLetter(word)
        } 
        formatted = formatted + formattedWord
    }
    // Trim the whitespace from the ends of the input.
    return formatted.trim()
}

// Capitalize the first character of a string
function capitalizeFirstLetter(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1)
}

// Go to the match page of a random city.
function random() {
    var randomCity = state.citiesList[Math.floor(Math.random()*state.citiesList.length)]
    router.push({ name: 'match-redirect', params: { targetId: randomCity.value } })
}

</script>

<style lang='scss' scoped>
@import '../../public/constants.scss';

#banner {
    background-color: $primary;
    color: $background;
    height: 10rem;
    padding: 3rem;
    display: flex;
    justify-content: space-between;
}

#banner-text {
    text-align: left;
    caret-color: transparent;
    width: 40%;    
}

#input-form {
    max-width: 300px; 
    min-width: 60px;
    caret-color: black;
}

#input-form:focus {
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px 2px $secondary;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px 2px $secondary;
}

#input-button {
    color: $primary;
    width: 16rem;
}

.banner-button {
    white-space: nowrap;
    background-color: $btnColor;
    color: $btnInactiveText;
}

.banner-button:hover, .banner-button:focus {
    background-color: $btnHover;
    color: $btnInactiveText;
}

#list-loading {
    font-size: 1.5rem;
    margin-top: .25rem;
}

.disabled-item {
    pointer-events: none;
    opacity: .6;
}

.disabled-title {
    pointer-events: none;
}

#nav {
    background-color: $primary;
    color: $background;
    display: flex;
}

.page {
    width: 8rem;
}

.page.router-link-exact-active {
    color: $primary;
    font-weight: bold;
}


#title-link {
    color: $background;
    text-decoration: none;
}

#title-link:hover {
    color: $backgroundHover;
}

@media screen and (max-width: 1000px) {
    #banner {
        height: max(140px, min(36vw, 10.5rem));
        padding: 3vw;
        display: block;
    }

    #input-form {
        margin-right: .6rem;
    }

    #banner-form {
        width: auto;
    }

    #banner-input-and-button, #nav {
        justify-content: space-between;
    }

    #title {
        font-size: max(30px, min(7.5vw, 40px));
        margin-top: .4rem;
        color: $background !important;
        text-decoration: none !important;
    }

    .page {
        width: 7rem;
        color: $btnColor;
        background-color: transparent;
        border: transparent;
        transition: none;
        --bs-btn-active-color: $btnHover;
        --bs-btn-active-bg: transparent;
    }

    .page:hover, .page:focus {
        color: $btnHover;
        background-color: transparent;
    }

    .page.router-link-exact-active {
        color: $btnColor;
        text-decoration: underline;
    }
}

</style>
