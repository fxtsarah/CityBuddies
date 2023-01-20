<template>

  <h1>City Buddies</h1>
  <p>Find out which city has the closest population to your city</p>

  <input v-model="input_value">
  <button @click="submit">Search For Buddy</button>
      
  <div v-if="disambiguation">
    <h1>Choose which {{ target_city_label }} you want to search for:</h1>
      <div v-for="entry in this.possible_target_cities" :key="entry" @click="chosen_target(entry.city)" class ="city_choice" >
        <h3>{{entry.cityDescription}}</h3>
      </div>
  </div>

  <div v-if="search_active">
    <h1>{{ target_city_label }} is buddies with {{ buddy_city_label }}</h1>
    <h2>Population of {{target_city_label}}: {{target_city_entry.cityPopulation}}</h2>
    <h2>Population of {{buddy_city_label}}: {{buddy_city_entry.cityPopulation}}</h2>
     
  </div>
  

  <div :class="{ invisible: hide_map }" id="map"></div>


  

</template>

<script>

const axios = require("axios");
const wbk = require("wikibase-sdk")
import cities_list from '../public/cities.json'
var map;
var layerGroup

export default {
  name: 'App',
  data () {
    return {
      input_value: "",

      possible_target_cities: [],

      target_city_label: "",
      buddy_city_label: "",

      target_city_entry: null,
      buddy_city_entry: null,

      disambiguation: false,
      search_active: false,

      hide_map: true
      


    }
  },
  methods: {
    async submit() {
      var input = this.input_value
      
      this.possible_target_cities = await this.find_possible_matches(input)
      this.input_value = ""
      if (this.possible_target_cities.length == 0) {
        alert("No cities with that name found")
      }
      else if (this.possible_target_cities.length == 1) {
        this.target_city_label = input
        this.hide_map = true
        await this.remove_markers()
        await this.chosen_target(this.possible_target_cities[0]["city"])
        
      }
      else {
        this.target_city_label = input
        this.disambiguation = true
        this.search_active = false
        this.hide_map = true
        await this.remove_markers()
      }

      
    },

    async chosen_target(target_id) {
   
      this.disambiguation = false
      this.buddy_city_entry = await this.find_buddy(target_id)
      this.buddy_city_label = this.buddy_city_entry["cityLabel"]
      this.search_active = true
      this.hide_map = false
      await this.add_markers()
    },

    async find_possible_matches(target_label) {
  
      const filtered_list = Object.values(cities_list).filter(entry => String(entry["cityLabel"]) == String(target_label))
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

      async id_to_long(target_id) {
      console.log("id_to_long called with id:" + target_id)
      var id = target_id.substring(31)
      var result = await this.submit_query(`SELECT DISTINCT ?long {
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
                                                        wikibase:geoLongitude ?long
                                                      ] .
                                        FILTER ( ?city = wd:${id}  ) 
                                        
                                        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                                      }`)
      console.log(result[0]["long"])
      return result[0]["long"]
    }, 

    async id_to_lat(target_id) {
      console.log("id_to_lat called with id:" + target_id)
      var id = target_id.substring(31)
      var result = await this.submit_query(`SELECT DISTINCT ?lat {
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
                                                      ] .
                                        FILTER ( ?city = wd:${id}  ) 
                                        
                                        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                                      }`)
      console.log(result[0]["lat"])
      return result[0]["lat"]

    }, 

    async remove_markers() {
      layerGroup.clearLayers();
      
    },


    

    async submit_query(sparql) {
      const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

      const url = wdk.sparqlQuery(sparql)
      console.log("url query: " + sparql)

      const results = await axios.get(url)
      let simplifiedResults = wbk.simplify.sparqlResults(results.data);
      console.log("got back: " + JSON.stringify(simplifiedResults))
      return simplifiedResults
    },

    async add_markers() {
      
      let target_long = await this.id_to_long(this.target_city_entry["city"])
      let target_lat = await this.id_to_lat(this.target_city_entry["city"])
      let buddy_long = await this.id_to_long(this.buddy_city_entry["city"])
      let buddy_lat = await this.id_to_lat(this.buddy_city_entry["city"])
      var t_marker = L.marker(L.latLng(target_lat, target_long)).addTo(layerGroup);
      var b_marker = L.marker(L.latLng(buddy_lat, buddy_long)).addTo(layerGroup);
      t_marker.bindTooltip(this.target_city_label, {permanent: true, className: "my-label", offset: [0, 0] });
      b_marker.bindTooltip(this.buddy_city_label, {permanent: true, className: "my-label", offset: [0, 0] });
      
    }

  }, 
  mounted() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layerGroup = L.layerGroup().addTo(map);
  }

}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #023C36;
  /* margin-top: 60px; */
  
  padding-bottom: 60px;
  padding-top: 60px;
}

#map { 
  display: block;
  height: 500px; 
  max-height: 500px; 
  margin-top: 60px;
  margin-left: 60px;
  margin-right: 60px;
  overflow: hidden
  }


body {
  background-color: #E4E0F5;
}

.city_choice:hover {
  color: #04776B;
}

.invisible {
  visibility: hidden
}


</style>
