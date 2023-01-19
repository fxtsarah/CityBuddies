<template>

  <input v-model="input_value">
  <button @click="submit">Search For Buddy</button>
      
  <div v-if="disambiguation">
    <h1>Choose which {{ target_city_label }} you want to search for:</h1>
    <ul>
      <li v-for="entry in this.possible_target_cities" :key="entry" @click="find_buddy(entry.city)">
        <h3>{{entry.cityDescription}}</h3>
      </li>
    </ul>
  </div>

  <div v-if="search_active">
    <h1>{{ target_city_label }} is buddies with {{ buddy_city_label }}</h1>
    <h2>Population of {{target_city_label}}: {{target_city_entry.cityPopulation}}</h2>
    <h2>Population of {{buddy_city_label}}: {{buddy_city_entry.cityPopulation}}</h2>
     
  </div>
  

</template>

<script>

const axios = require("axios");
const wbk = require("wikibase-sdk")
import cities_list from '../public/cities.json'


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
      search_active: false
      


    }
  },
  methods: {
    async submit() {
      
      this.search_active = false
      this.target_city_label = this.input_value
      this.input_value = ""
      this.disambiguation = true
      this.possible_target_cities = await this.find_possible_matches(this.target_city_label)
    },

    async find_buddy(target_id) {

      console.log("find buddy called on: " + target_id)
   
      this.disambiguation = false
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

      this.buddy_city_entry = buddy_entry
      this.buddy_city_label = buddy_entry["cityLabel"]
      this.search_active = true
    },

    async find_possible_matches(target_label) {
  
      const filtered_list = Object.values(cities_list).filter(entry => String(entry["cityLabel"]) == String(target_label))
      return filtered_list
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

    // async id_to_label(target_id) {
    //   var result = await this.submit_query(`SELECT  *
    //   WHERE {
    //     wd:${target_id} rdfs:label ?label .
    //     FILTER (langMatches( lang(?label), "EN" ) )
    //   } 
    //   LIMIT 1`)
    //   return result[0]["city"]["label"]
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

    async submit_query(sparql) {
      const wdk = wbk({
        instance: 'https://www.wikidata.org',
        sparqlEndpoint: 'https://query.wikidata.org/sparql'
        })

      const url = wdk.sparqlQuery(sparql)

      const results = await axios.get(url)
      let simplifiedResults = wbk.simplify.sparqlResults(results.data);
      return simplifiedResults
    }

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
