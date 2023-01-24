<template>

  <div id = "banner">
    <div id="banner_text">
      <h1>City Buddies</h1>
      <p style="font-size: 20px;">See which city is nearest in population to your city</p>
    </div>

    <div id="banner_form">
      <input placeholder="City name" class="form-control" :class="{ disabled_input: list_loading }" id="input_form" v-model="input_value" :tabindex=this.input_tab_index>
      <button class="btn btn-light" :class="{ disabled_button: list_loading }" id="input_button" @click="input_submit">Search For Buddy</button>
      <p v-if="list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
    </div>
  </div>

  <div v-if="city_not_found" id="city_not_found">
    <h3>Sorry, we couldn't find a city with the name {{ this.format_city_name(last_submitted_value) }}.</h3>
  </div>

  
      
  <div id="disambiguation_info" v-if="disambiguation">
    <h3 class="above_divider">Choose which <strong>{{ this.format_city_name(last_submitted_value) }}</strong> you want to search for:</h3>
    <div class="divider"></div>
    <div class="below_divider">
      <div v-for="entry in this.possible_target_cities" :key="entry" @click="chosen_target(entry.value)" class ="city_choice" >
        <h4>{{entry.description}}</h4>
      </div>
    </div>
  </div>

  <div id="buddy_match_info" v-if="match_found">
    <h3 class="above_divider"><strong>{{ target_city_label }}</strong> is buddies with <strong>{{ buddy_city_label }}</strong></h3>
    <div class="divider"></div>
    <div class="below_divider">
      <h4>Population of {{target_city_label}}, {{target_city_country}}: <strong>{{target_pop}}</strong></h4>
      <h4>Population of {{buddy_city_label}}, {{buddy_city_country}}: <strong>{{buddy_pop}}</strong></h4>
    </div>
  </div>
  
  <div :class="{ invisible: hide_map }" id="map"></div>


  

</template>

<script>

const axios = require("axios");
const wbk = require("wikibase-sdk")

// import the list of city names that don't follow normal capitalization rules
import exceptions_list from '../public/exceptions.json'

// making sure the map and the layer that contains the map's markers are global so that they can be reffered to by any function
var map
var layerGroup

