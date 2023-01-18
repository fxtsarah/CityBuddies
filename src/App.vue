<template>

  <input v-model="input_value">
  <button @click="submit">Search For Buddy</button>
      
  <div v-if="disambiguation">
    <h1> Choose which {{ target_city_label }} you want to search for: </h1>
    <ul>
      <li v-for="entry in possible_target_cities" :key="entry" @click="find_buddy(entry.city.value)">
        <h3>{{entry.city.description}}</h3>
      </li>
    </ul>
  </div>

  <h1 v-if="search_active"> {{ target_city_label }} is buddies with {{ buddy_city_label }} </h1> 

</template>

<script>

const axios = require("axios");
const wbk = require("wikibase-sdk")
import test from '../public/test.json'


export default {
  name: 'App',
  data () {
    return {
      input_value: "",
      target_city_label: "",
      buddy_city_label: "",
      disambiguation: false,
      possible_target_cities: [],
      target_city_entry: null,
      buddy_city_entry: null,
      search_active: false,
      cities_list: []
    }
  },
  methods: {
    async submit() {

      this.get_list()
      if (!this.cities_list.length) {
        this.cities_list = await this.get_cities_list()
      }
      
      this.search_active = false
      this.target_city_label = this.input_value
      this.input_value = ""
      this.disambiguation = true
      this.possible_target_cities = await this.find_possible_matches(this.target_city_label)
    },

    async find_buddy(target_id) {
   
      this.disambiguation = false
      let buddy_entry = ""
      // const cities_list = [
      //   {
      //     city: {
      //       value: 'Q59173',
      //       label: 'Huizhou',
      //       description: 'prefecture-level city in Guangdong, China'
      //     },
      //     country: 'Q148',
      //     population: 6042852
      //   },
      //   {
      //     city: {
      //       value: 'Q87',
      //       label: 'Alexandria',
      //       description: 'second largest city in Egypt'
      //     },
      //     country: 'Q79',
      //     population: 4870000
      //   },
      //   {
      //     city: {
      //       value: 'Q88',
      //       label: 'Alexandria',
      //       description: 'city in the state of Virginia, United States'
      //     },
      //     country: 'Q30',
      //     population: 159467
      //   }
      // ]

      const target_city_entry = Object.values(this.cities_list).filter(entry => String(entry["city"]["value"]) == String(target_id))[0]
      const target_city_index = this.cities_list.indexOf(target_city_entry)

      if (target_city_index == 0) {
        buddy_entry = this.cities_list[1]
      }
      else if (target_city_index == this.cities_list.length - 1) {
        buddy_entry = this.cities_list[this.cities_list.length - 2]
      }
      else {
        const bigger_neighbor_index = target_city_index - 1
        const smaller_neighbor_index = target_city_index + 1
    
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
      this.buddy_city_entry = buddy_entry

      let buddy_label = buddy_entry["city"]["label"]
      
      this.buddy_city_label = buddy_label
      this.search_active = true
    },

    async find_possible_matches(target_label) {
      // const cities_list = [
      //   {
      //     city: {
      //       value: 'Q59173',
      //       label: 'Huizhou',
      //       description: 'prefecture-level city in Guangdong, China'
      //     },
      //     country: 'Q148',
      //     population: 6042852
      //   },
      //   {
      //     city: {
      //       value: 'Q87',
      //       label: 'Alexandria',
      //       description: 'second largest city in Egypt'
      //     },
      //     country: 'Q79',
      //     population: 4870000
      //   },
      //   {
      //     city: {
      //       value: 'Q88',
      //       label: 'Alexandria',
      //       description: 'city in the state of Virginia, United States'
      //     },
      //     country: 'Q30',
      //     population: 159467
      //   }
      // ]
  
      const filtered_list = Object.values(this.cities_list).filter(entry => String(entry["city"]["label"]) == String(target_label))
      return filtered_list
    },

    async get_cities_list() {
      let new_list = await this.submit_query(
        `SELECT distinct ?city ?cityLabel ?cityDescription ?country ?population WHERE{  
          ?city wdt:P31/wdt:P279* wd:Q515;
            wdt:P17 ?country;
            wdt:P1082 ?population.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }    
        }
        ORDER BY DESC(?population)`)
      return new_list
    },

    async id_to_label(target_id) {
      var result = await this.submit_query(`SELECT  *
      WHERE {
        wd:${target_id} rdfs:label ?label .
        FILTER (langMatches( lang(?label), "EN" ) )
      } 
      LIMIT 1`)
      return result[0]["city"]["label"]
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

    async get_list() {
//         fetch ("./public/test.json")
//           .then((res) => {
//             console.log(res);
//           })
        console.log(test)
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
