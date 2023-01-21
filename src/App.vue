<template>

  <div id = "banner">
    <div id="banner_text">
      <h1>City Buddies</h1>
      <p style="font-size: 20px;">See which city is nearest in population to your city</p>
    </div>

    <div id="banner_form">
      <input placeholder="City name" class="form-control" id="input_form" v-model="input_value" style="max-width: 300px; margin: auto;;">
      <button class="btn btn-light" id="input_button" @click="input_submit">Search For Buddy</button>
    </div>
  </div>

  <div v-if="city_not_found" id="city_not_found">
    <h3>Sorry, we couldn't find a city with the name {{ target_label_cap }}.</h3>
  </div>

  
      
  <div id="disambiguation_info" v-if="disambiguation">
    <h3 class="above_divider">Choose which <strong>{{ target_label_cap }}</strong> you want to search for:</h3>
    <div class="divider"></div>
    <div class="below_divider">
      <div v-for="entry in this.possible_target_cities" :key="entry" @click="chosen_target(entry.city)" class ="city_choice" >
        <h4>{{entry.cityDescription}}</h4>
      </div>
    </div>
  </div>

  <div id="buddy_match_info" v-if="match_found">
    <h3 class="above_divider"><strong>{{ target_city_entry["cityLabel"] }}</strong> is buddies with <strong>{{ buddy_city_label }}</strong></h3>
    <div class="divider"></div>
    <div class="below_divider">
      <h4>Population of {{target_city_entry["cityLabel"]}}, {{target_city_country}}: <strong>{{target_pop}}</strong></h4>
      <h4>Population of {{buddy_city_entry["cityLabel"]}}, {{buddy_city_country}}: <strong>{{buddy_pop}}</strong></h4>
    </div>
    <h4 v-if="markers_loading" id="markers_loading"><i>City markers are loading, please wait...</i></h4>
  </div>
  
  <div :class="{ invisible: hide_map }" id="map"></div>


  

</template>

<script>

const axios = require("axios");
const wbk = require("wikibase-sdk")

// currently importing a sorted list of cities from the local directory instead of getting them directly from wikidata
import cities_list from '../public/cities.json'

// making sure the map and the layer that contains the map's markers are global so that they can be reffered to by any function
var map;
var layerGroup

