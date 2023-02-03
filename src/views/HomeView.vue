<template>
  <div v-if="city_not_found" id="city_not_found">
    <h3>Sorry, we couldn't find a city with the name {{ last_submitted_value_formatted }}.</h3>
  </div>

  <Disambiguation :active="disambiguation" :target_label="last_submitted_value_formatted" :cities="possible_target_cities" @chosen_target="chosen_target" />

  <Buddy_Match :active="match_found" :target_entry="target_city_entry" :buddy_entry="buddy_city_entry" />
  
</template>

<script setup>
// vue imports
import { ref, watch, computed, onMounted} from 'vue'

// import the list of city names that don't follow normal capitalization rules
import exceptions_list from '../../public/exceptions.json'

// import components
import Banner from "../components/Banner.vue"
import Disambiguation from "../components/Disambiguation.vue"
import Buddy_Match from "../components/Buddy_Match.vue"

// import composables
import {use_submit_query} from '../composables/use_submit_query.js'
import {use_delete_dupes} from '../composables/use_delete_dupes.js'

// extract fucntions from composables
let { submit_query } = use_submit_query()
let { delete_dupes } = use_delete_dupes()

// define props
const props = defineProps(['list_loading', 'cities_list', 'last_submitted_value'])

// true if we are seeing the screen where the user can select from all the cities of the imputted name
let disambiguation = ref(false)
// true if we are seeing the screen that tells the user who the buddy is
let match_found = ref(false)
// true if the user has just inputted a value that does not coorespond to any city
let city_not_found = ref(false)

// the list of city entries whose name matches the inputted 'target' city
let possible_target_cities = ref([])

// entries include the id and population
let target_city_entry = ref({"value":"", "population":0})
let buddy_city_entry = ref({"value":"", "population":0})

// Get the last submitted value and format it with correct capitalization.
const last_submitted_value_formatted = computed(() => {
  return format_city_name(props.last_submitted_value)
})

// method called when the user clicks the 'search for buddy' button
async function input_submit(input)  {
  //look for any cities that share a name with the inputted value.
  possible_target_cities.value = await find_possible_matches(input)
  city_not_found.value = false

  // if there were no cities found with the same name, show a message stating that the city couldn't be found
  if (possible_target_cities.value.length == 0) {
    city_not_found.value = true
    match_found.value = false
    disambiguation.value = false
  }

  // if there is only one city found with the same name, automatically choose that city as the target and search for its buddy
  else if (possible_target_cities.value.length == 1) {
    await chosen_target(possible_target_cities.value[0]["value"])
  }

  // if there are multiple cities found with the same name, allow the user to select which one they want before searching for a buddy
  else {
    disambiguation.value = true
    match_found.value = false
  }
}

// Given a string, output all the cities with a label or alternate label that matches the input
async function find_possible_matches(target_label) {
  // since case insensitive searching in sparql takes too much time, 
  // normalize the input with capitalization rules
  var label_formatted = format_city_name(target_label)

  // escape any quotes present in the input so the query doesn't break
  var no_quotes = label_formatted.replace("\'", "\\'");
      
  var query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
                WHERE
                { 
                ?city wdt:P31/wdt:P279* wd:Q515 .
                { ?city skos:altLabel \'${no_quotes}\'@en }
                UNION
                { ?city rdfs:label \'${no_quotes}\'@en }
                ?city wdt:P1082 ?population .
                                    
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                } ORDER BY DESC (?population)`
      
  var result = await submit_query(query)

  // remove duplicate cities from the result
  var no_dupes = await delete_dupes(result)
  return no_dupes
}

// method called when a target city is chosen, 
// either automatically because there was only one city that matched the inputted name,
// or manually because the user selected the city from the disambiguation page
async function chosen_target(target_id) {
  disambiguation.value = false
  target_city_entry.value = Object.values(props.cities_list).filter(entry => String(entry["value"]) == String(target_id))[0]
  buddy_city_entry.value = await find_buddy()
  match_found.value = true
}

// method called when the exact target city id is known and the program wants to find that city's buddy.
async function find_buddy() {
  let buddy_entry = null

  // find the index of the target city entry in the list of all the city entries
  var target_city_index = props.cities_list.indexOf(target_city_entry.value)

  // edge cases for when the city is at the from or back of the list and only has one neighbor.
  if (target_city_index == 0) {
    buddy_entry = props.cities_list[1]
  }

  else if (target_city_index == props.cities_list.length - 1) {
    buddy_entry = props.cities_list[props.cities_list.length - 2]
  }

  else {
    // if the city is not at the very front or very back of the list, then it has two possible buddies:
    // the two city entries adjacent to it. Find which of these two neighbors is closest in population
    // to the target city -> that is the buddy.
    var bigger_neighbor_index = target_city_index + 1
    var smaller_neighbor_index = target_city_index - 1

    var bigger_neighbor_entry = props.cities_list[bigger_neighbor_index]
    var smaller_neighbor_entry = props.cities_list[smaller_neighbor_index]

    var target_city_pop = parseInt(target_city_entry.value["population"])
    var bigger_neighbor_pop = parseInt(bigger_neighbor_entry["population"])
    var smaller_neighbor_pop = parseInt(smaller_neighbor_entry["population"])

    var bigger_neighbor_diff = bigger_neighbor_pop - target_city_pop
    var smaller_neighbor_diff = target_city_pop - smaller_neighbor_pop

    if (bigger_neighbor_diff < smaller_neighbor_diff) {
        buddy_entry = bigger_neighbor_entry
    }
    else{
        buddy_entry = smaller_neighbor_entry
    }
  }
  return buddy_entry
}

// whenever the last_submitted_value changes, assume the new value was just submitted and process it.
watch(()=>props.last_submitted_value, async (new_input) => {
  await input_submit(new_input)
})

// correctly format the name of a city according to capitalization rules
function format_city_name(str) {
  // if these words appear in a city name, they are always uncapitalized, unless they are the lsit of last word of the city name.
  var uncapped = ['dem', 'auf', 'pod', 'u', 'i', 'dos', 'das', 'da', 'do', 'the', 'on', 'or', 'din', 'cu', 'sub', 'lui', 'cel', 'adh', 'lu\'', 'du', 'vor', 'den', 'aan', 'bei', 'unter', 'and', 'der', 'y', 'upon', 'e', 'in', 'im', 'dei', 'op', 'los', 'del', 'nad', 'di', 'of', 'es', 'de', 'na', 'v', 'ob', 'am', 'las', 'el', 'la']
  
  // if a word begins with any of these prefixes, then the prefix is uncapitalized, and the first character after the prefix is capitalized.
  // Unless the word in question is the first word of the city name - then the first character of the prexif is also capitalized
  var prefixes_2char = ['d\'', 'l\'', "mc", "o\'"]
  var prefixes_3char = ['al-','el-',  'ez-']
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