export default {
  name: 'App',
  data () {
    return {

       // value of the text currently in the input box
      input_value: "",

      // the most recent value submitted by the user
      last_submitted_value: '',

      // the list of city entries whose name matches the inputted 'target' city
      possible_target_cities: [],

      // the name of the 'target' city (With accents and correct capitalization, regardless of what the user inputted)
      target_city_label: "",
      // the name of the city who is 'buddies' (closest in population to) the target city
      buddy_city_label: "",

      // entries include the id and population
      target_city_entry: null,
      buddy_city_entry: null,

      target_city_country: null,
      buddy_city_country: null,

      // true if we are seeing the screen where the user has to choose among multiple cities with the same name
      disambiguation: false,
      // true if we are seeing the screen that tells the user who the buddy is
      match_found: false,

      hide_map: true,

      // true if the user has just inputted a value that does not coorespond to any city
      city_not_found: false,
      
      cities_list: [],

      // true if the list of cities sorted by population has not been generated yet
      list_loading: true
    }
  },
  methods: {
    // method called when the user clicks the 'search for buddy' button
    async input_submit() {

      var input = this.input_value

      // look for any cities that share a name with the imputted value.
      this.possible_target_cities = await this.find_possible_matches(input)
      this.input_value = ""
      this.city_not_found = false
      this.last_submitted_value = input

      // if there were no cities found with the same name, show a message stating that the city couldn't be found
      if (this.possible_target_cities.length == 0) {
        this.city_not_found = true
        this.match_found = false
        this.hide_map = true
        await this.reset_map()
      }

      // if there is only one city found with the same name, automatically choose that city as the target and search for its buddy
      else if (this.possible_target_cities.length == 1) {
        this.hide_map = true
        await this.reset_map()
        await this.chosen_target(this.possible_target_cities[0]["value"])
        
      }

      // if there are multiple cities found with the same name, allow the user to select which one they want before searching for a buddy
      else {
        this.disambiguation = true
        this.match_found = false
        this.hide_map = true
        await this.reset_map()
      }
      
    },

    // method called when a target city is chosen, 
    // either automatically because there was only one city that matched the inputted name,
    // or manually because the user selected the city from the disambiguation page
    async chosen_target(target_id) {

      this.target_city_label = await this.id_to_label(target_id)
   
      this.disambiguation = false
      this.buddy_city_entry = await this.find_buddy(target_id)
      var buddy_id = this.buddy_city_entry["value"]
      this.buddy_city_label = await this.id_to_label(buddy_id)

      this.match_found = true
      this.target_city_country = await this.id_to_country(target_id)

      this.buddy_city_country = await this.id_to_country(this.buddy_city_entry["value"])

      this.hide_map = false
      await this.add_markers()
    },

    // Given a string, output all the cities with a label or alternate label that matches the input
    async find_possible_matches(target_label) {

      // since case insensitive searching in sparql takes too much time, 
      // normalize the input with capitalization rules
      var label_formatted = this.format_city_name(target_label)

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
      
      var result = await this.submit_query(query)

      // remove duplicate cities from the result
      var no_dupes = await this.delete_dupes(result)
      return no_dupes
    },

    // method called when the exact target city id is known and the program wants to find that city's buddy.
    async find_buddy(target_id) {
      let buddy_entry = null

      // update the target_city_entry to the entry that contains the city id
      const target_city_entry = Object.values(this.cities_list).filter(entry => String(entry["value"]) == String(target_id))[0]
      this.target_city_entry = target_city_entry

      // find the index of the target city entry in the list of all the city entries
      const target_city_index = this.cities_list.indexOf(target_city_entry)

      // edge cases for when the city is at the from or back of the list and only has one neighbor.
      if (target_city_index == 0) {
        buddy_entry = this.cities_list[1]
      }
      else if (target_city_index == this.cities_list.length - 1) {
        buddy_entry = this.cities_list[this.cities_list.length - 2]
      }
      else {

        // if the city is not at the very front or very back of the list, then it has two possible buddies:
        // the two city entries adjacent to it. Find which of these two neighbors is closest in population
        // to the target city -> that is the buddy.
        const bigger_neighbor_index = target_city_index + 1
        const smaller_neighbor_index = target_city_index - 1
    
        const bigger_neighbor_entry = this.cities_list[bigger_neighbor_index]
        const smaller_neighbor_entry = this.cities_list[smaller_neighbor_index]

        const target_city_pop = parseInt(target_city_entry["population"])
        const bigger_neighbor_pop = parseInt(bigger_neighbor_entry["population"])
        const smaller_neighbor_pop = parseInt(smaller_neighbor_entry["population"])

        const bigger_neighbor_diff = bigger_neighbor_pop - target_city_pop
        const smaller_neighbor_diff = target_city_pop - smaller_neighbor_pop

        if (bigger_neighbor_diff < smaller_neighbor_diff) {
            buddy_entry = bigger_neighbor_entry
        }
        else{
            buddy_entry = smaller_neighbor_entry
        }
        
      }
      return buddy_entry
    },

    // get a list of all the cities from wikidata, without removing duplicate entries.
    // cities without a population, without a point in time associated with that population, 
    // or with a point in time earlier that 2000 are excluded.
    // Sort these cities by the date at which their population was recorded so that when we remove duplicates,
    // we keep the most recent population from every city.
    async get_cities_dupes() {
      var query = `SELECT DISTINCT ?city ?cityPopulation WHERE { 
                  ?city wdt:P31/wdt:P279* wd:Q515 . 
                  ?city p:P1082 ?populationStatement . 
                  ?populationStatement ps:P1082 ?cityPopulation.
                  ?populationStatement pq:P585 ?date
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
                  FILTER("2000-01-01"^^xsd:dateTime <= ?date)

                } 

                ORDER BY DESC(?date)`
                // this code excludes cities that don't have a label, although it makes the program run more slowly.
                  // filter exists {                          
                  //   ?city rdfs:label ?enLabel .                    
                  //   filter(langMatches(lang(?enLabel),"en"))   
                  // }

      var result = await this.submit_query(query)
      return result
    },

    // deletes duplicates from the list that get_cities_dupes() returns
    // by only taking the first instance of every id in the list, only the most recent population record is saved,
    // since the list is sorted by population date.
    async delete_dupes(list_with_dupes) {

      var list_no_dupes = []
      var cities_added = []

      for (let i = 0; i < list_with_dupes.length; i++) {
        var entry = list_with_dupes[i]
        if (!cities_added.includes(entry["city"]["value"])) {
          cities_added.push(entry["city"]["value"])
          list_no_dupes.push(entry["city"])
        } 
      }
      return list_no_dupes
          
    },

    // get the latitude and longitude of a city given its ID.
    async id_to_latlong(target_id) {
      var query = `SELECT ?city ?long ?lat
                  WHERE
                  {
                  VALUES ?city { wd:${target_id}} 
                  ?city p:P625 ?coordinate.
                  ?coordinate psv:P625 ?coordinate_node.
                  ?coordinate_node wikibase:geoLongitude ?long.
                  ?coordinate_node wikibase:geoLatitude ?lat.  
                  }`
      var result = await this.submit_query(query)
      return L.latLng(result[0]["lat"], result[0]["long"])
    },

    // When the user makes a new search, call this function to re-center the map and get rid of the old buddy markers.
    async reset_map() {
      layerGroup.clearLayers()
      map.setView([0, 0], 2)
    },

    // get the name of the country a city is in given the city's ID
    async id_to_country(target_id) {
      var query = `SELECT DISTINCT ?countryLabel {
                  VALUES ?city { wd:${target_id}} 
                  ?city wdt:P17 ?country .
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                  }`
      var result = await this.submit_query(query)
      return result[0]["countryLabel"]

    }, 

    // get the name of a city given its ID
    async id_to_label(target_id) {
      var query = `SELECT DISTINCT ?cityLabel {
                    VALUES ?city { wd:${target_id}} 
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
      var result = await this.submit_query(query)
      return result[0]["cityLabel"]
    }, 

    // submit a SPARQL query and return the result.
    async submit_query(sparql) {
      const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

      const url = wdk.sparqlQuery(sparql)
      const results = await axios.get(url)
      let simplifiedResults = wbk.simplify.sparqlResults(results.data)
      return simplifiedResults
    },

    // add markers on the map at the locations of the target and buddy cities
    async add_markers() {
      let target_latlong = await this.id_to_latlong(this.target_city_entry["value"])
      let buddy_latlong = await this.id_to_latlong(this.buddy_city_entry["value"])
      var t_marker = L.marker(target_latlong).addTo(layerGroup);
      var b_marker = L.marker(buddy_latlong).addTo(layerGroup);
      t_marker.bindTooltip(this.target_city_label, {permanent: true, offset: [0, 0] });
      b_marker.bindTooltip(this.buddy_city_label, {permanent: true, offset: [0, 0] });
      
    },

    // sorts a list of all the cities by population
    async sort_by_pop(cities_list) {
      cities_list.sort(
        (first, second) => { 
          return this.remove_euro_format(first.population) - this.remove_euro_format(second.population) }
      );
    return cities_list
    },

    // get the list of all the cities. Each entry includes the ID and population.
    async get_cities_list() {
      var cities_dupes = await this.get_cities_dupes()
      var cities_no_dupes = await this.delete_dupes(cities_dupes)
      var cities_pop_sorted = await this.sort_by_pop(cities_no_dupes)
      return cities_pop_sorted

    },

    // another attempt to remove cities without an english label - also takes too long.

    // remove_unlabeled(list) {
    //   var new_list = []
    //   for (let i = 0; i < list.length; i++) {
    //     var element = list[i]
    //     if (!(String(element).charAt[0] == 'Q' && !isNaN(String(element).charAt[1]))){
    //       new_list.push(element)
    //     }
    //   }
    //   return new_list
    // },

    // correctly format the name of a city according to capitalization rules
    format_city_name(str) {

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
    },

    // many of the cities have populations where decimal points replace commas
    // this function takes those numbers that JS assumed were floats and translates them back into integers
    remove_euro_format(num) {
      var num_str = String(num)

      if (num_str.includes(".")) {
        var num_array = num_str.split(".")
        var arr_len = num_array.length
        var digits_in_last_chunk = num_array[arr_len - 1].length
        var zeros_needed = 3 - digits_in_last_chunk
        var zeros = "0".repeat(zeros_needed)
        var last_chunk_updated = num_array[arr_len - 1].concat(zeros)
        num_array[arr_len - 1] = last_chunk_updated
        var final_str = num_array.join('')
        return final_str
      }
      return num
    }

  }, 
  async mounted() {
    
    this.cities_list = await this.get_cities_list()

    map = L.map('map').setView([0, 0], 2)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layerGroup = L.layerGroup().addTo(map)

    this.list_loading = false

    
  },
  computed: {
    target_pop() {
      return Number(this.remove_euro_format(this.target_city_entry["population"])).toLocaleString("en-US")
    },
    buddy_pop() {
      return Number(this.remove_euro_format(this.buddy_city_entry["population"])).toLocaleString("en-US")
    },
    input_tab_index() {
      return this.list_loading ? "-1" : "0";
    }
  }

}
</script>