export default {
  name: 'App',
  data () {
    return {

       // value of the text currently in the input box
      input_value: "",

            // the list of city entries whose name matches the inputted 'target' city

      possible_target_cities: [],

      // the name of the 'target' (inputted and submitted) city
      target_city_label: "",
      // the name of the city who is 'buddies' (closest in population to) the target city
      buddy_city_label: "",

      // entries include the city name, id, description, and population
      target_city_entry: null,
      buddy_city_entry: null,

      target_city_country: null,
      buddy_city_country: null,

      // true if we are seeing the screen where the user has to choose among multiple cities with the same name
      disambiguation: false,
      // true if we are seeing the screen that tells the user who the buddy is
      match_found: false,

      hide_map: true,

      // true if the city markers on the map are in the process of loading
      markers_loading: false,

      // true if the user has just inputted a value that does not coorespond to any city
      city_not_found: false
      


    }
  },
  methods: {
    async input_submit() {

      var res = await this.get_cities_dupes()

      
      var input = this.input_value
      
      this.markers_loading = false
      this.possible_target_cities = await this.find_possible_matches(input)
      this.input_value = ""
      this.city_not_found = false
      this.target_city_label = input

      if (this.possible_target_cities.length == 0) {
        this.city_not_found = true
        this.match_found = false
        this.hide_map = true
        await this.reset_map()
      }
      else if (this.possible_target_cities.length == 1) {
        this.hide_map = true
        await this.reset_map()
        await this.chosen_target(this.possible_target_cities[0]["city"])
        
      }
      else {
        this.disambiguation = true
        this.match_found = false
        this.hide_map = true
        await this.reset_map()
      }

      
    },

    async chosen_target(target_id) {
   
      this.disambiguation = false
      this.buddy_city_entry = await this.find_buddy(target_id)
      this.buddy_city_label = this.buddy_city_entry["cityLabel"]
      this.match_found = true
      this.target_city_country = await this.id_to_country(target_id)
      this.buddy_city_country = await this.id_to_country(this.buddy_city_entry["city"])
      this.markers_loading = true
      this.hide_map = false
      await this.add_markers()
      this.markers_loading = false
    },

    async find_possible_matches(target_label) {
      
      const filtered_list = Object.values(cities_list).filter(entry => String(entry["cityLabel"]).localeCompare(String(target_label), 'en', { sensitivity: 'base' }) == 0)
      return filtered_list
    },

    async find_buddy(target_id) {
      let buddy_entry = null

      const target_city_entry = Object.values(cities_list).filter(entry => String(entry["city"]) == String(target_id))[0]
      this.target_city_entry = target_city_entry

      const target_city_index = cities_list.indexOf(target_city_entry)

      if (target_city_index == 0) {
        buddy_entry = cities_list[1]
      }
      else if (target_city_index == cities_list.length - 1) {
        buddy_entry = cities_list[cities_list.length - 2]
      }
      else {
        const bigger_neighbor_index = target_city_index - 1
        const smaller_neighbor_index = target_city_index + 1
    
        const bigger_neighbor_entry = cities_list[bigger_neighbor_index]
        const smaller_neighbor_entry = cities_list[smaller_neighbor_index]

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

    // async get_cities_list() {
    //   let new_list = await this.submit_query(
    //     `SELECT distinct ?city ?cityLabel ?cityDescription ?country ?population WHERE{  
    //       ?city wdt:P31/wdt:P279* wd:Q515;
    //         wdt:P17 ?country;
    //         wdt:P1082 ?population.
    //       SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }    
    //     }
    //     ORDER BY DESC(?population)`)
    //   return new_list
    // },

    async get_cities_dupes() {
      console.log("get cities dupes called")
      var query = `SELECT DISTINCT ?city  WHERE { 
  ?city wdt:P31/wdt:P279* wd:Q515 . 
  ?city p:P1082 ?populationStatement . 
  ?populationStatement ps:P1082 ?cityPopulation.
  ?populationStatement pq:P585 ?date
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } 

ORDER BY DESC(?date)`

      var result = await this.submit_query(query)
      console.log(result)
      return result
    },

    // async id_to_desc(target_id) {
    //   console.log("id_to_desc called with id:" + target_id)
    //   var id = target_id.substring(31)
    //   var result = await this.submit_query(`SELECT DISTINCT ?description {
    //                                           ?city wdt:P31/wdt:P279* wd:Q515 ;
    //                                           schema:description ?description.
    //                                           FILTER(LANG(?description) = "en")
    //                                           FILTER ( ?city = wd:${id} ) 
    //                                           } LIMIT 1`)
    //   return result
    // }, 

    async id_to_latlong(target_id) {
      var id = target_id.substring(31)
      var result = await this.submit_query(`SELECT DISTINCT ?lat ?long {
                                        ?city wdt:P31/wdt:P279* wd:Q515 ;
                                              p:P625 ?coords_sample .
                                        {
                                          SELECT (SAMPLE(?coords_stmt) AS ?coords_sample) {
                                            ?city wdt:P31/wdt:P279* wd:Q515  ;
                                                  p:P625 ?coords_stmt .
                                          } GROUP BY ?city
                                        }
                                        ?coords_sample ps:P625 ?coords;
                                                      psv:P625 [
                                                        wikibase:geoLatitude ?lat;
                                                        wikibase:geoLongitude ?long
                                                      ] .
                                        FILTER ( ?city = wd:${id}  ) 
                                        
                                      }`)
      return L.latLng(result[0]["lat"], result[0]["long"])
    },

    async reset_map() {
      layerGroup.clearLayers()
      map.setView([0, 0], 2)
    },

    async id_to_country(target_id) {
      var id = target_id.substring(31)
      var result = await this.submit_query(`SELECT DISTINCT ?countryLabel {
                                          ?city wdt:P31/wdt:P279* wd:Q515 ;
                                          wdt:P17 ?country .
                                          FILTER ( ?city = wd:${id}  ) 
                                          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                                          }`)
      return result[0]["countryLabel"]

    }, 


    

    async submit_query(sparql) {
      const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

      const url = wdk.sparqlQuery(sparql)
      const results = await axios.get(url)
      let simplifiedResults = wbk.simplify.sparqlResults(results.data);
      return simplifiedResults
    },

    async add_markers() {
      
      let target_latlong = await this.id_to_latlong(this.target_city_entry["city"])
      let buddy_latlong = await this.id_to_latlong(this.buddy_city_entry["city"])
      var t_marker = L.marker(target_latlong).addTo(layerGroup);
      var b_marker = L.marker(buddy_latlong).addTo(layerGroup);
      t_marker.bindTooltip(this.target_city_entry["cityLabel"], {permanent: true, className: "my-label", offset: [0, 0] });
      b_marker.bindTooltip(this.buddy_city_entry["cityLabel"], {permanent: true, className: "my-label", offset: [0, 0] });
      
    },

  }, 
  mounted() {
    

    map = L.map('map').setView([0, 0], 2)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layerGroup = L.layerGroup().addTo(map)

    
  },
  computed: {
    target_pop() {
      return Number(this.target_city_entry["cityPopulation"]).toLocaleString("en-US")
    },
    buddy_pop() {
      return Number(this.buddy_city_entry["cityPopulation"]).toLocaleString("en-US")
    },
    target_label_cap() {
      return String(this.target_city_label).charAt(0).toUpperCase() + String(this.target_city_label).slice(1)
    }
  }

}
</script>