<template>

  <div id = "banner">
    <div id="banner_text">
      <h1>City Buddies</h1>
      <p style="font-size: 20px;">See which city is nearest in population to your city</p>
    </div>

    <div id="banner_form">
      <input placeholder="City name" class="form-control" :class="{ disabled_input: list_loading }" id="input_form" v-model="input_value" :tabindex=this.input_tab_index>
      <button class="btn btn-light" :class="{ disabled: list_loading }" id="input_button" @click="input_submit">Search For Buddy</button>
      <p v-if="list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
    </div>
  </div>

  <div v-if="city_not_found" id="city_not_found">
    <!-- TODO instead of last submitted value, use computed value like target_label_cap  -->
    <h3>Sorry, we couldn't find a city with the name {{ last_submitted_value }}.</h3>
  </div>

  
      
  <div id="disambiguation_info" v-if="disambiguation">
    <!-- TODO instead of last submitted value, use computed value like target_label_cap  -->
    <h3 class="above_divider">Choose which <strong>{{ last_submitted_value }}</strong> you want to search for:</h3>
    <div class="divider"></div>
    <div class="below_divider">
      <div v-for="entry in this.possible_target_cities" :key="entry" @click="chosen_target(entry.city.value)" class ="city_choice" >
        <h4>{{entry.city.description}}</h4>
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

