<template>
    <div id = "banner">
        <div id="nav">
            <h1 id="title">City Buddies</h1>
            <div id="pages">
                <router-link :to="{ name: 'home' }" class="btn btn-light bannerButton page" :class="{ disabledItem: props.listLoading }" :tabindex=bannerTabIndex>Home</router-link> 
                <router-link :to="{ name: 'about' }" class="btn btn-light bannerButton page" :class="{ disabledItem: props.listLoading }" :tabindex=bannerTabIndex >About</router-link>
            </div>
        </div>
        <div id="bannerForm">
            <div id="bannerInputAndButton">
                <input @keydown.enter="inputSubmit" placeholder="City name" class="form-control" :class="{ disabledItem: props.listLoading }" id="inputForm" v-model="inputValue" :tabindex=bannerTabIndex>
                <button class="btn btn-light bannerButton" :class="{ disabledItem: props.listLoading }" id="inputButton" @keydown.enter="inputSubmit" @click="inputSubmit" :tabindex=bannerTabIndex><strong>Search For Buddy</strong></button>
            </div>
            <p v-if="props.listLoading" id="listLoading"><i>The cities list is loading, please wait...</i></p>
        </div> 
  </div>
</template>

<script setup>

// import the list of city names that don't follow normal capitalization rules
import exceptionsList from '../../public/exceptions.json'

// vue imports
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';

// extract router info
const router = useRouter()

// define props
const props = defineProps(['listLoading'])

// the current value of the input box
let inputValue = ref("")

// determines whether or not the banner elements should be tabbale. 
// elemnts should only be tabbale if the cities list is not currently loading.
const bannerTabIndex = computed(() => {
    return props.listLoading ? "-1" : "0"
})

// when a value is submitted, clear the imput bos and pass the value onto the Search component
async function inputSubmit() {
    await router.push({ name: 'search', params: { targetLabel: formatCityName(inputValue.value) } })
    inputValue.value = ""
}

