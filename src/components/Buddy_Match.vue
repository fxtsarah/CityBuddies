<template>
 <div id="buddy_match_info" v-if="active">
    <h3 class="above_divider"><strong>{{ target_label }}</strong> is buddies with <strong>{{ buddy_label }}</strong></h3>
    <div class="divider"></div>
    <div class="below_divider">
      <h4>Population of {{target_label}}, {{target_country}}: <strong>{{target_pop}}</strong></h4>
      <h4>Population of {{buddy_label}}, {{buddy_country}}: <strong>{{buddy_pop}}</strong></h4>
    </div>
  </div>
</template>

<script>

const axios = require("axios");
const wbk = require("wikibase-sdk")

export default {
  name: 'Buddy_Match',
  props: {
    // entry has id and population
    active: {
      type: Boolean
    },
    target_entry: {
      type: Object
    },
    buddy_entry: {
      type: Object
    }
  },
  data () {
    return {
        target_label: "",
        target_country: "",

        buddy_label: "",
        buddy_country: "",
    }
  },
  methods: {
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
    // get the name of a city given its ID
    async id_to_label(target_id) {
      var query = `SELECT DISTINCT ?cityLabel {
                    VALUES ?city { wd:${target_id}} 
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                    }`
      var result = await this.submit_query(query)
      return result[0]["cityLabel"]
    }, 
    async id_to_country(target_id) {
      var query = `SELECT DISTINCT ?countryLabel {
                  VALUES ?city { wd:${target_id}} 
                  ?city wdt:P17 ?country .
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                  }`
      var result = await this.submit_query(query)
      return result[0]["countryLabel"]
    }

  },
  computed: {
    target_id() { this.target_entry.value },
    buddy_id() { this.buddy_entry.value },
    target_pop() {
      return Number(this.remove_euro_format(this.target_entry["population"])).toLocaleString("en-US")
    },
    buddy_pop() {
      return Number(this.remove_euro_format(this.buddy_entry["population"])).toLocaleString("en-US")
    },
    
  },
  async mounted() {
    // this.target_label = await this.id_to_label(this.target_id)
    // this.target_country = await this.id_to_country(this.target_id)
    // this.buddy_label = await this.id_to_label(this.buddy_id)
    // this.buddy_country = await this.id_to_country(this.buddy_id)

    // console.log("target_label: " + target_label)
    // console.log("target_country: " + target_country)
    // console.log("buddy_label: " + buddy_label)
    // console.log("buddy_country: " + buddy_country)
  },
  watch: {
    async target_entry(new_entry, old_entry) {
      this.target_label = await this.id_to_label(new_entry.value)
      this.target_country = await this.id_to_country(new_entry.value)
      console.log("target_label: " + this.target_label)
      console.log("target_country: " + this.target_country)
    },

    async buddy_entry(new_entry, old_entry) {
      this.buddy_label = await this.id_to_label(new_entry.value)
      this.buddy_country = await this.id_to_country(new_entry.value)
      console.log("buddy_label: " + this.buddy_label)
      console.log("buddy_country: " + this.buddy_country)
    }
  
}
}
</script>