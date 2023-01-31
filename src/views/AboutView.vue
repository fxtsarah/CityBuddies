<template>
  <div class="about">
    
    <Banner :list_loading="false" :include_form="false" />
    <div id="about_info">
      <h5>This web app determines which city is the closest to another in terms of population.</h5>
      <br>
      <h5><strong>How to Use:</strong></h5>
      <h5>On the home page, input the name of a city into the 'City name' search bar.<br>
      If there are multiple cities with the given name, 
      you will be asked to choose which city you would like to search for by clicking on the city's description.</h5>
      <br>
      <h5><strong>How It's Made:</strong></h5>
      <h5>Every time the homepage is loaded, a query is made to <a href="https://www.wikidata.org/wiki/Wikidata:Main_Page">Wikidata</a>
      that returns the list of all the cities in its database, as well as their populations. <br>
      This list allows the 'buddy' - the city with the closest population to another - to be calculated. <br>
      Once the buddy is found, another query to wikidata is sent to ask for the location of both the inputted city and the buddy. Those locations are used by <a href="https://leafletjs.com/">Leaflet</a> to show where the cities are on a map.
     </h5>
    </div>
  </div>
</template>

<script setup >
import Banner from "../components/Banner.vue"


</script>

<style>

#about_info{
  text-align: left;
  padding: 30px;
  margin-top: 8px;

}

a {
  color: #519872;
}

</style>