// import cities_list from '../public/cities.json'

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
    async input_submit() {

      var input = this.input_value
      this.possible_target_cities = await this.find_possible_matches(input)
      this.input_value = ""
      this.city_not_found = false
      this.last_submitted_value = input

      if (this.possible_target_cities.length == 0) {
        this.city_not_found = true
        this.match_found = false
        this.hide_map = true
        await this.reset_map()
      }
      else if (this.possible_target_cities.length == 1) {
        this.hide_map = true
        await this.reset_map()
        await this.chosen_target(this.possible_target_cities[0]["city"]["value"])
        
      }
      else {
        this.disambiguation = true
        this.match_found = false
        this.hide_map = true
        await this.reset_map()
      }
      
    },

    async chosen_target(target_id) {

      console.log("chosen target called with id: " + String(target_id))
      this.target_city_label = await this.id_to_label(target_id)
   
      this.disambiguation = false
      this.buddy_city_entry = await this.find_buddy(target_id)
      var buddy_id = this.buddy_city_entry["value"]
      this.buddy_city_label = await this.id_to_label(buddy_id)

      this.match_found = true
      this.target_city_country = await this.id_to_country(target_id)

      console.log("target city country found: " + String(this.target_city_country))

      this.buddy_city_country = await this.id_to_country(this.buddy_city_entry["value"])
      console.log("buddy city country found: " + String(this.target_city_country))

      this.hide_map = false
      await this.add_markers()
    },

    async find_possible_matches(target_label) {
      // var label_formatted = String(target_label).charAt(0).toUpperCase() + String(target_label).slice(1).toLowerCase()
      // TODO make case insensitive searching wokr with muliple word cities


//       // TODO sort by population -->>
//       SELECT DISTINCT ?place ?placeLabel ?coords ?lat ?long {
//   VALUES ?place { wd:Q87} 
//   ?place p:P1082 ?coords_sample .
//   {
//     SELECT (MAX(?coords_stmt) AS ?coords_sample) {
//       VALUES ?place { wd:Q87} 
//          ?place p:P1082  ?coords_stmt .
//     } GROUP BY ?place
//   }
//   ?coords_sample ps:P1082 ?coords;

//   SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
// }
// ORDER BY ?placeLabel
      
      var query = `SELECT DISTINCT ?city ?cityDescription
                  WHERE
                  { 
                    ?city wdt:P31/wdt:P279* wd:Q515 
                    { ?city skos:altLabel \'${target_label}\'@en }
                    UNION
                    { ?city rdfs:label \'${target_label}\'@en }
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }

                  } `

      
      var result = await this.submit_query(query)
      console.log("poss matches: " + JSON.stringify(result))
      return result
    },

    async find_buddy(target_id) {
      console.log("find buddy called with id "+ JSON.stringify(target_id))
      let buddy_entry = null

      const target_city_entry = Object.values(this.cities_list).filter(entry => String(entry["value"]) == String(target_id))[0]
      console.log(JSON.stringify(target_city_entry))
      this.target_city_entry = target_city_entry
      

      const target_city_index = this.cities_list.indexOf(target_city_entry)
      console.log("target index " + String(target_city_index))

      if (target_city_index == 0) {
        buddy_entry = this.cities_list[1]
      }
      else if (target_city_index == this.cities_list.length - 1) {
        buddy_entry = this.cities_list[this.cities_list.length - 2]
      }
      else {
        console.log("middle of the list")
        const bigger_neighbor_index = target_city_index + 1
        const smaller_neighbor_index = target_city_index - 1
    
        const bigger_neighbor_entry = this.cities_list[bigger_neighbor_index]
        const smaller_neighbor_entry = this.cities_list[smaller_neighbor_index]

        console.log("big " + JSON.stringify(bigger_neighbor_entry))
        console.log("small " + JSON.stringify(smaller_neighbor_entry))

        const target_city_pop = parseInt(target_city_entry["population"])
        const bigger_neighbor_pop = parseInt(bigger_neighbor_entry["population"])
        const smaller_neighbor_pop = parseInt(smaller_neighbor_entry["population"])

        console.log("target pop " + String(target_city_pop))
        console.log("big pop " + String(bigger_neighbor_pop))
        console.log("small pop " + String(smaller_neighbor_pop))

        const bigger_neighbor_diff = bigger_neighbor_pop - target_city_pop
        const smaller_neighbor_diff = target_city_pop - smaller_neighbor_pop

        console.log("bigger diff " + String(bigger_neighbor_diff))
        console.log("smaller diff " + String(smaller_neighbor_diff))

        if (bigger_neighbor_diff < smaller_neighbor_diff) {
            console.log("bigger is buddy")
            buddy_entry = bigger_neighbor_entry
        }
        else{
          console.log("smaller is buddy")
            buddy_entry = smaller_neighbor_entry
        }
        
      }
      console.log("buddy entry: " + JSON.stringify(buddy_entry))
      return buddy_entry
    },

    async get_cities_dupes() {
      console.log("get cities dupes called")
      var query = `SELECT DISTINCT ?city ?cityPopulation WHERE { 
                  ?city wdt:P31/wdt:P279* wd:Q515 . 
                  ?city p:P1082 ?populationStatement . 
                  ?populationStatement ps:P1082 ?cityPopulation.
                  ?populationStatement pq:P585 ?date
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } 

                ORDER BY DESC(?date)`

      var result = await this.submit_query(query)
      return result
    },

    async delete_dupes(list_with_dupes) {

      console.log("delete dupes called")

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

    async id_to_latlong(target_id) {
      console.log("id to latlong called with id: " + String(target_id))
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

    async reset_map() {
      layerGroup.clearLayers()
      map.setView([0, 0], 2)
    },

    async id_to_country(target_id) {
      console.log("id to country called with id " + String(target_id) )
      var query = `SELECT DISTINCT ?countryLabel {
                  VALUES ?city { wd:${target_id}} 
                  ?city wdt:P17 ?country .
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                  }`
      var result = await this.submit_query(query)
      return result[0]["countryLabel"]

    }, 

    async id_to_label(target_id) {
      console.log("id_to_label called with id: " + String(target_id))
      var query = `SELECT DISTINCT ?cityLabel {
                    VALUES ?city { wd:${target_id}} 
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
      console.log("query sent: " + query)
      var result = await this.submit_query(query)
      return result[0]["cityLabel"]
    }, 


    async submit_query(sparql) {
      console.log("submit query called with sparql: " + String(sparql))
      const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

      const url = wdk.sparqlQuery(sparql)
      console.log('url: ' + String(url))
      const results = await axios.get(url)
      console.log("results: " + JSON.stringify(results))
      let simplifiedResults = wbk.simplify.sparqlResults(results.data)
      console.log("simp results: " + JSON.stringify(simplifiedResults))
      return simplifiedResults
    },

    async add_markers() {
      let target_latlong = await this.id_to_latlong(this.target_city_entry["value"])
      let buddy_latlong = await this.id_to_latlong(this.buddy_city_entry["value"])
      var t_marker = L.marker(target_latlong).addTo(layerGroup);
      var b_marker = L.marker(buddy_latlong).addTo(layerGroup);
      t_marker.bindTooltip(this.target_city_label, {permanent: true, offset: [0, 0] });
      b_marker.bindTooltip(this.buddy_city_label, {permanent: true, offset: [0, 0] });
      
    },

    async sort_by_pop(cities_list) {
      cities_list.sort(
        (first, second) => { 
          // TODO fix the stupid european decimals!!!!!!!!!
          return first.population - second.population }
      );
    return cities_list
    },

    async get_cities_list() {
      var cities_dupes = await this.get_cities_dupes()
      console.log("cities_dupes: " + cities_dupes.length)
      var cities_no_dupes = await this.delete_dupes(cities_dupes)
      var cities_pop_sorted = await this.sort_by_pop(cities_no_dupes)
      console.log("no dupes pop sorted: " + cities_pop_sorted.length)
      return cities_pop_sorted

    }

  }, 
  async mounted() {
    
    this.cities_list = await this.get_cities_list()
    console.log(this.cities_list)

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
      return Number(this.target_city_entry["population"]).toLocaleString("en-US")
    },
    buddy_pop() {
      return Number(this.buddy_city_entry["population"]).toLocaleString("en-US")
    },
    target_label_cap() {
      return String(this.target_city_label).charAt(0).toUpperCase() + String(this.target_city_label).slice(1)
    },
    input_tab_index() {
      return this.list_loading ? "-1" : "0";
    }
  }

}
</script>