// Correctly format the name of a city according to capitalization rules.
function formatCityName(str) {
    // If these words appear in a city name, they are always uncapitalized, unless they are the lsit of last word of the city name.
    let uncapped = ['dem', 'auf', 'pod', 'u', 'i', 'dos', 'das', 'da', 'do', 'the', 'on', 'or', 'din', 'cu', 'sub', 'lui', 'cel', 'adh', 'lu\'', 'du', 'vor', 'den', 'aan', 'bei', 'unter', 'and', 'der', 'y', 'upon', 'e', 'in', 'im', 'dei', 'op', 'los', 'del', 'nad', 'di', 'of', 'es', 'de', 'na', 'v', 'ob', 'am', 'las', 'el', 'la']

    // If a word begins with any of these prefixes, then the prefix is uncapitalized, and the first character after the prefix is capitalized.
    // However, if the word in question is the first word of the city name, then the first character of the prefix is also capitalized.
    let prefixes_2char = ['d\'', 'l\'', "mc", "o\'"]
    let prefixes_3char = ['al-','el-', 'ez-']
    let prefixes_4char = ['ash-']

    // If any of these words appear after a hyphen, they are uncapitalized.
    let uncappedHypen = ['sur', 'real', 'sous', 'à', 'de', 'en', 'e', 'i', 'on', 'ye', 'au', 'o', 'a', 'the', 'by', 'les', '-']

    let strLower = String(str).toLowerCase()
    let strArray = strLower.split(/(\s+)/)

    // The formatted city name
    let formatted = ""

    // If the inputted string matches any of the cities that don't follow the capitalization rules, output the excpetion that it matched.
    let filteredList = Object.values(exceptionsList).filter(entry => String(entry["cityLabel"]).localeCompare(String(str), undefined, { sensitivity: 'base' }) == 0)

    if (filteredList.length == 1) {
        return filteredList[0]["cityLabel"]
    }

    // Go through each word (seperated by spaces) and capitalize it according to capitalization rules.
    for (let i = 0; i < strArray.length; i++) {
        let word = strArray[i]
        let formattedWord = ""

        // Handles words that are always uncapitalized unless they are the first or last word.
        if (i != 0 && i != strArray.length - 1 && uncapped.includes(word) ) {
            // formatted = formatted + String(word)
            formattedWord = String(word)
        } 

        // Handles prefixes.

        // Handles 2-character prefixes.
        else if (word.length >= 4 && (prefixes_2char.includes(String(word).substring(0, 2)))) {
            formattedWord = String(word).substring(0, 2) + String(word).charAt(2).toUpperCase() + String(word).slice(3)
            if (i == 0) { 
                formattedWord = String(formattedWord).charAt(0).toUpperCase() + String(formattedWord).slice(1)
            }
            // formatted = formatted + formattedWord
        } 

        // Handles 3-character prefixes.
        else if (word.length >= 5 && (prefixes_3char.includes(String(word).substring(0, 3)))) {
            formattedWord = String(word).substring(0, 3) + String(word).charAt(3).toUpperCase() + String(word).slice(4)
            if (i == 0) { 
                formattedWord = String(formattedWord).charAt(0).toUpperCase() + String(formattedWord).slice(1)
            }
            // formatted = formatted + formattedWord
        } 

        else if (word.length >= 6 && (prefixes_4char.includes(String(word).substring(0, 4)))) {
            formattedWord = String(word).substring(0, 4) + String(word).charAt(4).toUpperCase() + String(word).slice(5)
            if (i == 0) { 
                formattedWord = String(formattedWord).charAt(0).toUpperCase() + String(formattedWord).slice(1)
            }
            // formatted = formatted + formattedWord
        }

        // Handles hyphens. Each chunk that the hypen seperates should have its first character capitalized,
        // unless that chunk is in the uncapped_hyphen list.
        else if (word.includes("-")){
            let wordArray = word.split(/(-)/g)
            // let formattedWord = ""
            for (let j = 0; j < wordArray.length; j++) {
                let hyphenChunk = wordArray[j]
                if (uncappedHypen.includes(hyphenChunk)) {
                    formattedWord = formattedWord + hyphenChunk
                }
                else {
                    formattedWord = formattedWord + String(hyphenChunk).charAt(0).toUpperCase() + String(hyphenChunk).slice(1)
                }
            }
            // formatted = formatted + formattedWord
        }

        // If a word starts with an open parenthesis, capitalize the second character.
        else if(String(word).charAt(0) == "(") {
            formattedWord =  "(" + String(word).charAt(1).toUpperCase() + String(word).slice(2)
        }

        // If a word has a slash in the middle, capitalize the first character of the chunks of either side of the slash.
        else if(String(word).includes("/")) {
            let wordArray = word.split("/")
            let firstChunk = String(wordArray[0]).charAt(0).toUpperCase() + String(wordArray[0]).slice(1)
            let secondChunk = String(wordArray[1]).charAt(0).toUpperCase() + String(wordArray[1]).slice(1)
            formattedWord = firstChunk + "/" + secondChunk
        }

        // dots work the same as hypens, but there are no exceptions for the chunk to remain uncapitalized.
        else if (word.includes(".")) {
            let wordArray = word.split(/(.)/g)
            // let formattedWord = ""
            for (let j = 0; j < wordArray.length; j++) {
                let dotChunk = wordArray[j]
                formattedWord = formattedWord + String(dotChunk).charAt(0).toUpperCase() + String(dotChunk).slice(1)
            }
            // formatted = formatted + formattedWord
        }

        // if none of the above are true, then each word has its first letter capitalized with the rest uncapitalized.
        else {
            formattedWord = (String(word).charAt(0).toUpperCase() + String(word).slice(1))
        } 
        formatted = formatted + formattedWord
    }
    return formatted.trimEnd()
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

#bannerText {
    text-align: left;
    caret-color: transparent;
    width: 40%;    
}
  
#bannerForm {
    margin-top: 5px;
    display: block;
}

#bannerInputAndButton {
    display: flex;
}

#inputForm {
    margin-right: 20px;
    max-width: 300px; 
    min-width: 60px;
    caret-color: black;
}

#inputForm:focus {
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px 2px #519872;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px 2px #519872;
}

#inputButton {
    color:#E16036;
    width: 250px;
    margin-left: 20px;
}

.bannerButton {
    background-color: #F6F6F6; 
    white-space: nowrap;  
}

.bannerButton:hover, .bannerButton:focus {
    background-color: #dbdbdb;
}

#listLoading {
    font-size: 1.2rem;
    margin-top: .25rem;
}

.disabledItem {
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
        height: min(36vw, 10.5rem);
        padding: 3vw;
        display: block;
    }

    #inputForm {
        margin-right: 10px;
    }

    #bannerForm {
        width: auto;
    }

    #bannerInputAndButton, #nav {
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
